import type { IPCMainServer } from 'common/electron-main'
import type { IApplicationContext } from 'electron-main/common/application'
import GuiService from './guiService'

export default class Service {
  guiService = new GuiService(this.server)

  constructor(private readonly context: IApplicationContext, private readonly server: IPCMainServer) {}
}
