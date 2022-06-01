import type { IChannel } from '@livemoe/ipc'
import type { IApplicationConfiguration } from 'common/electron-common/application'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import type { LiveMoe } from 'livemoe'

const createApplicationService = (
  applicationService: IChannel,
): LiveMoe.ApplicationService => {
  return {
    getConfiguration: async() => {
      return await applicationService.call(
        WINDOW_MESSAGE_TYPE.IPC_CALL,
        {
          type: WINDOW_MESSAGE_TYPE.IPC_CALL,
          event: 'configuration',
        },
      )
    },
    setConfiguration: async(configuration: IApplicationConfiguration) => {
      return await applicationService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'configuration',
        arg: configuration,
      })
    },

    onConfigChange: async() => {
      return applicationService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        event: 'configuration',
      })
    },

    quit: async() => {
      return await applicationService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'quit',
      })
    },
  }
}

export default createApplicationService
