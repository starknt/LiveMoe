import { existsSync, mkdirSync } from 'fs'
import { Service } from 'common/electron-common'
import { Event } from 'common/electron-common/base/event'
import type { EventPreloadType } from 'common/electron-common/windows'
import {
  WINDOW_MESSAGE_TYPE,
} from 'common/electron-common/windows'
import type { IPCMainServer } from 'common/electron-main'
import { BrowserWindow, dialog } from 'electron'
import type { IApplicationContext } from 'electron-main/common/application'

export default class GuiService {
  private readonly channelName = 'lm:gui'

  private readonly service = new Service()

  constructor(private readonly server: IPCMainServer, private readonly context: IApplicationContext) {
    this.registerListener()
  }

  registerListener() {
    this.server.registerChannel(this.channelName, this.service)

    this.context.registerMessageHandler(this.channelName, (type: WINDOW_MESSAGE_TYPE, preload: EventPreloadType) => {
      switch (type) {
        case WINDOW_MESSAGE_TYPE.WINDOW_CALL:
          return this.dispatchCallerEventMessage(preload)
        case WINDOW_MESSAGE_TYPE.WINDOW_LISTEN:
          return this.dispatchListenerEvent(preload)
        default:
          return Event.None
      }
    })

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
      case 'open-dir':
        return await this.openDirSelectDialog(preload.arg)
      default:
        return false
    }
  }

  private dispatchListenerEvent(preload: EventPreloadType) {
    switch (preload.event) {
      default:
        return Event.None
    }
  }

  openFileSelectDialog(options: Electron.OpenDialogSyncOptions = {}) {
    if (!options)
      options = {}

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

  openDirSelectDialog(options: Electron.OpenDialogSyncOptions = { properties: ['createDirectory', 'promptToCreate', 'openDirectory'] }) {
    if (!options)
      options = { properties: ['createDirectory', 'promptToCreate', 'openDirectory'] }
    else
      options = Object.assign({}, { properties: ['createDirectory', 'promptToCreate', 'openDirectory'] }, options)

    return new Promise((resolve, reject) => {
      try {
        const window = BrowserWindow.getFocusedWindow()
        let result: string[] | undefined
        if (window)
          result = dialog.showOpenDialogSync(window, options)
        else
          result = dialog.showOpenDialogSync(options)

        if (Array.isArray(result) && result.length > 0) {
          const dir = result[0]
          if (!existsSync(dir))
            mkdirSync(dir)
        }

        resolve(result)
      }
      catch (error) {
        reject(error)
      }
    })
  }
}
