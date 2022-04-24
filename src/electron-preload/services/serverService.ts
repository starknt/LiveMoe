import type { IEventListener, IListener } from 'common/electron-common'
import { Service } from 'common/electron-common'
import { Event } from 'common/electron-common/base/event'
import type { EventPreloadType } from 'common/electron-common/windows'
import {
  WINDOW_MESSAGE_TYPE,
} from 'common/electron-common/windows'
import type { IPCRendererServer } from 'common/electron-renderer'
import type { LiveMoe } from 'livemoe'
/**
 * 创建可提供给主进程的服务, 和 IPCMainService 构成一个完整的IPC通信服务
 */
const createServerService = (
  server: IPCRendererServer,
): LiveMoe.RendererService => {
  return {
    createServerService: (channelName) => {
      const callerHandler = new Map<string, IListener<any>>()
      const eventHandler = new Map<string, IEventListener<any>>()

      const service = new Service()

      server.registerChannel(channelName, service)

      service.registerCaller(
        WINDOW_MESSAGE_TYPE.IPC_CALL,
        (preload: EventPreloadType) => {
          const { event, arg } = preload

          if (callerHandler.has(event)) {
            const handler = callerHandler.get(event)!
            return handler(arg)
          }

          return Promise.resolve(false)
        },
      )

      service.registerListener(
        WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        (preload: EventPreloadType) => {
          const { event, arg } = preload

          if (eventHandler.has(event)) {
            const handler = eventHandler.get(event)!

            return handler(arg)
          }

          return Event.None
        },
      )

      return {
        addCallerHandler: <T>(event: string, handler: IListener<T>) => {
          callerHandler.set(event, handler)
        },
        addEventHandler: <T>(event: string, handler: IEventListener<T>) => {
          eventHandler.set(event, handler)
        },
        removeEventHandler: (event: string) => {
          eventHandler.delete(event)
        },
        removeCallerHandler: (event: string) => {
          callerHandler.delete(event)
        },
      }
    },
  }
}

export default createServerService
