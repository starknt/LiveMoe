import type { IPCMainServer } from '@livemoe/ipc/main'
import type Application from 'electron-main/Application'
import type { IDestroyable } from 'electron-main/common/lifecycle'
import type { IDialogWindowOptions, IWindow, IWindowConstructor } from 'electron-main/common/windows'
import { generateUuid } from '@livemoe/utils'
import { BrowserWindow, shell } from 'electron'
import type { IWindowOptions } from './WindowPool'
import WindowPool from './WindowPool'
import WindowEventBus from './WindowEventBus'

export interface WindowOptions {
  constructor?: IWindowConstructor
  options?: IWindowOptions
}
export type WindowId = string

/**
 * @feature 使用窗口池快速创建窗口
 * @feature 通过 `WindowManager` 管理窗口
 * @feature 提供通用的窗口创建接口
 * @description 窗口管理器, 用于管理窗口和快速创建窗口
 * @author Seven
 * @file `WindowManager.ts`
 * @date 2022-04-01
 * @version `0.0.1`
 */
export default class WindowManager implements IDestroyable {
  private static readonly MaxPoolSize = 2

  // 保存未初始化的窗口
  private readonly viewCollection = new Map<WindowId, WindowOptions>()

  // 保存初始化完毕的窗口
  private readonly windowCollection = new Map<WindowId, IWindow>()

  // 提供窗口与进程间的通信
  private readonly windowEventBus = new WindowEventBus(
    this.server,
    this.application,
  )

  private readonly windowPool = new WindowPool(
    this.server,
    this.windowEventBus,
    WindowManager.MaxPoolSize,
  )

  constructor(
    private readonly application: Application,
    private readonly server: IPCMainServer,
  ) {
    this.windowPool.onConsume(({ window, options }) => {
      options?.logic?.call(window)

      window.webContents.send('window:ctx', options.id ?? '')

      window.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return {
          action: 'deny',
        }
      })

      window.webContents.on('did-navigate', () => {
        window.webContents.send('window:ctx', options.id ?? '')
      })

      this.windowCollection.set(options.id, window)

      this.handleWindowEvents(options.id, window, options)
      this.handleWindowDestroy(options.id, window)
    })
  }

  /**
   * 通过注册窗口方式, 可以通过 Service 来创建窗口
   * @param window
   * @param options
   */
  registerWindow(
    id: string,
    options?: IWindowOptions,
    window?: IWindowConstructor,
  ) {
    if (this.windowCollection.has(id))
      return false
      // throw new Error(`Window ${id} has already registered`);

    if (options)
      options.id = id

    this.viewCollection.set(id, { constructor: window, options })

    this.windowEventBus.registerWindowCreator(id, (show) => {
      const window = this.handleInitalizedWindow(id)

      if (window)
        return window

      return this.handleUninitializedWindow(id, show)
    })

    return true
  }

  unregisterWindow(id: WindowId) {
    if (this.viewCollection.has(id)) {
      this.viewCollection.get(id)
      return true
    }

    return false
  }

  showWindowById(id: WindowId) {
    if (!this.windowCollection.has(id))
      throw new Error(`Window ${id} has not registered`)

    // 检查窗口是否已经创建
    let window = this.windowCollection.get(id)

    if (!window) {
      const view = this.viewCollection.get(id)
      if (!view)
        throw new Error(`Window ${id} has not registered`)

      window = this.windowPool.consume(view?.constructor, view?.options)
      this.handleWindowDestroy(id, window)
      this.windowCollection.set(id, window)
    }

    window?.show()

    return window
  }

  showDiglogWindow(options: IDialogWindowOptions): IWindow {
    const window = this.windowPool.consume(options)

    const id = generateUuid()
    this.windowCollection.set(id, window)
    Reflect.set(window, 'id', id)

    return window
  }

  hideWindowById(id: WindowId) {
    if (!this.windowCollection.has(id))
      return

    const window = this.windowCollection.get(id)
    if (window)
      !window.isVisible() && window.hide()
  }

  getWindowById(id: WindowId): IWindow | undefined {
    return this.windowCollection.get(id)
  }

  private handleInitalizedWindow(id: WindowId) {
    if (this.windowCollection.has(id)) {
      const window = this.windowCollection.get(id)!

      if (Reflect.has(window, 'toggle'))
        window.toggle()
      else
        window.show()

      return window
    }

    return null
  }

  private handleUninitializedWindow(id: WindowId, show: boolean) {
    if (!this.viewCollection.has(id))
      return null

    let window: IWindow

    const { constructor, options } = this.viewCollection.get(id)!

    if (options)
      options.id = id

    if (constructor)
      window = this.windowPool.consume(constructor, options)
    else
      window = this.windowPool.consume(options)

    if (options?.path)
      window.loadURL(options.path)

    window.center()

    if (show)
      window.show()

    return window
  }

  private handleWindowDestroy(id: WindowId, window: IWindow) {
    window.once('closed', () => {
      this.windowCollection.delete(id)
    })
  }

  private handleWindowEvents(
    id: WindowId,
    window: IWindow,
    options: IWindowOptions,
  ) {
    // TODO: 非侵入式的事件处理
    if (options.eventBus?.ipcEvent ?? true) {
      // 默认开启 ipcEvent
      this.windowEventBus.registerSubService(id, window)
    }

    if (options.eventBus?.windowEvent ?? true) {
      // 默认开启 windowEvent
      // this.windowEventBus.reg
    }

    this.windowEventBus.listenerWindowMessage(id, window)
  }

  destroy() {
    this.windowPool.destroy()
    this.windowEventBus.destroy()
    this.viewCollection.clear()
    this.windowCollection.forEach((window) => {
      if (!window?.isDestroyed?.())
        window.destroy()
    })
    this.windowCollection.clear()

    BrowserWindow.getAllWindows().forEach((window) => {
      window.destroy()
    })
  }
}
