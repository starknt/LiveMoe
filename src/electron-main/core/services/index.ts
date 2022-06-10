import type { IApplicationContext } from 'electron-main/common/application'
import GuiService from './gui.service'
import WallpaperService from './wallpaper.service'

export default class ApplicationService {
  guiService = new GuiService(this.context)

  wallpaperService = new WallpaperService(this.context)

  constructor(private readonly context: IApplicationContext) {}

  destroy() {
  }
}
