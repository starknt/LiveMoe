import type { IpcMainEvent, LoadFileOptions, LoadURLOptions, Rectangle } from 'electron'
import type { IWallpaperPlayerViewConfiguration, IWallpaperPlayerWindowConfiguration } from 'electron-main/common/windowConfiguration'
import type { IWallpaperConfiguration, IWallpaperPlayProgress, IWallpaperPlayerState, IWallpaperPlayerTypes, IWallpaperPlayingConfiguration, PlayRuntimeConfiguration } from 'common/electron-common/wallpaperPlayer'
import type { IWallpaperFailLoadEvent, IWallpaperView } from 'electron-main/common/wallpaperPlayer'
import type { IWallpaperPlayerAudioChangeEvent, IWallpaperPlayerDisabledChangeEvent, IWallpaperPlayerLoopChangeEvent, IWallpaperPlayerPlayFailEvent, IWallpaperPlayerVolumeChangeEvent } from 'common/electron-common/wallpaperPlayerWindow'
import type { IDisposable } from 'common/electron-common/base/lifecycle'
import { Emitter, Event } from 'common/electron-common/base/event'
import { dev, linux, macOS, win } from 'common/electron-common/environment'
import { BrowserView, ipcMain } from 'electron'
import { WallpaperPlayerViewConfiguration, WallpaperPlayerWindowConfiguration } from 'electron-main/common/windowConfiguration'
import { validateWallpaperConfiguration } from 'electron-main/common/wallpaperPlayer'
import { resolveWallpaperHtmlPath } from 'electron-main/utils'
import { toDisposable } from 'common/electron-common/base/lifecycle'
import WallpaperPlayerMsgProcess from 'electron-main/core/wallpaperPlayer/wallpaperPlayerMsgProcess'
import { TimerHelper } from 'electron-main/common/timer'
import BasePlayerWindow from './base/basePlayerWindow'

class WallpaperPlayerView implements IWallpaperView {
  private readonly _view: BrowserView

  private readonly _onWallpaperInitalize = new Emitter<void>()

  readonly onInitalize = this._onWallpaperInitalize.event

  readonly onDidFinshLoad: Event<void>

  readonly onDidFailLoad: Event<IWallpaperFailLoadEvent>

  constructor(
    options: IWallpaperPlayerViewConfiguration,
    private readonly bounds: Rectangle,
  ) {
    this._view = new BrowserView(options)
    this.initalize()

    this._view.setBackgroundColor('#003C3F41')

    this.onDidFinshLoad = Event.fromNodeEventEmitter<void>(
      this._view.webContents,
      'did-finish-load',
    )

    this.onDidFailLoad = Event.fromNodeEventEmitter<IWallpaperFailLoadEvent>(
      this._view.webContents,
      'did-fail-load',
      (_event, errorCode: number, errorDescription: string) => {
        return {
          errorCode,
          errorDescription,
        }
      },
    )
  }

  initalize() {
    this._view.setBounds(this.bounds)
    this._view.setAutoResize({
      width: true,
      height: true,
      vertical: true,
      horizontal: true,
    })
  }

  get view() {
    return this._view
  }

  get id() {
    return this._view.webContents.id
  }

  send(channel: string, ...args: unknown[]) {
    this._view.webContents.send(channel, ...args)
  }

  seek(time: number) {
    this.send('ipc:video:progress', { currentTime: time })
  }

  loadURL(url: string): Promise<void>
  loadURL(url: string, options: LoadURLOptions): Promise<void>
  loadURL(url: string, options?: LoadURLOptions) {
    return this._view.webContents.loadURL(url, options)
  }

  loadFile(filePath: string): Promise<void>
  loadFile(filePath: string, options: LoadFileOptions): Promise<void>
  loadFile(filePath: string, options?: LoadFileOptions): Promise<void> {
    return this._view.webContents.loadFile(filePath, options)
  }

  setMute(value: boolean) {
    this._view.webContents.setAudioMuted(value)
  }

  get mute() {
    return this._view.webContents.audioMuted
  }

  public destroy() {
    this._view.webContents.removeAllListeners('did-finish-load')
    this._view.webContents.removeAllListeners('did-fail-load')
  }
}

export default class WallpaperPlayerWindow extends BasePlayerWindow {
  private readonly _hWnd: number = Number(
    this.getNativeWindowHandle().readBigInt64LE(),
  )

  private _playReady = false

  private readonly messageProcess = new WallpaperPlayerMsgProcess(this._hWnd)

  private readonly views: [WallpaperPlayerView, WallpaperPlayerView]

  private readonly playReadyEmitter = new Emitter<void>()

  private readonly pauseEmitter = new Emitter<IWallpaperConfiguration>()

  private readonly playEmitter = new Emitter<IWallpaperConfiguration>()

  private readonly playRestoreEmitter = new Emitter<void>()

  private readonly didFailEmitter
    = new Emitter<IWallpaperPlayerPlayFailEvent>()

  private readonly progressEmitter
    = new Emitter<IWallpaperPlayingConfiguration>()

  private readonly endedEmitter = new Emitter<void>()

  private readonly didLoadFailEmitter = new Emitter<IWallpaperFailLoadEvent>()

  private readonly didLoadFinshEmitter = new Emitter<void>()

  private readonly disabledEmitter
    = new Emitter<IWallpaperPlayerDisabledChangeEvent>()

  private readonly volumeEmitter
    = new Emitter<IWallpaperPlayerVolumeChangeEvent>()

  private readonly loopEmitter = new Emitter<IWallpaperPlayerLoopChangeEvent>()

  private readonly audioMuteEmitter
    = new Emitter<IWallpaperPlayerAudioChangeEvent>()

  private readonly destroyEmitter = new Emitter<void>()

  readonly onVolumeChange = this.volumeEmitter.event

  readonly onAudioMuteChange = this.audioMuteEmitter.event

  readonly onProgress = this.progressEmitter.event

  readonly onEnded = this.endedEmitter.event

  readonly onDisbaledChange = this.disabledEmitter.event

  readonly onDestroy = this.destroyEmitter.event

  readonly onPlayChange = this.playEmitter.event

  readonly onDidPlayFail = this.didFailEmitter.event

  readonly onPause = this.pauseEmitter.event

  readonly onPlayRestore = this.playRestoreEmitter.event

  readonly onDidLoadFail = this.didLoadFailEmitter.event

  readonly onDidLoadFinsh = this.didLoadFinshEmitter.event

  readonly onPlayReady = this.playReadyEmitter.event

  private cancelTokenDisposable: IDisposable | undefined = undefined

  private _type: IWallpaperPlayerTypes = 1

  private _seekProgress = false

  private _progress: IWallpaperPlayProgress | null = null

  private _activeView = 0

  private _activeWalpaper: IWallpaperConfiguration | null = null

  private _cursor = 0

  private _disabled = false

  private _mute = false

  private _volume = 40

  private _state: IWallpaperPlayerState = 'pending'

  private _loop = false

  private _mutePlay = false

  private _isSetupDesktop = false

  private _htmlProgress: TimerHelper.PausableIntervalTimer | null = null

  private _htmlEnded: TimerHelper.PausableTimeoutTimer | null = null

  constructor(
    private playlist: IWallpaperConfiguration[],
    private defaultState: PlayRuntimeConfiguration,
    windowOptions: IWallpaperPlayerWindowConfiguration = WallpaperPlayerWindowConfiguration,
    private readonly viewOptions: IWallpaperPlayerViewConfiguration = WallpaperPlayerViewConfiguration,
  ) {
    super(windowOptions)

    this._disabled = this.defaultState.disabled
    this._mute = this.defaultState.mute
    this._volume = this.defaultState.volume
    this._activeWalpaper = this.defaultState.wallpaperConfiguration

    this.views = [
      new WallpaperPlayerView(this.viewOptions, this.getBounds()),
      new WallpaperPlayerView(this.viewOptions, this.getBounds()),
    ]

    this.initialize()
  }

  private initialize() {
    this.setMenu(null)
    this.registerListener()

    if (linux() || macOS()) {
      this.setIgnoreMouseEvents(true, {
        forward: true,
      })
    }

    [...this.views].forEach((view) => {
      this.addBrowserView(view.view)
    })

    this._activeView = 1

    this.setupDesktop()
  }

  private registerListener() {
    this.onPlayReady(() => {
      this._playReady = true

      // ipcMain.removeAllListeners('ipc:video:progress');
      // ipcMain.removeAllListeners('ipc:video:end');
    })

    this.onPlayChange(({ rawConfiguration }) => {
      this._state = 'play'

      if (this._htmlProgress) {
        this._htmlProgress.dispose()
        this._htmlProgress = null
      }

      if (this._htmlEnded) {
        this._htmlEnded.dispose()
        this._htmlEnded = null
      }

      if (rawConfiguration.type === 1)
        return

      const total = 60 * 1000 * 5 // 5 minute
      let now = 0

      if (!this._htmlProgress) {
        this._htmlProgress = new TimerHelper.PausableIntervalTimer(1000, () => {
          now += 1000

          this.progressEmitter.fire({
            totalTime: total / 1000,
            nowTime: now / 1000,
            ended: false,
          })
        })
      }

      if (!this._htmlEnded) {
        this._htmlEnded = new TimerHelper.PausableTimeoutTimer(total, () => {
          this.endedEmitter.fire()

          if (this._htmlProgress && this._htmlEnded) {
            this._htmlProgress.restore()
            this._htmlEnded.restore()
          }
        })
      }
    })

    this.onPause(() => {
      this._state = 'pause'
      if (this._htmlEnded)
        this._htmlEnded.pause()
      if (this._htmlProgress)
        this._htmlProgress.pause()
    })

    const progressEvent
      = Event.fromNodeEventEmitter<IWallpaperPlayingConfiguration>(
        ipcMain,
        'ipc:video:progress',
        (_e, progress: IWallpaperPlayProgress) => {
          const { currentTime, duration } = progress

          if (!this._seekProgress)
            this._progress = { currentTime, duration }

          if (this._seekProgress && this._progress) {
            const view = this.getTopView()
            view.seek(this._progress.currentTime)
            this._seekProgress = false
            this._progress.duration = duration

            return {
              totalTime: duration,
              nowTime: this._progress.currentTime,
              ended: false,
            }
          }

          return { totalTime: duration, nowTime: currentTime, ended: false }
        },
      )

    const endEvent = Event.fromNodeEventEmitter<IWallpaperPlayingConfiguration>(
      ipcMain,
      'ipc:video:end',
    )

    progressEvent((playingConfiguration) => {
      this.progressEmitter.fire(playingConfiguration)
    })

    endEvent(() => {
      this.endedEmitter.fire()
    })

    this.onDisbaledChange((disabled) => {
      if (!disabled && this.cancelTokenDisposable) {
        this.cancelTokenDisposable.dispose()
        this.cancelTokenDisposable = undefined
      }
    })
  }

  async play(): Promise<void>
  async play(wConfiguration: IWallpaperConfiguration): Promise<void>
  async play(cursor: number): Promise<void>
  async play(argv?: IWallpaperConfiguration | number) {
    if (typeof argv === 'object') {
      const cursor = this.getWallpaperCursor(argv)
      if (cursor !== -1)
        this.setCursor(cursor)

      this._activeWalpaper = argv
    }

    if (typeof argv === 'number') {
      const rest = await this.setCursor(argv)

      if (!rest)
        await this.next()
    }

    if (!this._activeWalpaper) {
      const result = await this.next()

      if (!result) {
        this.didFailEmitter.fire({
          errorCode: 100,
          errorDesc: 'WallpaperPlayerWindow play failed',
        })
        return
      }
    }

    this._playReady = false

    const view = this.toggleView()

    if (!(await validateWallpaperConfiguration(this._activeWalpaper!)))
      await this.next()

    if (this._activeWalpaper?.rawConfiguration?.type === 1) {
      this._type = 1
      view.loadURL(resolveWallpaperHtmlPath('video'))
    }
    else if (this._activeWalpaper) {
      this._type = 2
      view.loadURL(this._activeWalpaper.playPath)
    }

    view.onDidFinshLoad(() => {
      this.didLoadFinshEmitter.fire()

      view.send('lm:wallpaper:init', {
        src: this._activeWalpaper?.playPath,
      })

      setTimeout(() => this.setTopBrowserView(view.view))

      if (!this.isVisible())
        this.show()

      view.send('ipc:mute', this.mute && this.mutePlay)

      // if (this._mutePlay) view.send('ipc:mute', true);

      setTimeout(() => this.playReadyEmitter.fire())

      if (this._activeWalpaper)
        this.playEmitter.fire(this._activeWalpaper)
    })

    view.onDidFailLoad(({ errorCode, errorDescription }) => {
      this.didLoadFailEmitter.fire({ errorCode, errorDescription })
      this.next()
      this.toggleView()
    })
  }

  async pause() {
    await this.whenPlayReady()

    ipcMain.removeAllListeners('ipc:wp:stop:canceltoken')

    return new Promise<Function>((resolve) => {
      if (this._activeWalpaper)
        this.pauseEmitter.fire(this._activeWalpaper)

      const view = this.getTopView()

      if (this._type === 1) {
        resolve(() => {
          view.send('ipc:video:play')
          if (this._htmlEnded) {
            this._htmlEnded.dispose()
            this._htmlEnded = null
          }

          if (this._htmlProgress) {
            this._htmlProgress.dispose()
            this._htmlProgress = null
          }

          this.playRestoreEmitter.fire()
        })

        view.send('ipc:video:pause')
      }
      else {
        const cancelToken = Event.fromNodeEventEmitter(
          ipcMain,
          'ipc:wp:stop:canceltoken',
          (event: IpcMainEvent) => event,
        )

        view.send('ipc:wp:stop')

        cancelToken((e) => {
          resolve(() => {
            if (this._htmlEnded && this._htmlProgress) {
              this._htmlEnded.reset()
              this._htmlProgress.reset()
            }
            this.playRestoreEmitter.fire()
            ipcMain.removeAllListeners('ipc:wp:stop:canceltoken')
            e.returnValue = ''
          })
        })
      }
    })
  }

  private toggleView() {
    const view = this.getTopView()
    view.loadURL(resolveWallpaperHtmlPath('transparent'))

    this._activeView = this._activeView === 0 ? 1 : 0
    return this.views[this._activeView]
  }

  private getTopView() {
    return this.views[this._activeView]
  }

  async next() {
    if (this.playlist.length <= 0)
      return null

    if (this._cursor + 1 >= this.playlist.length)
      this._cursor = 0
    else
      this._cursor += 1

    this._activeWalpaper = this.playlist[this._cursor]

    return this._activeWalpaper
  }

  async prev() {
    if (this.playlist.length <= 0)
      return null

    if (this._cursor - 1 < 0)
      this._cursor = this.playlist.length - 1
    else
      this._cursor -= 1

    this._activeWalpaper = this.playlist[this._cursor]

    return this._activeWalpaper
  }

  getWallpaperCursor(configuration: IWallpaperConfiguration) {
    for (let i = 0; i < this.playlist.length; i += 1) {
      const _configuration = this.playlist[i]

      if (_configuration.playPath === configuration.playPath)
        return i
    }

    return -1
  }

  set configuration(configuration: IWallpaperConfiguration) {
    this._activeWalpaper = configuration
  }

  get configuration() {
    return this._activeWalpaper as IWallpaperConfiguration
  }

  get progress(): IWallpaperPlayingConfiguration {
    const { currentTime, duration } = <IWallpaperPlayProgress> this._progress

    return { nowTime: currentTime, totalTime: duration, ended: false }
  }

  async setMute(value: boolean) {
    await this.whenPlayReady()

    this._mute = value

    const view = this.getTopView()

    view.setMute(this._mute)

    this.audioMuteEmitter.fire({ mute: value })
  }

  get mute() {
    return this._mute
  }

  get isAudioMute() {
    const view = this.getTopView()

    return this.mute && view.mute
  }

  async setVolume(value: number) {
    if (value < 0)
      return

    if (value > 100)
      value = value % 100

    const oVolume = this._volume
    this._volume = value
    const view = this.getTopView()

    await this.whenPlayReady()

    view.send('ipc:volume', this._volume / 100)
    this.volumeEmitter.fire({
      oVolume,
      nVolume: value,
    })
  }

  get volume() {
    return this._volume
  }

  get state() {
    return this._state
  }

  async setMutePlay(value: boolean) {
    this._mutePlay = value

    await this.whenPlayReady()

    if (this._state === 'play') {
      const view = this.getTopView()
      view.send('ipc:mute', this._mutePlay)
    }
  }

  get mutePlay() {
    return this._mutePlay
  }

  async setCursor(cursor: number) {
    if (cursor >= 0 && cursor < this.playlist.length) {
      this._cursor = cursor
      this._activeWalpaper = this.playlist[this._cursor]
      return true
    }

    return false
  }

  get cursor() {
    return this._cursor
  }

  async setLopp(value: boolean) {
    this._loop = value

    await this.whenPlayReady()
  }

  get loop() {
    return this._loop
  }

  private setupDesktop() {
    if (win() && !this._isSetupDesktop) {
      const windowTools = dev() ? require('win-func-tools') : __non_webpack_require__('win-func-tools')
      windowTools.SetWindowInWorkerW(this._hWnd)
      this._isSetupDesktop = true
    }
  }

  async addWallpaper2Playlist(
    wallpaper: IWallpaperConfiguration | IWallpaperConfiguration[],
  ) {
    if (Array.isArray(wallpaper))
      this.playlist.push(...wallpaper)
    else
      this.playlist.push(wallpaper)
  }

  async removeWallpaperFromPlaylist(id: string) {
    this.playlist = this.playlist.filter(wallpaper => wallpaper.id !== id)
  }

  /**
   * @param {number} time 跳转播放进度
   */
  async seek(time: number) {
    await this.whenPlayReady()

    this._progress = {
      currentTime: time,
      duration: -1,
    }

    this._seekProgress = true
  }

  async disable() {
    if (this._disabled)
      return
    this._disabled = true

    const cancelToken = await this.pause()

    this.hide()
    setTimeout(() => this.messageProcess.kill())
    if (win()) {
      const windowTools = dev() ? require('win-func-tools') : __non_webpack_require__('win-func-tools')
      setTimeout(() => windowTools.RestoreWorkerW())
    }
    this._isSetupDesktop = false

    this.disabledEmitter.fire({ disabled: this._disabled })

    const disposable = toDisposable(() => {
      cancelToken()
    })

    this.cancelTokenDisposable = disposable
  }

  async enable() {
    if (!this._disabled)
      return
    this._disabled = false

    if (this.cancelTokenDisposable)
      this.cancelTokenDisposable.dispose()

    this.disabledEmitter.fire({ disabled: this._disabled })

    this.setupDesktop()
    setTimeout(() => this.show())
    setTimeout(() => this.messageProcess.setup())
  }

  async whenPlayReady() {
    if (this._playReady)
      return Promise.resolve()

    return Event.toPromise(this.onPlayReady)
  }

  async destroy() {
    this.destroyEmitter.fire()
    const timer = setTimeout(() => {
      this.messageProcess.destroy()

      this.views.forEach((view) => {
        view.destroy()
      })

      this.audioMuteEmitter.dispose()
      this.volumeEmitter.dispose()
      this.didLoadFailEmitter.dispose()
      this.didLoadFinshEmitter.dispose()
      this.didFailEmitter.dispose()
      this.destroyEmitter.dispose()
      this.playEmitter.dispose()
      this.pauseEmitter.dispose()
      this.progressEmitter.dispose()
      this.endedEmitter.dispose()
      this.disabledEmitter.dispose()
      this.playReadyEmitter.dispose()
      this.playRestoreEmitter.dispose()
      this.loopEmitter.dispose()

      clearTimeout(timer)

      super.destroy()
    })
  }
}
