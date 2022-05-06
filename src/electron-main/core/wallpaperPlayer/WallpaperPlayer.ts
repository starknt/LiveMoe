import applicationLogger from 'common/electron-common/applicationLogger'
import { Emitter, Event } from 'common/electron-common/base/event'
import type { IWallpaperPlayerPlayListChangeEvent } from 'common/electron-common/wallpaperPlayer'
import { DEFAULT_CONFIGURATION, DEFAULT_PLAY_RUNTIME_CONFIGURATION, type IWallpaperConfiguration, type IWallpaperPlayProgress, type IWallpaperPlayerConfiguration, type IWallpaperPlayerMode, type PlayRuntimeConfiguration } from 'common/electron-common/wallpaperPlayer'
import type { IPCMainServer } from 'common/electron-main'
import { type IWallpaperFailLoadEvent, type IWallpaperPlayer, validateWallpaperConfiguration } from 'electron-main/common/wallpaperPlayer'
import WallpaperPlayerWindow from 'electron-main/windows/wallpaperPlayerWindow'
import { type Display, globalShortcut, ipcMain, screen } from 'electron'
import { dev, win } from 'common/electron-common/environment'
import { screenWatcher } from 'electron-main/observables/screen.observable'
import type { IWallpaperPlayerAudioChangeEvent, IWallpaperPlayerDisabledChangeEvent, IWallpaperPlayerLoopChangeEvent, IWallpaperPlayerVolumeChangeEvent } from 'common/electron-common/wallpaperPlayerWindow'
import { lockScreenWatcher, unLockScreenWatcher } from 'electron-main/observables/power.observable'
import { debounce } from 'common/electron-common/base/functional'
import type Application from 'electron-main/Application'
import { type EventPreloadType, WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import { Service } from 'common/electron-common'
import type { DocRes } from 'common/electron-common/database'
import { reactive } from 'common/electron-common/reactive'
import { QueryUserState } from 'electron-main/observables/user.observable'
import type { IWallpaperChangeEvent } from './wallpaperResouceLoader'

export default class WallpaperPlayer implements IWallpaperPlayer {
  private readonly channelName = 'lm:wallpaper:player'

  private readonly namespace = 'lm:wallpaper-player'

  private readonly dbNamespace = this.application.context.core.getNameSpace(
    this.namespace,
  )

  private configuration!: IWallpaperPlayerConfiguration

  private rtConfiguration!: PlayRuntimeConfiguration

  private electronScreen: Display | null = null

  private isLocked = false

  private backgroundPause = false

  private isReady = false

  private defaultDisabled = false

  private window!: WallpaperPlayerWindow

  private cancelPauseToken: (() => void) | null = null

  private readonly playlist: IWallpaperConfiguration[] = []

  private readonly service = new Service()

  private readonly readyEmitter = new Emitter<void>()

  private readonly playEmitter = new Emitter<IWallpaperConfiguration>()

  private readonly pauseEmitter = new Emitter<void>()

  private readonly progressEmitter = new Emitter<IWallpaperPlayProgress>()

  private readonly endedEmitter = new Emitter<void>()

  private readonly volumeEmitter
    = new Emitter<IWallpaperPlayerVolumeChangeEvent>()

  private readonly onLoopChangeEmitter
    = new Emitter<IWallpaperPlayerLoopChangeEvent>()

  private readonly onAudioMuteChangeEmitter
    = new Emitter<IWallpaperPlayerAudioChangeEvent>()

  private readonly onDisableChangeEmitter
    = new Emitter<IWallpaperPlayerDisabledChangeEvent>()

  private readonly didLoadFailEmitter = new Emitter<IWallpaperFailLoadEvent>()

  private readonly didLoadFinshEmiiter = new Emitter<void>()

  private readonly closeEmitter = new Emitter<void>()

  private readonly destroyEmitter = new Emitter<void>()

  private readonly onPlayListChangeEmitter = new Emitter<IWallpaperPlayerPlayListChangeEvent>()

  private readonly onViewMode = Event.fromNodeEventEmitter(
    ipcMain,
    'lm:wallpaper:viewMode',
    (_event, x: number, y: number) => ({
      x,
      y,
    }),
  )

  readonly onReady = this.readyEmitter.event

  readonly onPlayChanged = this.playEmitter.event

  readonly onPaused = this.pauseEmitter.event

  readonly onProgress = this.progressEmitter.event

  readonly onDidLoadFail = this.didLoadFailEmitter.event

  readonly onDidLoadFinsh = this.didLoadFinshEmiiter.event

  readonly onDisableChange = this.onDisableChangeEmitter.event

  readonly onVolumeChange = this.volumeEmitter.event

  readonly onAudioMuteChange = this.onAudioMuteChangeEmitter.event

  readonly onLoopChange = this.onLoopChangeEmitter.event

  readonly onEnded = this.endedEmitter.event

  readonly onClosed = this.closeEmitter.event

  readonly onDestroy = this.destroyEmitter.event

  readonly onPlayListChange = this.onPlayListChangeEmitter.event

  constructor(
    private readonly application: Application,
    private readonly server: IPCMainServer,
  ) {}

  async initalize() {
    await this.initDatabase()

    this.registerListener()

    // 注册服务
    this.initalizeService()
  }

  private async initDatabase() {
    // 初始化数据库
    let configuration = await this.dbNamespace.get('configuration')

    /**
     * 如果数据库中没有配置，则使用默认配置
     * 对于前端界面来说, 其实我们并不关心配置是否是持久化的, 我们只需要提供播放器最新的状态即可
     * , 对于某几个需要进行持久化的配置, 我们只需要定期同步到数据库中即可
     */
    let rtConfiguration = await this.dbNamespace.get('rt-Configuration')
    if (rtConfiguration) {
      await this.dbNamespace.put({
        _id: 'rt-configuration',
        data: DEFAULT_PLAY_RUNTIME_CONFIGURATION,
        _rev: rtConfiguration._rev,
      })
    }
    else {
      rtConfiguration = (await this.dbNamespace.put({
        _id: 'rt-configuration',
        data: DEFAULT_PLAY_RUNTIME_CONFIGURATION,
      })) as DocRes
    }

    this.rtConfiguration = DEFAULT_PLAY_RUNTIME_CONFIGURATION

    if (!configuration) {
      await this.dbNamespace.put({
        _id: 'configuration',
        data: DEFAULT_CONFIGURATION,
      })
    }

    configuration = (await this.dbNamespace.get('configuration'))!

    this.configuration = configuration.data
    this.rtConfiguration.mute = this.configuration.mute
    this.rtConfiguration.volume = this.configuration.volume
    this.rtConfiguration.mode = this.configuration.mode
    this.rtConfiguration.disabled = this.configuration.disabled
    this.rtConfiguration.userSettings = this.configuration.userSettings
    this.rtConfiguration.viewMode = this.configuration.viewMode
    this.rtConfiguration.wallpaperConfiguration
      = this.configuration.wallpaper.configuration

    this.rtConfiguration = reactive(this.rtConfiguration, {
      set: (target, key, value) => {
        Reflect.set(target, key, value)
        this.updateRuntimeConfiguration()
        this.handleUpdateConfiguration(key, value)

        return true
      },
    })
  }

  private handleUpdateConfiguration(key: string | symbol, value: any) {
    switch (key) {
      case 'mute':
        this.configuration.mute = value
        break
      case 'volume':
        this.configuration.volume = value
        break
      case 'mode':
        this.configuration.mode = value
        break
      case 'disabled':
        this.configuration.disabled = value
        break
      case 'viewMode':
        this.configuration.viewMode = value
        break
      case 'userSettings':
        this.configuration.userSettings = value
        break
      case 'wallpaperConfiguration':
        this.configuration.wallpaper = {
          ...this.configuration.wallpaper,
          configuration: this.rtConfiguration.wallpaperConfiguration,
        }
        break
      default:
        break
    }

    this.updatePersistentConfiguration()
  }

  private updatePersistentConfiguration() {
    this.dbNamespace
      .get('configuration')
      .then((res) => {
        this.dbNamespace.put({
          _id: 'configuration',
          data: this.configuration,
          _rev: res?._rev,
        })
      })
      .catch(err => console.error(err))
  }

  private async updateRuntimeConfiguration() {
    // TODO: 这里这么写只是为了获得一个设置更新的EventEmitter, 后面可以优化
    this.dbNamespace
      .get('rt-configuration')
      .then(async(rtConfiguration) => {
        await this.dbNamespace.put({
          _id: 'rt-configuration',
          data: this.rtConfiguration,
          _rev: rtConfiguration?._rev,
        })
      })
      .catch(err => console.error(err))
  }

  private async dispatchCallerWindowMessage(preload: EventPreloadType) {
    await this.whenReady()

    switch (preload.event) {
      case 'mute':
        this.mute()
        return true
      case 'sound':
        this.sound()
        return true
      case 'next':
        this.next()
        return true
      case 'prev':
        this.prev()
        return true
      case 'pause':
        this.pause()
        return true
      case 'play':
        if (typeof preload.arg === 'object' && preload.arg)
          this.play(preload.arg)
        else
          this.play()
        return true
      case 'disable':
        this.disable()
        return true
      case 'enable':
        this.enable()
        return true
      case 'volume':
        if (typeof preload.arg === 'number') {
          this.window.setVolume(preload.arg)
          return true
        }

        return false
      case 'seek':
        if (typeof preload.arg === 'number') {
          this.window.seek(preload.arg)
          return true
        }

        return false
      case 'toggle':
        if (this.rtConfiguration.status === 'playing')
          this.pause()
        else
          this.play()

        return true
      case 'playlist':
        return this.playlist

      case 'mode':
        if (typeof preload.arg === 'string')
          this.mode(preload.arg as IWallpaperPlayerMode)

        return true

      case 'configuration': {
        if (typeof preload.arg === 'object') {
          // TODO: 待优化
          this.rtConfiguration = reactive(preload.arg, {
            set: (target, key, value) => {
              Reflect.set(target, key, value)
              this.updateRuntimeConfiguration()
              this.handleUpdateConfiguration(key, value)

              return true
            },
          })

          this.configuration.disabled = this.rtConfiguration.disabled
          this.configuration.mute = this.rtConfiguration.mute
          this.configuration.volume = this.rtConfiguration.volume
          this.configuration.mode = this.rtConfiguration.mode
          this.configuration.userSettings = this.rtConfiguration.userSettings
          this.configuration.viewMode = this.rtConfiguration.viewMode
          this.configuration.wallpaper = {
            ...this.configuration.wallpaper,
            configuration: this.rtConfiguration.wallpaperConfiguration,
          }

          this.updateRuntimeConfiguration()
          this.updatePersistentConfiguration()
          return true
        }

        return this.rtConfiguration
      }
      default:
        return false
    }
  }

  private dispatchListenWindowMessage(preload: EventPreloadType) {
    switch (preload.event) {
      case 'play':
        return this.onPlayChanged
      case 'mute':
        return this.onAudioMuteChange
      case 'sound':
        return this.onAudioMuteChange
      case 'next':
        return this.onPlayChanged
      case 'prev':
        return this.onPlayChanged
      case 'pause':
        return this.onPaused
      case 'disable':
        return this.onDisableChange
      case 'progress':
        return this.onProgress
      case 'configuration': {
        return Event.map(
          Event.filter(this.dbNamespace.changes(), (change) => {
            return change.id === 'rt-configuration'
          }),
          (change) => {
            if (change.doc)
              return Reflect.get(change.doc, 'data')

            return null
          },
        )
      }
      case 'playlist':
        return this.onPlayListChange
      default:
        return Event.None
    }
  }

  private async registerListener() {
    if (!this.electronScreen)
      this.electronScreen = screen.getPrimaryDisplay()

    screenWatcher((e) => {
      this.electronScreen = e.display
    })

    QueryUserState((userState) => {
      if (
        userState
        && this.rtConfiguration.userSettings.background === 'pause'
        && !this.cancelPauseToken
        && !this.rtConfiguration.disabled
      ) {
        this.pause()
        this.backgroundPause = true
      }
      else if (this.backgroundPause && !userState) {
        this.play()
        this.backgroundPause = false
      }
    })

    unLockScreenWatcher(() => {
      this.isLocked = false
      this.enable()
    })

    lockScreenWatcher(() => {
      this.isLocked = true
      // 当屏幕处于锁定状态时, 需要停止壁纸运行, 否则更容易会导致DWN内存泄漏
      this.disable()
    })

    this.onReady(() => {
      this.isReady = true

      this.handleReady()
    })

    this.onPlayListChange((event) => {
      switch (event.type) {
        case 'added':
          this.playlist.push(event.configuration!)
          this.window.addWallpaper2Playlist(event.configuration!)
          break
        case 'deleted': {
          const index = this.playlist.findIndex(configuration => configuration.id === event.id)
          if (index !== -1)
            this.playlist.splice(index, 1)
          this.window.removeWallpaperFromPlaylist(event.id!)
        }
          break
        default:
          break
      }
    })

    // 准备加载壁纸
    this.application.context.lifecycle.onBeforeLoad(() => {
      applicationLogger.info('准备加载壁纸壁纸资源')
    })

    this.application.context.lifecycle.onLoad(() => {
      applicationLogger.info('壁纸资源加载中...')
    })

    // 壁纸资源加载完毕
    this.application.context.lifecycle.onAfterLoad((wallpapers) => {
      this.playlist.push(...wallpapers)
      this.initWallpaperWindow()
    })
  }

  private handleReady() {
    this.window.onPlayRestore(() => {
      this.rtConfiguration.status = 'playing'
    })

    this.window.onPlayChange(
      debounce<(e: IWallpaperConfiguration) => void>((configuration) => {
        if (this.cancelPauseToken)
          this.cancelPauseToken()

        this.rtConfiguration.wallpaperConfiguration = configuration
        this.rtConfiguration.status = 'playing'

        const t = setTimeout(() => {
          clearTimeout(t)
          this.playEmitter.fire(configuration)
        })
      }, 100),
    )

    this.window.onPause(() => {
      this.rtConfiguration.status = 'paused'
    })

    this.window.onDisbaledChange(({ disabled }) => {
      this.rtConfiguration.disabled = disabled
    })

    this.window.onProgress((playingConfiguration) => {
      // TODO: 把壁纸播放进度放到一个单独的设置中, 因为它是高频率更新的, 和其他的设置不一样
      this.progressEmitter.fire({
        currentTime: playingConfiguration.nowTime,
        duration: playingConfiguration.totalTime,
      })
    })

    this.window.onEnded(() => {
      console.log('壁纸播放结束')

      this.handleWallpaperEnded()

      this.endedEmitter.fire()
    })

    this.window.onAudioMuteChange(({ mute }) => {
      this.rtConfiguration.mute = mute
    })

    this.window.onVolumeChange(({ nVolume }) => {
      this.rtConfiguration.volume = nVolume
    })

    this.window.onModeChange((mode) => {
      this.rtConfiguration.mode = mode
    })

    this.onViewMode(
      debounce(({ x, y }: { x: number; y: number }) => {
        if (!this.rtConfiguration.viewVisible)
          return

        if (win()) {
          if (!this.electronScreen || !this.rtConfiguration.viewMode)
            return

          const windowTools = dev() ? require('win-func-tools') : __non_webpack_require__('win-func-tools')

          const { scaleFactor } = this.electronScreen

          const _x = scaleFactor * x
          const _y = scaleFactor * y

          const disabledArea = windowTools.GetSysListViewIconRect()

          for (let i = 0; i < disabledArea.length; i += 1) {
            const { left, right, bottom, top } = disabledArea[i]
            if (_x >= left && _x <= right && _y >= top && _y <= bottom)
              return
          }

          const visible = this.rtConfiguration.viewVisible

          if (visible) {
            windowTools.HideDesktopIcon()
            windowTools.HideShellWindow()
            this.rtConfiguration.viewVisible = false
          }
          else {
            windowTools.ShowShellWindow()
            windowTools.ShowDesktopIcon()
            this.rtConfiguration.viewVisible = true
          }
        }

        const result = globalShortcut.register('Ctrl+Shift+Q', () => {
          if (win()) {
            const windowTools = dev() ? require('win-func-tools') : __non_webpack_require__('win-func-tools')

            windowTools.ShowDesktopIcon()
            windowTools.ShowShellWindow()
          }

          this.rtConfiguration.viewVisible = true
          globalShortcut.unregister('Ctrl+Shift+Q')
        })

        if (!result)
          this.handleRegisterShortcutFailedWithViewMode()
      }, 200),
    )

    this.application.context.lifecycle.onChange((e) => {
      switch (e.type) {
        case 'added':
          this.handleAddedWallpaper(e)
          break
        case 'deleted':
          this.handleDeletedWallpaper(e)
          break
        default:
          break
      }
    })
  }

  private handleRegisterShortcutFailedWithViewMode() {
    if (win()) {
      const windowTools = dev() ? require('win-func-tools') : __non_webpack_require__('win-func-tools')

      windowTools.ShowDesktopIcon()
      windowTools.ShowShellWindow()
    }

    this.rtConfiguration.viewVisible = true
  }

  private handleAddedWallpaper(event: IWallpaperChangeEvent) {
    const { configuration } = event
    if (configuration) {
      this.onPlayListChangeEmitter.fire({
        type: 'added',
        configuration: configuration!,
      })
    }
  }

  private handleDeletedWallpaper(event: IWallpaperChangeEvent) {
    const { path: Path } = event

    const configuration = this.playlist.find((configuration) => {
      return configuration.resourcePath === Path
    })

    if (!configuration)
      return

    this.onPlayListChangeEmitter.fire({
      type: 'deleted',
      configuration: configuration!,
      id: configuration.id,
    })
  }

  handleWallpaperEnded() {
    switch (this.rtConfiguration.mode) {
      case 'single':
        break
      case 'list-loop':
        this.next()
        break
      case 'order':
        this.next()
        break
    }
  }

  private initalizeService() {
    this.server.registerChannel(this.channelName, this.service)

    this.application.registerEvent(this.channelName, (type, preload) => {
      switch (type) {
        case WINDOW_MESSAGE_TYPE.WINDOW_CALL:
          return this.dispatchCallerWindowMessage(preload)
        case WINDOW_MESSAGE_TYPE.WINDOW_LISTEN:
          return this.dispatchListenWindowMessage(preload)
        default:
          return Event.None
      }
    })

    this.service.registerCaller(
      WINDOW_MESSAGE_TYPE.IPC_CALL,
      async(preload: EventPreloadType) => {
        const result = await this.dispatchCallerWindowMessage(preload)

        return result
      },
    )

    this.service.registerListener(
      WINDOW_MESSAGE_TYPE.IPC_LISTEN,
      (preload: EventPreloadType) => {
        const result = this.dispatchListenWindowMessage(preload)

        return result
      },
    )
  }

  private async initWallpaperWindow() {
    applicationLogger.info('wallpaper list: ', this.playlist.length)

    this.window = new WallpaperPlayerWindow(
      this.playlist,
      this.rtConfiguration,
    )

    this.readyEmitter.fire()

    this.window.setVolume(this.rtConfiguration.volume)
    this.window.setMute(this.rtConfiguration.mute)
    this.window.mode(this.rtConfiguration.mode)

    const configuration = this.rtConfiguration.wallpaperConfiguration

    if (this.rtConfiguration.disabled) {
      if (
        configuration
        && Object.keys(configuration).length > 0
        && (await validateWallpaperConfiguration(configuration))
      )
        this.window.configuration = configuration!

      this.defaultDisabled = true
      return
    }

    if (!configuration || Object.keys(configuration).length <= 0)
      this.play()
    else if (
      configuration
      && (await validateWallpaperConfiguration(configuration))
    )
      this.play(configuration)
    else
      this.window.play(0)
  }

  private async whenReady() {
    if (this.isReady)
      return Promise.resolve()

    return Event.toPromise(this.onReady)
  }

  // #region 壁纸播放器控制

  async play(): Promise<void>
  async play(wConfiguration: IWallpaperConfiguration): Promise<void>
  async play(argv?: IWallpaperConfiguration): Promise<void> {
    /**
     * 这里禁用状态的有多个场景
     * 1. 从持久化的配置中的禁用, 也就是从初始化播放器的时候, 就禁用了
     *  1.1 从这里开始禁用的, 是没有办法单纯的通过 enable 来恢复播放的
     *  1.2 目前先新增加一个变量来描述该状态
     * 2. 初始化之后, 用户在手动禁用
     */
    if (this.isDisabled())
      return

    await this.whenReady()

    if (typeof argv === 'object')
      this.window.play(argv)
    else if (!this.cancelPauseToken)
      this.window.play()
    else
      this.cancelPauseToken()
  }

  async pause() {
    if (this.isDisabled())
      return

    await this.whenReady()

    const cancelToken = await this.window.pause()

    this.cancelPauseToken = () => {
      cancelToken()
      this.cancelPauseToken = null
    }

    this.pauseEmitter.fire()
  }

  async prev() {
    await this.whenReady()

    const configuration = await this.window.prev()
    if (configuration)
      this.window.play(configuration)
    else
      this.window.play()
  }

  async next() {
    await this.whenReady()

    const configuration = await this.window.next()
    if (configuration)
      this.window.play(configuration)
    else
      this.window.play()
  }

  async mute() {
    await this.whenReady()

    this.window.setMute(true)
  }

  async sound() {
    await this.whenReady()

    this.window.setMute(false)
  }

  async disable() {
    await this.whenReady()

    this.window.disable()
  }

  async enable() {
    await this.whenReady()

    this.window.enable()

    if (this.defaultDisabled) {
      this.window.play()
      this.defaultDisabled = false
    }
  }

  isDisabled() {
    return this.rtConfiguration.disabled
  }

  // mode
  async mode(mode: IWallpaperPlayerMode) {
    console.log('mode', mode)

    this.rtConfiguration.mode = mode

    this.window.mode(mode)
  }

  // #endregion

  destroy() {
    this.destroyEmitter.fire()

    process.nextTick(() => {
      this.readyEmitter.dispose()
      this.pauseEmitter.dispose()
      this.playEmitter.dispose()
      this.progressEmitter.dispose()
      this.endedEmitter.dispose()
      this.closeEmitter.dispose()
      this.destroyEmitter.dispose()
      this.onAudioMuteChangeEmitter.dispose()
      this.didLoadFailEmitter.dispose()
      this.didLoadFinshEmiiter.dispose()
      this.onDisableChangeEmitter.dispose()
      this.volumeEmitter.dispose()
      this.onLoopChangeEmitter.dispose()
      this.onPlayListChangeEmitter.dispose()

      /** 保存壁纸播放进度 */
      if (win()) {
        const windowTools = dev() ? require('win-func-tools') : __non_webpack_require__('win-func-tools')
        windowTools.RestoreWorkerW()
        windowTools.ShowDesktopIcon()
        windowTools.ShowShellWindow()
      }
    })
  }
}
