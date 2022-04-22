import { IWindow } from 'electron-main/common/windows';
import { IWindowOptions } from 'electron-main/core/windowManager/WindowPool';
import { resolveHtmlPath } from 'electron-main/utils';

export default class PlayerWindow {
  static id: string = 'player';

  static configuration: IWindowOptions = {
    id: PlayerWindow.id,
    show: false,
    width: 430,
    maxWidth: 430,
    height: 260,
    maxHeight: 260,
    fullscreen: false,
    fullscreenable: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    skipTaskbar: true,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    path: resolveHtmlPath('player'),
    type: 'toolbar',
    logic: PlayerWindow.logic,
  };

  static logic(this: IWindow) {
    // TODO: mode -- min and normal, 当模式为 min 时, 移动到屏幕边缘会贴边, 并且不能把窗口移动到屏幕外

    this.on('will-move', () => {});
  }
}
