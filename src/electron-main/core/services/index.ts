import type { IPCMainServer } from 'common/electron-main'
import type { IApplicationContext } from 'electron-main/common/application'
import GuiService from './gui.service'
import WallpaperService from './wallpaper.service'

export default class ApplicationService {
  guiService = new GuiService(this.server)

  wallpaperService = new WallpaperService(this.server, this.context)

  constructor(private readonly context: IApplicationContext, private readonly server: IPCMainServer) {}

  destroy() {
  }
}
