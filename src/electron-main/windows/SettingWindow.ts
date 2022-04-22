import type { EventPreloadType, WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows';
import { IWindow } from 'electron-main/common/windows';
import { IWindowOptions } from 'electron-main/core/windowManager/WindowPool';
import { resolveHtmlPath } from 'electron-main/utils';

export default class SettingWindow {
  static readonly id = 'setting';

  static readonly configuration: IWindowOptions = {
    id: SettingWindow.id,
    width: 440,
    maxWidth: 440,
    height: 520,
    maxHeight: 520,
    fullscreen: false,
    resizable: false,
    fullscreenable: false,
    path: resolveHtmlPath(SettingWindow.id),
    logic: SettingWindow.logic,
  };

  /**
   * 该函数会在创建窗口时注入到窗口中
   * 用该函数实现自己的逻辑, 用这种方式创建窗口时, 会从窗口池中获取窗口
   */
  static logic(this: IWindow) {
    Reflect.set(
      this,
      'handleCommand',
      (_: WINDOW_MESSAGE_TYPE, preload: EventPreloadType): any => {
        const { event: command, reply } = preload;
        switch (command) {
          case 'toggle':
            this.toggle();
            break;
          case 'show':
            this.show();
            break;
          case 'hide':
            this.hide();
            break;
          case 'min':
            this.minimize();
            break;
          case 'max':
            this.maximize();
            break;
          case 'fullscreen':
            this.setFullScreen(true);
            break;
          case 'exitFullscreen':
            this.setFullScreen(false);
            break;
          case 'exit':
            break;
          default:
            return -1;
        }

        if (reply) {
          reply(true);
        }
      }
    );

    Reflect.set(
      this,
      'processEvents',
      (event: WINDOW_MESSAGE_TYPE, preload: EventPreloadType): any => {
        Reflect.get(this, 'handleCommand')(event, preload);
      }
    );
  }
}
