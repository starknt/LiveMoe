import type { IWindowContext } from 'electron-main/common/windows'
import type { IWindowOptions } from 'electron-main/core/windowManager/WindowPool'
import { resolveHtmlPath } from 'electron-main/utils'
import BaseDialog from './baseDialog'

export default class CommonDialog extends BaseDialog {
  static readonly id = 'dialog'

  static readonly configuration: IWindowOptions = {
    id: CommonDialog.id,
    width: 420,
    maxWidth: 420,
    height: 260,
    maxHeight: 260,
    fullscreen: false,
    resizable: false,
    fullscreenable: false,
    path: resolveHtmlPath(CommonDialog.id),
  }

  constructor(protected readonly context: IWindowContext) {
    super(context)
  }

  showInfo(title: string, body: string, buttons: string[]): Promise<number> {
    return new Promise((resolve, reject) => {
      // this.webContents.send("show", title, body, buttons);
      // this.webContents.once("show-reply", (e, index) => {
      //   resolve(index);
      // });
    })
  }

  showError(title: string, body: string, buttons: string[]): Promise<number> {
    return new Promise((resolve, reject) => {
      // this.webContents.send("show", title, body, buttons);
      // this.webContents.once("show-reply", (e, index) => {
      //   resolve(index);
      // });
    })
  }
}
