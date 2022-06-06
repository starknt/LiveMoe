import EventEmitter from 'node:events'
import { Event } from '@livemoe/utils'
import applicationLogger from 'common/electron-common/applicationLogger'
import { IPCService as Service } from '@livemoe/ipc'
import type { Server as IPCMainServer } from '@livemoe/ipc/main'
import type Application from 'electron-main/Application'
import type { IDestroyable } from 'electron-main/common/lifecycle'
import type { IWindow, IWindowMessageOptions } from 'electron-main/common/windows'
import type { EventPreloadType } from 'common/electron-common/windows'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import type { WindowId } from './WindowManager'

export abstract class IWindowEventBus extends EventEmitter {
  protected readonly channelName = 'lm:windows'

  protected readonly MAX_LISTENERS = 0

  protected readonly service = new Service()

  constructor(server: IPCMainServer) {
    super()
    this.setMaxListeners(this.MAX_LISTENERS)

    this.registerService(this.channelName, this.service, server)
  }

  registerService(
    channelName: string,
    service: Service,
    server: IPCMainServer,
  ) {
    try {
      server.registerChannel(channelName, service)

      return true
    }
    catch (err) {
      if (err instanceof Error) {
        applicationLogger.error(`RegisterChannel Exception: ${err.message}`)
      }
      else {
        applicationLogger.error(
          `RegisterChannel Exception, channelName: ${this.channelName}`,
        )
      }
    }

    return false
  }
}

export default class WindowEventBus
  extends IWindowEventBus
  implements IDestroyable {
  private readonly windowEvent = new Map<WindowId, IWindow>()

  private readonly willCreateWindow = new Map<
    WindowId,
    (show: boolean) => IWindow | null
  >()

  constructor(
    server: IPCMainServer,
    private readonly application: Application,
  ) {
    super(server)

    /**
     * 主信道 `lm:windows`
     * 根据窗口的 id, 创建子信道 `lm:windows:${id}`
     * @description 用于窗口间的跨进程通信
     */
    this.initalizeService()
  }

  async initalizeService() {
    this.service.registerCaller(
      WINDOW_MESSAGE_TYPE.IPC_CALL,
      async(preload: EventPreloadType) => {
        const result = await this.dispatchCallerWindowMessage(preload)
        return result ?? false
      },
    )

    this.service.registerListener(WINDOW_MESSAGE_TYPE.IPC_LISTEN, (preload) => {
      const result = this.dispatchListenWindowMessage(preload)
      return result ?? Event.None
    })

    this.application.registerEvent(this.channelName, async(type, preload) => {
      switch (type) {
        case WINDOW_MESSAGE_TYPE.WINDOW_CALL: {
          const result = await this.dispatchCallerWindowMessage(preload)
          return result ?? false
        }
        case WINDOW_MESSAGE_TYPE.WINDOW_LISTEN: {
          const result = this.dispatchListenWindowMessage(preload)
          return result ?? Event.None
        }
        default:
          return false
      }
    })
  }

  private dispatchCallerWindowMessage(preload: EventPreloadType) {
    switch (preload.event) {
      case 'window': {
        // 创建窗口
        let result
        if (
          Array.isArray(preload.arg)
          && preload.arg.length > 0
          && typeof preload.arg[0] === 'string'
        ) {
          result = this.handleWindowCreateMessage(
            preload.arg[0],
            (preload.arg[1] ?? true) as boolean,
          )
        }

        if (typeof preload.arg === 'string')
          result = this.handleWindowCreateMessage(preload.arg)

        if (preload.type === WINDOW_MESSAGE_TYPE.WINDOW_CALL)
          return result

        return !!result
      }
      case 'command': {
        if (
          Array.isArray(preload.arg)
          && preload.arg.length >= 1
          && typeof preload.arg[0] === 'string'
          && typeof preload.arg[1] === 'string'
        ) {
          return this.handleWindowCallEvent(
            preload.arg[0],
            preload.arg[1],
            preload.arg.slice(2),
          )
        }
        return false
      }
      default:
        if (typeof preload.arg === 'string')
          return this.handleWindowCallEvent(preload.arg, preload.event, [])

        if (
          Array.isArray(preload.arg)
          && preload.arg.length >= 1
          && typeof preload.arg[0] === 'string'
        ) {
          return this.handleWindowCallEvent(
            preload.arg[0],
            preload.event,
            preload.arg.slice(1),
          )
        }

        return false
    }
  }

  private dispatchListenWindowMessage(preload: EventPreloadType): Event<any> {
    if (
      Array.isArray(preload.arg)
      && preload.arg.length > 0
      && typeof preload.arg[0] === 'string'
    ) {
      return this.handleWindowEvent(
        preload.arg[0],
        preload.event,
        preload.arg.slice(1),
      )
    }

    return Event.None
  }

  private handleWindowCreateMessage(id: string, show = true) {
    const result = this.handleWindowCreator(id, show)

    return Promise.resolve(result)
  }

  private handleWindowCallEvent(
    windowId: string,
    event: string,
    args: unknown[],
  ) {
    const window = this.windowEvent.get(windowId)

    if (window) {
      return window.processEvents(WINDOW_MESSAGE_TYPE.WINDOW_CALL, {
        type: WINDOW_MESSAGE_TYPE.WINDOW_CALL,
        event,
        arg: args,
      })
    }

    return Promise.resolve(false)
  }

  private handleWindowEvent(
    windowId: string,
    event: string,
    args: any[],
  ): Event<any> {
    const window = this.windowEvent.get(windowId)

    if (window) {
      return window.processEvents(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        event,
        arg: args,
      })
    }

    return Event.None
  }

  private handleWindowCreator(id: WindowId, show: boolean) {
    if (this.willCreateWindow.has(id)) {
      const windowCreator = this.willCreateWindow.get(id)!

      return windowCreator(show)
    }

    return null
  }

  registerWindowCreator(
    id: WindowId,
    creator: (show: boolean) => IWindow | null,
  ) {
    if (this.willCreateWindow.has(id))
      throw new Error(`Window ${id} has been registered`)

    this.willCreateWindow.set(id, creator)
  }

  registerSubService(id: WindowId, window: IWindow) {
    this.service.registerCaller(`${this.channelName}:${id}`, async(argv) => {
      return (
        (await window.processEvents(WINDOW_MESSAGE_TYPE.IPC_CALL, {
          type: WINDOW_MESSAGE_TYPE.IPC_CALL,
          event: argv.command,
          arg: argv.rest ?? [],
        })) ?? Promise.resolve(null)
      )
    })

    this.service.registerListener(`${this.channelName}:${id}`, (args) => {
      return (
        window.processEvents(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
          type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
          event: args.event,
          arg: args.rest ?? [],
        }) ?? Event.None
      )
    })
  }

  listenerWindowMessage(id: WindowId, window: IWindow) {
    this.windowEvent.set(`${id}`, window)
    window.once('closed', () => this.windowEvent.delete(id))
  }

  sendWindowMessage(
    channelName: string,
    preload: EventPreloadType,
    options: IWindowMessageOptions,
  ) {
    this.handleSendWindowMessage(channelName, preload, options)
  }

  handleSendWindowMessage(
    channelName: string,
    preload: EventPreloadType,
    options: IWindowMessageOptions,
  ) {
    // 广播消息
    if (options.boardcast) {
      if (channelName.includes(this.channelName)) {
        this.windowEvent.forEach((window) => {
          window.processEvents(preload.type ?? 'window-caller', {
            type: preload.type ?? WINDOW_MESSAGE_TYPE.WINDOW_CALL,
            event: preload.event,
            arg: preload.arg,
            reply: preload.reply,
          })
        })
      }
      else {
        this.application.sendWindowMessage(this.channelName, {
          type: preload.type ?? WINDOW_MESSAGE_TYPE.WINDOW_CALL,
          event: preload.event,
          arg: preload.arg,
          reply: preload.reply,
        })
      }
    }
    else {
      if (this.windowEvent.has(channelName)) {
        const window = this.windowEvent.get(channelName)

        window?.processEvents?.(preload.type ?? 'window-caller', {
          type: preload.type ?? 'window-caller',
          event: preload.event,
          arg: preload.arg,
          reply: preload.reply,
        })
      }
    }
  }

  handleRecvWindowMessage() {}

  destroy() {
    this.windowEvent.clear()
    this.willCreateWindow.clear()
  }
}
