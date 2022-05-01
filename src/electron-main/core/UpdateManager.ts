import { Service } from 'common/electron-common'
import { Event } from 'common/electron-common/base/event'
import { UPDATER_EVENT } from 'common/electron-common/updateManager'
import type { EventPreloadType } from 'common/electron-common/windows'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import { app } from 'electron'
import type { IApplicationContext } from 'electron-main/common/application'
import type { IWindow } from 'electron-main/common/windows'
import { autoUpdater } from 'electron-updater'

export default class UpdateManager {
  private readonly channelName = 'lm:update'

  private readonly service = new Service()

  private window: IWindow | null = null

  constructor(private readonly context: IApplicationContext) {
    this.context.core.registerService(this.channelName, this.service)

    this.registerListener()
  }

  registerListener() {
    this.service.registerCaller(WINDOW_MESSAGE_TYPE.IPC_CALL, async(preload: EventPreloadType) => {
      return await this.dispatchCallerMessage(preload)
    })

    this.service.registerListener(WINDOW_MESSAGE_TYPE.IPC_LISTEN, (preload: EventPreloadType) => {
      return this.dispatchEventMessage(preload)
    })
  }

  async checkUpdate() {
    try {
      const result = await autoUpdater.checkForUpdates()

      console.log('checkUpdate', result)

      return result.updateInfo.version !== app.getVersion()
    }
    catch {
      return false
    }
  }

  async dispatchCallerMessage(preload: EventPreloadType) {
    switch (preload.event) {
      case 'check':
        return await this.checkUpdate()
      default:
        return false
    }
  }

  dispatchEventMessage(preload: EventPreloadType) {
    switch (preload.event) {
      case UPDATER_EVENT.CHECKING_FOR_UPDATE:
        return Event.fromNodeEventEmitter(autoUpdater, UPDATER_EVENT.CHECKING_FOR_UPDATE)
      case UPDATER_EVENT.UPDATE_AVAILABLE:
        return Event.fromNodeEventEmitter(autoUpdater, UPDATER_EVENT.UPDATE_AVAILABLE)
      case UPDATER_EVENT.UPDATE_NOT_AVAILABLE:
        return Event.fromNodeEventEmitter(autoUpdater, UPDATER_EVENT.UPDATE_NOT_AVAILABLE)
      case UPDATER_EVENT.DOWNLOAD_PROGRESS:
        return Event.fromNodeEventEmitter(autoUpdater, UPDATER_EVENT.DOWNLOAD_PROGRESS)
      case UPDATER_EVENT.UPDATE_DOWNLOADED:
        return Event.fromNodeEventEmitter(autoUpdater, UPDATER_EVENT.UPDATE_DOWNLOADED)
      case UPDATER_EVENT.ERROR:
        return Event.fromNodeEventEmitter(autoUpdater, UPDATER_EVENT.ERROR)
      default:
        return Event.None
    }
  }

  destory() {
  }
}
