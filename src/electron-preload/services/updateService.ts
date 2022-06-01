import type { IChannel } from '@livemoe/ipc'
import { UPDATER_EVENT } from 'common/electron-common/updateManager'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import type { LiveMoe } from 'livemoe'

export default function createUpdateService(updateService: IChannel): LiveMoe.UpdateService {
  return {
    checkForUpdate: async() => {
      return await updateService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        event: 'check',
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
      })
    },
    update: async() => {
      return await updateService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        event: 'update',
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
      })
    },

    onCheckForUpdate: async() => {
      return updateService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        event: UPDATER_EVENT.CHECKING_FOR_UPDATE,
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
      })
    },

    onUpdateAvailable: async() => {
      return updateService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        event: UPDATER_EVENT.UPDATE_AVAILABLE,
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
      })
    },
    onUpdateNotAvailable: async() => {
      return updateService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        event: UPDATER_EVENT.UPDATE_NOT_AVAILABLE,
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
      })
    },
    onDownloadProgress: async() => {
      return updateService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        event: UPDATER_EVENT.DOWNLOAD_PROGRESS,
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
      })
    },
    onUpdateDownloaded: async() => {
      return updateService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        event: UPDATER_EVENT.UPDATE_DOWNLOADED,
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
      })
    },
    onUpdateCheckError: async() => {
      return updateService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        event: UPDATER_EVENT.ERROR,
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
      })
    },
  }
}
