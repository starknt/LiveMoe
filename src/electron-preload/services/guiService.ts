import { stat } from 'fs/promises'
import type { IChannel } from 'common/electron-common'
import { shell } from 'electron'
import type { LiveMoe } from 'livemoe'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'

export default function createGuiService(
  guiService: IChannel,
): LiveMoe.GuiService {
  return {
    openFolder: async(path: string) => {
      try {
        await stat(path)
        await shell.openPath(path)
        return true
      }
      catch {
        return false
      }
    },
    openFileSelectDialog: async(options?: Electron.OpenDialogSyncOptions) => {
      return await guiService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'open-file',
        arg: options,
      })
    },

    checkFileExists: async(path: string) => {
      try {
        await stat(path)
        return true
      }
      catch {
        return false
      }
    },
  }
}
