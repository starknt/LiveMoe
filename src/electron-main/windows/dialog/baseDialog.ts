import type { IWindowContext } from 'electron-main/common/windows'
import { BaseAutoResizeWindow } from '../base/baseWindow'

export default class BaseDialog extends BaseAutoResizeWindow {
  constructor(context: IWindowContext) {
    super(context.options)
  }
}
