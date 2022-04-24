import { Event } from 'common/electron-common/base/event'
import { BaseAutoResizeWindow } from 'electron-main/windows/base/baseWindow'
import type { IWindowOptions } from 'electron-main/core/windowManager/WindowPool'
import type { EventPreloadType } from 'common/electron-common/windows'
import {
  WINDOW_MESSAGE_TYPE,
} from 'common/electron-common/windows'

export class IWindow
  extends BaseAutoResizeWindow
  implements IProcessEventWindow {
  constructor(protected readonly context: IWindowContext) {
    super(context.options)
  }

  processEvents(
    type: WINDOW_MESSAGE_TYPE,
    // @ts-expect-error
    preload: EventPreloadType,
  ): any | Event<any> {
    if (
      type === WINDOW_MESSAGE_TYPE.IPC_LISTEN
      || type === WINDOW_MESSAGE_TYPE.WINDOW_LISTEN
    )
      return Event.None

    return false
  }
}

export interface IWindowsListener {
  (command: string, ...args: unknown[]): void
}

export type IWindowConstructor = new (context: IWindowContext) => any

export interface IWindowEvent {
  target: string
  command: string
  arg: unknown
}

export interface IDialogWindowOptions extends IWindowOptions {
  /**
   * @description 加载的页面路径, 默认会从 `/panels/${name}/index.html` 加载
   */
  path: string
}

export interface IWindowEventListener<T> {
  (e: IWindowEvent): Promise<T> | Event<T> | null
}

export interface IWindowMessagePreload {}

export interface IWindowMessageOptions {
  /** 是否广播该消息, 默认不广播 */
  boardcast?: boolean
}

export interface IWindowChannel {
  send(command: string, ...args: unknown[]): void
}

export interface IWindowContext {
  options: IWindowOptions
  getChannel(
    channelName: string,
    local?: boolean,
    ctx?: string
  ): Promise<IWindowChannel>
}

export interface IProcessEventWindow {
  processEvents(
    event: WINDOW_MESSAGE_TYPE,
    preload: EventPreloadType
  ): any | Event<any>
}
