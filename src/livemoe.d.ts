import type { IEventListener, IListener } from 'common/electron-common';
import type { IApplicationConfiguration } from 'common/electron-common/application';
import type { Event } from 'common/electron-common/base/event';
import type { DatabaseNamespace, Doc } from 'common/electron-common/database';
import type { TASKBAR_APPEARANCE } from 'common/electron-common/taskbar';
import type { IWallpaperConfiguration, IWallpaperPlayProgress, PlayRuntimeConfiguration } from 'common/electron-common/wallpaperPlayer';

declare namespace LiveMoe {
  interface Gui {}

  interface DbService {
    getNamespace(name: string): Promise<DatabaseNamespace>;
  }

  interface WindowsService {
    refresh(windowId: string): Promise<void>;

    toggleWindow(windowId: string): Promise<any>;
    addEventListener(eventName: string, windowId: string): Promise<Event<any>>;
    sendWindowMessage(
      windowId: string,
      eventName: string,
      ...args: any[]
    ): Promise<any>;
  }

  interface WallpaperPlayerService {
    getPlayList(): Promise<IWallpaperConfiguration[]>;
    getConfiguration(): Promise<PlayRuntimeConfiguration>;
    setConfiguration(configuration: PlayRuntimeConfiguration): Promise<PlayRuntimeConfiguration>;

    play(configuration?: IWallpaperConfiguration): Promise<boolean>;
    pause(): Promise<boolean>;
    prev(): Promise<boolean>;
    next(): Promise<boolean>;
    disable(): Promise<boolean>;
    enable(): Promise<boolean>;
    mute(): Promise<boolean>;
    sound(): Promise<boolean>;
    seek(value: number): Promise<boolean>;
    volume(value: number): Promise<boolean>;

    onPlay(): Promise<Event<any>>;
    onConfigChange(): Promise<Event<PlayRuntimeConfiguration>>;
    onProgress(): Promise<Event<IWallpaperPlayProgress>>;
  }

  interface ApplicationService {
    getConfiguration(): Promise<IApplicationConfiguration>;
    setConfiguration(configuration: IApplicationConfiguration): Promise<any>;

    onConfigChange(): Promise<Event<IApplicationConfiguration>>;
    quit(): Promise<any>;
  }

  interface TaskbarService {
    setTaskbar(appearance: TASKBAR_APPEARANCE): Promise<any>;
    getTaskbar(): Promise<TASKBAR_APPEARANCE>;
    onStyleChange(): Promise<Event<any>>;
  }

  interface TrayService {
    hide(): Promise<any>;
    onShow(): Promise<Event<Electron.Rectangle>>;
    onHide(): Promise<Event<any>>;
    setIgnoreMouseEvents(ignore: boolean): Promise<any>;
  }

  interface Platform {
    windows(): boolean;
    macos(): boolean;
    linux(): boolean;
  }

  interface GuiService {
    openFolder(path: string): Promise<boolean>;
  }

  interface ServerService {
    addCallerHandler: <T>(event: string, handler: IListener<T>) => void;
    addEventHandler: <T>(event: string, handler: IEventListener<T>) => void;
    removeEventHandler: (event: string) => void;
    removeCallerHandler: (event: string) => void;
  }

  interface RendererService {
    createServerService(channelName: string): ServerService;
  }
}
