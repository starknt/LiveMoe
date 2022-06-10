import { createDecorator } from '@livemoe/core'
import type { IWindow } from 'electron-main/common/windows'
import { ILoggerService } from '../services/log'
import type { IWindowOptions } from './WindowPool'

export interface IWindowService {
  getWindow(id: string): IWindow
  registerWindow(windowId: string, options: IWindowOptions): boolean

  focus(id: string): boolean
  show(id: string): boolean
  hide(id: string): boolean
  close(id: string): boolean
  minimize(id: string): boolean
  maximize(id: string): boolean
  unmaximize(id: string): boolean
  isMaximized(id: string): boolean
  isMinimized(id: string): boolean
  isVisible(id: string): boolean
  isFocused(id: string): boolean
  isClosed(id: string): boolean
  isReady(id: string): boolean
  isLoaded(id: string): boolean
  isClosing(id: string): boolean
  isDestroyed(id: string): boolean
  isFullscreen(id: string): boolean
  isFullscreenable(id: string): boolean
  isResizable(id: string): boolean
  isMovable(id: string): boolean
  isMinimizable(id: string): boolean
  destroy(id: string): boolean
}

export const IWindowService = createDecorator<IWindowService>('IWindowService')

export class WindowService implements IWindowService {
  private readonly logger = this.loggerService.create('WindowService')

  constructor(@ILoggerService private readonly loggerService: ILoggerService) {}

  focus(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  close(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  minimize(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  maximize(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  unmaximize(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  isMaximized(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  isMinimized(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  isVisible(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  isFocused(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  isClosed(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  isReady(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  isLoaded(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  isClosing(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  isDestroyed(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  isFullscreen(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  isFullscreenable(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  isResizable(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  isMovable(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  isMinimizable(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  destroy(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  hide(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  focusWindow(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  show(id: string): boolean {
    throw new Error('Method not implemented.')
  }

  registerWindow(windowId: string, options: IWindowOptions): boolean {
    throw new Error('Method not implemented.')
  }

  getWindow(id: string): IWindow {
    throw new Error('Method not implemented.')
  }
}
