import { app, protocol, session } from 'electron'
import { Emitter, Event } from 'common/electron-common/base/event'
import type { IPCMainServer } from 'common/electron-main'
import type minimist from 'minimist'
import applicationLogger from 'common/electron-common/applicationLogger'
import i18next from 'i18next'
import type { EventPreloadType } from 'common/electron-common/windows'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import type { IApplicationConfiguration } from 'common/electron-common/application'
import { dev } from 'common/electron-common/environment'
import type { IApplicationContext } from './common/application'
import { DEFAULT_CONFIGURATION } from './common/application'
import WallpaperPlayer from './core/wallpaperPlayer/WallpaperPlayer'
import ApplicationTray from './core/ApplicationTray'
import MainWindow from './windows/MainWindow'
import SettingWindow from './windows/SettingWindow'
import WindowManager from './core/windowManager/WindowManager'
import { shutDownWatcher } from './observables/power.observable'
import DataBase from './core/Database'
import { resolveGlobalAssets } from './utils'
import ApplicationEventBus from './ApplicationEventBus'
import TrayWindow from './windows/TrayWindow'
import WallpaperLoader from './core/wallpaperPlayer/wallpaperResouceLoader'
import PlayerWindow from './windows/PlayerWindow'
import { AutoStartup } from './common/autoStartup'
import { setTrayVisible } from './observables/user.observable'
import Service from './core/services'
import PluginManager from './core/pluginCore/PluginManager'

/**
 * @feature 初始化应用程序
 * @feature 初始化应用程序环境
 * @feature 初始化应用程序配置
 * @feature 初始化应用程序日志 // TODO: 初始化应用程序日志
 */
export default class Application extends ApplicationEventBus {
  private readonly database = DataBase.getInstance(
    resolveGlobalAssets(),
    this.server,
    this,
  )

  configuration!: IApplicationConfiguration

  private readonly applicationNamespace
    = this.database.getNamespace('application')

  private wallpaperLoader!: WallpaperLoader

  private wallpaperPlayer!: WallpaperPlayer

  private applicationTray!: ApplicationTray

  private windowManager!: WindowManager

  pluginManager!: PluginManager

  service!: Service

  private readonly readyEmitter = new Emitter<void>()

  private readonly destroyEmitter = new Emitter<void>()

  readonly onReady = this.readyEmitter.event

  readonly onDestroy = this.destroyEmitter.event

  readonly onSecondeInstance = Event.fromNodeEventEmitter<void>(
    app,
    'second-instance',
  )

  readonly onConfigChange = Event.map(
    Event.filter(this.applicationNamespace.changes(), (doc) => {
      return doc.id === 'configuration'
    }),
    (change) => {
      if (!change.doc)
        return null

      return Reflect.get(change.doc, 'data')
    },
  )

  context!: IApplicationContext

  constructor(
    private readonly args: minimist.ParsedArgs,
    server: IPCMainServer,
  ) {
    super(server)

    this.handleArgs()
  }

  setupProtocol() {
    protocol.registerFileProtocol('file', (req, cb) => {
      const pathname = decodeURI(req.url.replace('file:///', ''))

      cb(pathname)
    })
  }

  setupGlabalPreload() {
    // TODO: 全局预加载脚本
    // const commonService = resolvePreloadPath('service');

    session.defaultSession.setPreloads([])
  }

  private async handleArgs() {
    // 处理命令行参数
    if (this.args.LiveMoe_autoStartup)
      await AutoStartup.enable()
      //
    else if (await AutoStartup.isEnable())
      AutoStartup.enable()
    else
      AutoStartup.disable()
  }

  async initalize() {
    this.setupProtocol()

    this.setupGlabalPreload()

    await this.initDatabase()

    this.initalizeService()

    this.wallpaperLoader = new WallpaperLoader(this)

    this.context = {
      gui: {
        showDialogWindow: (options) => {
          return this.windowManager.showDiglogWindow(options)
        },
      },
      core: {
        getApplicationConfiguration: () => {
          return this.configuration
        },
        showWindowById: (id: string) => {
          return this.windowManager.showWindowById(id)
        },
        registerWindow: (id, options) => {
          return this.windowManager.registerWindow(id, options)
        },
        unregisterWindow: (id) => {
          return this.windowManager.unregisterWindow(id)
        },
        getNameSpace: (spaceName) => {
          return this.database.getNamespace(spaceName)
        },
        registerService: (channelName, service) => {
          try {
            this.server.registerChannel(channelName, service)
          }
          catch (error) {
            if (dev())
              console.error(error)

            return false
          }

          return true
        },
      },
      lifecycle: {
        // TODO: 生命周期函数待实现
        onReady: this.readyEmitter.event,
        onBeforeLoad: this.wallpaperLoader.onBeforeLoad,
        onLoad: this.wallpaperLoader.onLoad,
        onAfterLoad: this.wallpaperLoader.onAfterLoad,
        onChange: this.wallpaperLoader.onChange,
        onQuit: this.onDestroy,
      },
      sendCallWindowMessage: (channelName, event, ...args) => {
        return this.sendWindowMessage(channelName, {
          type: WINDOW_MESSAGE_TYPE.WINDOW_CALL,
          event,
          arg: args,
        })
      },
      sendListenWindowMessage: (channelName, event, ...args) => {
        return this.sendWindowMessage(channelName, {
          type: WINDOW_MESSAGE_TYPE.WINDOW_LISTEN,
          event,
          arg: args,
        })
      },
      registerMessageHandler: (channelName, handler) => {
        return this.registerEvent(channelName, handler)
      },
      unregisterMessageHandler: (channelName) => {
        return this.unregisterEvent(channelName)
      },
    }

    this.service = new Service(this.context, this.server)

    this.pluginManager = new PluginManager(this.context)

    this.wallpaperPlayer = new WallpaperPlayer(this, this.server)

    await this.wallpaperPlayer.initalize()

    await this.wallpaperLoader.initalize()

    this.windowManager = new WindowManager(this, this.server)

    this.initWindows()

    this.applicationTray = new ApplicationTray(this.context, this.server)

    await this.applicationTray.initalize()

    this.registerListener()

    setTimeout(() => this.readyEmitter.fire(), 1000)
  }

  private initalizeService() {
    this.applicationService.registerCaller(
      WINDOW_MESSAGE_TYPE.IPC_CALL,
      async(preload: EventPreloadType) => {
        const result = await this.dispatchCallWindowMessage(preload)
        return result
      },
    )

    this.applicationService.registerListener(
      WINDOW_MESSAGE_TYPE.IPC_LISTEN,
      (preload: EventPreloadType) => {
        return this.dispatchListenWindowMessage(preload)
      },
    )

    this.registerEvent(this.channelName, (type, preload) => {
      switch (type) {
        case WINDOW_MESSAGE_TYPE.WINDOW_CALL:
          return this.dispatchCallWindowMessage(preload)
        case WINDOW_MESSAGE_TYPE.WINDOW_LISTEN:
          return this.dispatchListenWindowMessage(preload)
        default:
          return false ?? Event.None
      }
    })
  }

  private async dispatchCallWindowMessage(preload: EventPreloadType) {
    switch (preload.event) {
      case 'configuration':
        if (typeof preload.arg === 'object') {
          this.configuration = preload.arg
          this.updateApplicationConfiguration()
          return true
        }
        return this.configuration
      case 'quit':
        return this.quit()
      default:
        return null
    }
  }

  private dispatchListenWindowMessage(preload: EventPreloadType) {
    switch (preload.event) {
      case 'configuration':
        return this.onConfigChange
      default:
        return Event.None
    }
  }

  private registerListener() {
    this.onReady(() => {
      process.nextTick(() => {
        this.sendWindowMessage('lm:windows', {
          type: WINDOW_MESSAGE_TYPE.WINDOW_CALL,
          event: 'window',
          arg: ['main', false],
        })
      })
    })

    this.applicationTray.onShow(() => {
      setTrayVisible(true)
    })

    this.applicationTray.onHide(() => {
      setTrayVisible(false)
    })

    shutDownWatcher(() => {
      this.quit()
    })

    app.on('quit', async() => {
      this.quit()
    })

    this.onSecondeInstance(() => {
      this.sendWindowMessage('lm:windows', {
        type: WINDOW_MESSAGE_TYPE.WINDOW_CALL,
        event: 'window',
        arg: 'main',
      })
    })
  }

  private async initDatabase() {
    const applicationConfiguration
      = await this.applicationNamespace.get<IApplicationConfiguration>(
        'configuration',
      )

    if (!applicationConfiguration) {
      await this.applicationNamespace.put({
        _id: 'configuration',
        data: DEFAULT_CONFIGURATION,
      })
    }

    const configuration
      = (await this.applicationNamespace.get<IApplicationConfiguration>(
        'configuration',
      ))!

    this.configuration = configuration.data
  }

  private initWindows() {
    try {
      this.windowManager.registerWindow(
        MainWindow.id,
        MainWindow.configuration,
      )

      this.windowManager.registerWindow(
        SettingWindow.id,
        SettingWindow.configuration,
      )

      this.windowManager.registerWindow(
        TrayWindow.id,
        TrayWindow.configuration,
      )
      this.windowManager.registerWindow(
        PlayerWindow.id,
        PlayerWindow.configuration,
      )
    }
    catch (err) {
      applicationLogger.error(err)
    }
  }

  updateApplicationConfiguration() {
    this.applicationNamespace
      .get('configuration')
      .then((doc) => {
        this.applicationNamespace.put({
          _id: 'configuration',
          data: this.configuration,
          _rev: doc?._rev,
        })
      })
      .catch((err) => {
        console.error(err)
      })
  }

  changeApplicationLanguage(lng: string) {
    return new Promise((resolve, reject) => {
      i18next.changeLanguage(lng, (err) => {
        if (err)
          reject(err)
        resolve(true)
      })
    })
  }

  async quit() {
    app.once('before-quit', async() => {
      await this.destroy()
    })

    app.quit()
    setTimeout(() => app.exit(0), 1000)
  }

  destroy() {
    this.destroyEmitter.fire()

    return new Promise<void>(() => {
      this.readyEmitter.dispose()
      this.destroyEmitter.dispose()

      this.wallpaperLoader.destroy()
      this.wallpaperPlayer.destroy()
      this.applicationTray.destroy()
      this.windowManager.destroy()
      this.database.destroy()
    })
  }
}
