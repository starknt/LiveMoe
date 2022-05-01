import { Service } from 'common/electron-common'
import type { EventPreloadType } from 'common/electron-common/windows'
import {
  WINDOW_MESSAGE_TYPE,
} from 'common/electron-common/windows'
import type { IPCMainServer } from 'common/electron-main'
import { BrowserWindow, dialog } from 'electron'

export default class GuiService {
  private readonly channelName = 'lm:gui'

  private readonly service = new Service()

  constructor(private readonly server: IPCMainServer) {
    this.server.registerChannel(this.channelName, this.service)

    this.registerListener()
  }

  registerListener() {
    this.service.registerCaller(
      WINDOW_MESSAGE_TYPE.IPC_CALL,
      async(preload: EventPreloadType) => {
        return await this.dispatchCallerEventMessage(preload)
      },
    )
  }

  private async dispatchCallerEventMessage(preload: EventPreloadType) {
    switch (preload.event) {
      case 'open-file':
        return await this.openFileSelectDialog(preload.arg)
      default:
        return false
    }
  }

  openFileSelectDialog(options: Electron.OpenDialogSyncOptions = {}) {
    return new Promise((resolve, reject) => {
      try {
        const window = BrowserWindow.getFocusedWindow()
        let result: string[] | undefined
        if (window)
          result = dialog.showOpenDialogSync(window, options)
        else
          result = dialog.showOpenDialogSync(options)
        resolve(result)
      }
      catch (error) {
        reject(error)
      }
    })
  }
}
