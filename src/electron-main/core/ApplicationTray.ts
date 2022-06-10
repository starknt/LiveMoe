import { Tray } from 'electron'
import type { IDestroyable } from 'electron-main/common/lifecycle'
import type { IApplicationContext } from 'electron-main/common/application'
import type { IWindow } from 'electron-main/common/windows'
import type { IPCMainServer } from '@livemoe/ipc/main'
import { InjectedService } from '@livemoe/ipc/main'
import type { EventPreloadType } from 'common/electron-common/windows'
import type { IPCService } from '@livemoe/ipc'
import { resolveGlobalAssets } from 'electron-main/utils'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import { Emitter, Event } from '@livemoe/utils'
import { ILoggerService } from 'electron-main/common/log'

export default class ApplicationTray implements IDestroyable {
  private static readonly channelName = 'lm:tray'

  @InjectedService(ApplicationTray.channelName)
  private readonly service!: IPCService

  private readonly logger = this.loggerService.create('Tray')

  private tray: Tray | null = null

  private window: IWindow | null = null

  private readonly _onShowEmitter = new Emitter<Electron.Point>()

  private readonly _onHideEmitter = new Emitter<void>()

  private readonly windowInitalizedEmitter = new Emitter<void>()

  readonly onShow = this._onShowEmitter.event

  readonly onHide = this._onHideEmitter.event

  readonly onWindowInitalized = this.windowInitalizedEmitter.event

  constructor(
    private readonly context: IApplicationContext,
    private readonly server: IPCMainServer,
    @ILoggerService private readonly loggerService: ILoggerService,
  ) {
    this.initalize()
  }

  async initalize() {
    this.initalizeWindow()

    this.registerListener()
  }

  private async initalizeWindow() {
    this.context.lifecycle.onReady(async() => {
      this.logger.info('Tray window initalizing...')

      if (!this.window) {
        this.window = await this.context.sendCallWindowMessage(
          'lm:windows',
          'window',
          'tray',
          false,
        )

        await this.window?.whenReadyToShow()

        this.server
          .getChannel('tray', 'lm:tray')
          .then((channel) => {
            const e = channel.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
              event: 'show',
            })

            e(() => {
              this.window?.show()
              setTimeout(() => this.window?.focus())
            })
          })
          .catch((e) => {
            console.error(e)
          })

        this.windowInitalizedEmitter.fire()
      }
    })
  }

  private registerListener() {
    this.onWindowInitalized(() => {
      this.setupTray()
    })

    this.service.registerCaller(
      WINDOW_MESSAGE_TYPE.IPC_CALL,
      (preload: EventPreloadType) => {
        return this.dispatchCallWindowMessage(preload)
      },
    )

    this.service.registerListener(
      WINDOW_MESSAGE_TYPE.IPC_LISTEN,
      (preload: EventPreloadType) => {
        return this.dispatchListenWindowMessage(preload)
      },
    )
  }

  private async dispatchCallWindowMessage(preload: EventPreloadType) {
    switch (preload.event) {
      case 'hide':
        return this.hide()
      case 'ignoreMouse':
        return this.setIgnoreMouse(preload.arg)
      default:
        return null
    }
  }

  private dispatchListenWindowMessage(preload: EventPreloadType) {
    switch (preload.event) {
      case 'show':
        return this.onShow
      case 'hide':
        return this.onHide
      default:
        return Event.None
    }
  }

  private setIgnoreMouse(args: string | unknown[] | undefined) {
    if (!this.window)
      return

    let ignore = false

    if (Array.isArray(args) && typeof args[0] === 'boolean')
      ignore = args[0]

    if (typeof args === 'string' || typeof args === undefined)
      ignore = !!args

    this.window.setIgnoreMouseEvents(ignore, { forward: true })
  }

  private show(rect: Electron.Rectangle) {
    if (!this.window)
      return

    this.window.setBackgroundColor('#00000000')
    this.window.setFullScreenable(true)
    this.window.setFullScreen(true)

    this.window.setIgnoreMouseEvents(true, { forward: true })
    this.window?.setAlwaysOnTop(true, 'pop-up-menu')
    this._onShowEmitter.fire(rect)
  }

  private hide() {
    if (!this.window)
      return

    this._onHideEmitter.fire()
    this.window.hide()
  }

  get visible() {
    return !!this.window?.isVisible()
  }

  private setupTray() {
    this.tray = new Tray(resolveGlobalAssets('icon.ico'))

    this.tray.on('right-click', async(_e, bounds) => {
      if (this.window?.isVisible())
        this.hide()
      else
        this.show(bounds)
    })

    this.tray.on('click', async() => {
      this.context.sendCallWindowMessage('lm:windows', 'window', 'main')
    })
  }

  destroy() {
    this.tray?.destroy()
  }
}
