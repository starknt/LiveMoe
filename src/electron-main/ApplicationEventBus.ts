import EventEmitter from 'events'
import { IPCService as Service } from '@livemoe/ipc'
import type { EventPreloadType } from 'common/electron-common/windows'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import type { IPCMainServer } from '@livemoe/ipc/main'
import { InjectedServer } from '@livemoe/ipc/main'
import { Event } from '@livemoe/utils'
import type { IApplicationEventBus } from './common/application'

export default class ApplicationEventBus
  extends EventEmitter
  implements IApplicationEventBus {
  protected readonly MAX_LISTENERS = 0

  @InjectedServer()
  protected readonly server!: IPCMainServer

  protected readonly channelName = 'lm:application'

  protected readonly applicationService = new Service()

  events: Map<
    string,
    (
      event: WINDOW_MESSAGE_TYPE,
      preload: EventPreloadType
    ) => void | Promise<any> | Event<any>
  >

  constructor() {
    super()
    this.setMaxListeners(this.MAX_LISTENERS)

    this.events = new Map()

    this.registerService()
  }

  private registerService() {
    try {
      this.server.registerChannel(this.channelName, this.applicationService)
      return true
    }
    catch (err) {
      if (err instanceof Error)
        console.error(`RegisterChannel Exception: ${err.message}`)
    }

    return false
  }

  registerEvent(
    channelName: string,
    event: (
      event: WINDOW_MESSAGE_TYPE,
      preload: EventPreloadType
    ) => any | Promise<any> | Event<any>,
  ): boolean {
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

  sendWindowMessage(
    channelName: string,
    preload: EventPreloadType,
  ): any | Event<any> {
    console.info('sendWindowMessage:', channelName, preload)

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
    return this.events.get(channelName)?.(preload.type, preload)
  }
}
