import { Event } from 'common/electron-common/base/event';
import { BaseAutoResizeWindow } from 'electron-main/windows/base/baseWindow';
import type { IWindowOptions } from 'electron-main/core/windowManager/WindowPool';
import type { IChannel } from 'common/electron-common';
import {
  EventPreloadType,
  WINDOW_MESSAGE_TYPE,
} from 'common/electron-common/windows';

export class IWindow
  extends BaseAutoResizeWindow
  implements IProcessEventWindow
{
  constructor(protected readonly context: IWindowContext) {
    super(context.options);
  }

  processEvents(
    type: WINDOW_MESSAGE_TYPE,
    // @ts-ignore
    preload: EventPreloadType
  ): any | Event<any> {
    if (
      type === WINDOW_MESSAGE_TYPE.IPC_LISTEN ||
      type === WINDOW_MESSAGE_TYPE.WINDOW_LISTEN
    ) {
      return Event.None;
    }

    return false;
  }
}

export interface IWindowsListener {
  (command: string, ...args: unknown[]): void;
}

export type IWindowConstructor = new (context: IWindowContext) => any;

export interface IWindowEvent {
  target: string;
  command: string;
  arg: unknown;
}

export interface IDialogWindowOptions extends IWindowOptions {
  /**
   * @description 加载的页面路径, 默认会从 `/panels/${name}/index.html` 加载
   */
  path: string;
}

export interface IWindowEventListener<T> {
  (e: IWindowEvent): Promise<T> | Event<T> | null;
}

export interface IWindowMessagePreload {}

export interface IWindowMessageOptions {
  /** 是否广播该消息, 默认不广播 */
  boardcast?: boolean;
}

export interface IWindowContext {
  options: IWindowOptions;
  /**
   * @param {string} mode
   * 默认为 `ipc`, 在该模式下, 会把消息发送到渲染进程, 在 `local` 模式下, 会把消息发送给主进程的其他信道
   */
  send(
    channelName: string,
    preload: EventPreloadType,
    options: IWindowMessageOptions
  ): void;
  getIPCChannel(channelName: string, ctx: string): Promise<IChannel>;
}

export interface IProcessEventWindow {
  processEvents(
    event: WINDOW_MESSAGE_TYPE,
    preload: EventPreloadType
  ): any | Event<any>;
}
