import type { Event } from 'common/electron-common/base/event'
import type { EventPreloadType, WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import type { IWindowOptions } from 'electron-main/core/windowManager/WindowPool'
import type { DatabaseNamespace } from 'common/electron-common/database'
import type { WindowId } from 'electron-main/core/windowManager/WindowManager'
import { app } from 'electron'
import type { IApplicationConfiguration } from 'common/electron-common/application'
import type { IWallpaperConfiguration } from 'common/electron-common/wallpaperPlayer'
import type { IServerChannel } from 'common/electron-common'
import { createResoucePath } from 'electron-main/utils'
import type { IWallpaperChangeEvent, IWallpaperConfigurationFileSchema } from 'common/electron-common/wallpaperLoader'
import type { IDialogWindowOptions, IWindow } from './windows'

export const DEFAULT_CONFIGURATION: IApplicationConfiguration = {
  selfStartup: false,
  autoUpdate: false,
  resourcePath: createResoucePath(),
  coldStartup: false,
  closeAction: {
    dialog: false,
    action: 'hide',
  },
  updateTips: false,
  mode: 'normal',
  application: {
    name: app.getName(),
    description: '',
    version: {
      app: app.getVersion(),
      chrome: process.versions.chrome,
      electron: process.versions.electron,
      node: process.versions.node,
      v8: process.versions.v8,
    },
  },
}

export interface IApplicationLifecycle {
  /** 初始化完毕 */
  onReady: Event<void>

  /** 加载壁纸资源前 */
  onBeforeLoad: Event<void>

  /** 加载壁纸资源中  */
  onLoad: Event<void>

  /** 加载壁纸资源后 */
  onAfterLoad: Event<IWallpaperConfiguration[]>

  /** 壁纸资源发生变化 */
  onChange: Event<IWallpaperChangeEvent>

  /** 退出程序 */
  onQuit: Event<void>
}

export interface CoreApi {
  /** 将获得一个操作数据库的API  */
  getNameSpace(spaceName: string): DatabaseNamespace
  /** 将获得一个应用配置的对象  */
  getApplicationConfiguration(): IApplicationConfiguration
  /** 监听应用配置的变化 */
  onApplicationConfigurationChange: Event<IApplicationConfiguration>
  /** 创建一个窗口 */
  showWindowById(id: string): IWindow
  registerWindow(windowId: WindowId, options: IWindowOptions): boolean
  unregisterWindow(windowId: WindowId): boolean
  /** 注册服务 */
  registerService(channelName: string, channel: IServerChannel<string>): boolean
  /** 注册一个壁纸配置加载模型 */
  registerWallpaperSchema(schema: IWallpaperConfigurationFileSchema): void
}

export interface IApplicationGUI {
  /** 返回一个对话框窗口 */
  showDialogWindow(options: IDialogWindowOptions): IWindow
}

export interface IApplicationContext {
  gui: IApplicationGUI
  /** 应用的核心API */
  core: CoreApi
  /** 应用的生命周期 */
  lifecycle: IApplicationLifecycle
  sendCallWindowMessage(
    channelName: string,
    event: string,
    ...args: unknown[]
  ): any
  sendListenWindowMessage(
    channelName: string,
    event: string,
    ...args: unknown[]
  ): Event<any>

  /** 注册消息处理器  */
  registerMessageHandler(
    channelName: string,
    event: (
      event: WINDOW_MESSAGE_TYPE,
      preload: EventPreloadType
    ) => void | Promise<any> | Event<any>
  ): boolean
  unregisterMessageHandler(channelName: string): boolean
}

/**
 * 提供主进程模块之间的通信
 */
export interface IApplicationEventBus<T = WINDOW_MESSAGE_TYPE> {
  events: Map<
    string,
    (event: T, preload: EventPreloadType) => Promise<any> | Event<any> | void
  >

  registerEvent(
    channelName: string,
    event: (
      event: T,
      preload: EventPreloadType
    ) => Promise<any> | Event<any> | void
  ): boolean

  unregisterEvent(channelName: string): boolean

  // 发送控制命令
  sendWindowMessage(channelName: string, preload: EventPreloadType): void

  dispatchEvents(channelName: string, preload: EventPreloadType): void
}
