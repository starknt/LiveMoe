import { IApplicationContext } from "electron-main/common/application";
import type WinFuncTools from 'win-func-tools'


export interface PluginLifecycle {
  /**
   * @description 应用配置加载完毕
   */
  onReady(): void

  /**
   * @description 加载壁纸资源前
   */
  onBeforeLoadWallpaper(): void

  /**
   * @description 加载壁纸资源后
   */
  onAfterLoadWallpaper(): void

  /**
   * @description 应用准备退出
   */
  onDestroy(): void
}

export interface IPluginContext extends IApplicationContext {
  tool: typeof WinFuncTools
}

export type IBackendPluginConstructor = new (context: IPluginContext) => any

export interface IBackendPlugin {
  onReady?(): void

  onBeforeLoadWallpaper?(): void

  onAfterLoadWallpaper?(): void

  onDestroy?(): void
}

export interface PluginPackage {
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  pluginType: 'frontend' | 'backend' | 'mixin';
  backend: Backend;
  frontend: Frontend;
}

export interface Backend {
  entry: string;
}

export interface Frontend {
  entry: string;
}
