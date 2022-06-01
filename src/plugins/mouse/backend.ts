import { IPCService as Service } from '@livemoe/ipc'
import type { IBackendPlugin, IPluginContext } from 'common/electron-common/plugin'

export default class MousePlugin implements IBackendPlugin {
  private readonly channelName = 'lm:mouse'

  private readonly serivce = new Service()

  constructor(private context: IPluginContext) {}

  onReady() {
    this.context.core.registerService(this.channelName, this.serivce)
  }
}
