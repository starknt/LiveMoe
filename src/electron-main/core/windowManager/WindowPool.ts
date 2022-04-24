import { Emitter } from 'common/electron-common/base/event';
import { generateUuid } from 'common/electron-common/base/uuid';
import type WindowEventBus from './WindowEventBus';
import { IPCMainServer } from 'common/electron-main';
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { IDestroyable } from 'electron-main/common/lifecycle';
import {
  IWindow,
  IWindowConstructor,
  IWindowContext,
} from 'electron-main/common/windows';
import { resolvePreloadPath } from 'electron-main/utils';
import { WindowId } from './WindowManager';
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows';

export interface EventBusOptions {
  ipcEvent?: boolean; // 是否注册 ipc-event, 可以接收来着 `ipc-*` 的消息
  windowEvent?: boolean; // 是否注册 window-event, 可以接收来着 `window-*` 的消息
}

export interface IWindowOptions extends BrowserWindowConstructorOptions {
  eventBus?: EventBusOptions;
  id: WindowId;
  path?: string;
  logic?: () => void;
}

const DefaultWindowOptions: IWindowOptions = {
  id: '',
  width: 1280,
  maxWidth: 1280,
  height: 760,
  maxHeight: 760,
  center: true,
  show: false,
  frame: false,
  transparent: true,
  webPreferences: {
    spellcheck: false,
    experimentalFeatures: true,
    webSecurity: false,
    contextIsolation: true,
    nodeIntegration: false,
    preload: resolvePreloadPath('service'),
  },
};

/**
 * 窗口池只用于创建通用窗口, 如果对一些只在创建时才能修改的选项, 则需要重新生产一个新的窗口来提供给消费者
 */
export default class WindowPool implements IDestroyable {
  private readonly _windowPool: Array<IWindow> = [];

  private readonly _consumed = new Emitter<{
    window: IWindow;
    options: IWindowOptions;
  }>();

  private readonly _produced = new Emitter<void>();

  readonly onConsume = this._consumed.event;

  readonly onProduce = this._produced.event;

  constructor(
    private readonly server: IPCMainServer,
    private readonly eventBus: WindowEventBus,
    private readonly _pool: number = 2
  ) {
    this.produce();

    this.onConsume(() => {
      process.nextTick(() => {
        this.produce();
      });
    });
  }

  private initalizeWindow(window: IWindow, options: Partial<IWindowOptions>) {
    this.setBounds(window, options);
    window.setBackgroundColor('#00ffffff');
    window.setOpacity(options.opacity ?? 1);
    window.setClosable(options.closable ?? true);
    if (!options.transparent) window.setFullScreen(options.fullscreen ?? false);
    window.setMovable(options.movable ?? true);
    window.setSkipTaskbar(options.skipTaskbar ?? false);
    window.setResizable(
      options.transparent ? false : options.resizable ?? true
    );
    window.setMaximizable(
      options.transparent ? false : options.resizable ?? true
    );
    window.setFullScreenable(options.fullscreenable ?? true);
  }

  private initalizeWindowWithPool(options: IWindowOptions): IWindow {
    const window = this._windowPool.shift();

    if (!window) {
      throw new Error('create window failed');
    }

    this.initalizeWindow(window, options);

    return window;
  }

  private initalizeWindowWithNew(options: IWindowOptions): IWindow {
    const window = new IWindow(this.createWindowContext(options));

    this.initalizeWindow(window, options);

    return window;
  }

  private setBounds(window: IWindow, options: Partial<IWindowOptions>) {
    (<BrowserWindow>window).setBounds({
      width: options.width ?? 1280,
      height: options.height ?? 760,
      x: options.x ?? 0,
      y: options.y ?? 0,
    });
  }

  consume(constructor?: IWindowConstructor, options?: IWindowOptions): IWindow;
  consume(options?: IWindowOptions): IWindow;
  consume(
    options?: IWindowOptions | IWindowConstructor,
    option?: IWindowOptions
  ): IWindow | null {
    if (!option && typeof options !== 'object')
      DefaultWindowOptions.id = generateUuid();

    let window: IWindow | null = null;

    if (typeof options === 'function') {
      if (!option || !option.logic) {
        window = this.consumeWithConstructor(options, DefaultWindowOptions);
      } else {
        window = this.initalizeWindowWithPool(
          Object.assign({}, DefaultWindowOptions, option)
        );
      }
    }

    if (typeof options === 'object') {
      if (options.webPreferences || options.type) {
        if (options.webPreferences) {
          Reflect.set(
            options.webPreferences,
            'preload',
            resolvePreloadPath('service')
          );
        }
        options = Object.assign({}, DefaultWindowOptions, options);
        window = this.initalizeWindowWithNew(options);
      } else {
        options = Object.assign({}, DefaultWindowOptions, options);
        window = this.initalizeWindowWithPool(options);
      }
    }

    option = Object.assign({}, DefaultWindowOptions, option);

    if (window) {
      if (typeof options === 'object') {
        this._consumed.fire({
          window,
          options: options,
        });
      } else {
        this._consumed.fire({
          window,
          options: option,
        });
      }
    }

    return window;
  }

  createWindowContext(options?: IWindowOptions): IWindowContext {
    return {
      getChannel: async (
        channelName: string,
        local = true,
        ctx: string = ''
      ) => {
        if (!local) {
          return await this.getRemoteChannel(channelName, ctx);
        }

        return {
          send: (command: string, ...args: any[]) => {},
        };
      },

      options: Object.assign({}, DefaultWindowOptions, options),
    };
  }

  async getRemoteChannel(channelName: string, ctx = '') {
    const remoteChannel = await this.server.getChannel(ctx, channelName);

    return {
      send: (command: string, ...args: any[]) => {
        return remoteChannel.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
          event: command,
          type: WINDOW_MESSAGE_TYPE.IPC_CALL,
          arg: args,
        });
      },
    };
  }

  async getLocalChannel(channelName: string) {}

  private consumeWithConstructor(
    constructor: IWindowConstructor,
    options: IWindowOptions
  ): IWindow {
    const window = new constructor(this.createWindowContext(options));

    return window;
  }

  private async produce(n = this._pool) {
    for (let i = this._windowPool.length; i <= n; i += 1) {
      const window = new IWindow(this.createWindowContext());

      this._windowPool.push(window);
      this._produced.fire();
    }
  }

  destroy(): void {
    this._consumed.dispose();
    this._produced.dispose();

    this._windowPool.forEach((window) => {
      window.destroy();
    });
  }
}
