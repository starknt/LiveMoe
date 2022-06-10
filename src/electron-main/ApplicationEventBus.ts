import EventEmitter from 'events'
import type { IPCService } from '@livemoe/ipc'
import type { EventPreloadType } from 'common/electron-common/windows'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import type { IPCMainServer } from '@livemoe/ipc/main'
import { InjectedServer, InjectedService } from '@livemoe/ipc/main'
import { Event } from '@livemoe/utils'
import type { IApplicationEventBus } from './common/application'
import { ILoggerService } from './core/services/log'

export interface IEventListener {
  (event: WINDOW_MESSAGE_TYPE, preload: EventPreloadType): void | Promise<any> | Event<any>
}

export default class ApplicationEventBus extends EventEmitter implements IApplicationEventBus {
  protected readonly MAX_LISTENERS = 0

  private readonly loggerEventBus = this._loggerService?.create('ApplicationEventBus')

  @InjectedServer({ log: true, outgoingPrefix: 'main', incomingPrefix: 'othor' })
  protected readonly server!: IPCMainServer

  protected readonly channelName = 'lm:application'

  @InjectedService('lm:application')
  protected readonly applicationService!: IPCService

  events: Map<string, IEventListener> = new Map()

  constructor(@ILoggerService private readonly _loggerService?: ILoggerService) {
    super()
    this.setMaxListeners(this.MAX_LISTENERS)
  }

  registerEvent(channelName: string, event: IEventListener): boolean {
    this.loggerEventBus?.info(`registerEvent: ${channelName}`)

    if (this.events.has(channelName))
      return false

    this.events.set(channelName, event)

    return true
  }

  unregisterEvent(channelName: string): boolean {
    if (this.events.has(channelName)) {
      this.events.delete(channelName)
      return true
    }

    return false
  }

  sendWindowMessage(channelName: string, preload: EventPreloadType): any | Event<any> {
    if (Array.isArray(preload.arg) && preload.arg.length <= 0)
      preload.arg = undefined
    else if (Array.isArray(preload.arg) && preload.arg.length === 1)
      preload.arg = preload.arg[0]

    if (this.events.has(channelName))
      return this.dispatchEvents(channelName, preload)

    return this.handleNoop(preload)
  }

  handleNoop(preload: EventPreloadType) {
    if (preload.type === WINDOW_MESSAGE_TYPE.WINDOW_CALL)
      return false
    else
      return Event.None
  }

  dispatchEvents(channelName: string, preload: EventPreloadType) {
    this.loggerEventBus?.info(`dispatchEvents: ${channelName}`, preload)

    return this.events.get(channelName)?.(preload.type, preload)
  }
}
