import { IWindow } from 'electron-main/common/windows'
import type { IWindowOptions } from 'electron-main/core/windowManager/WindowPool'
import { resolveHtmlPath } from 'electron-main/utils'

export default class TrayWindow extends IWindow {
  static readonly id = 'tray'

  static readonly configuration: IWindowOptions = {
    id: TrayWindow.id,
    show: false,
    width: 300,
    height: 400,
    maxHeight: 400,
    maxWidth: 300,
    fullscreen: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    frame: false,
    transparent: true,
    path: resolveHtmlPath('tray'),
    logic: TrayWindow.logic,
  }

  static logic(this: IWindow) {}
}
