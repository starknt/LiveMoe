import { createDecorator } from '@livemoe/core'
import { Notification, dialog, shell } from 'electron'

export interface INativeService {
  /**
   * Notefication is supported by the current platform.
   */
  isSupported(): boolean

  /**
   * Show a notification.
   */
  showNotification(body: string, title?: string, timeout?: number): Promise<Notification | null>

  /**
   * Open a url in the default browser.
   */
  openUrl(url: string, options?: Electron.OpenExternalOptions): Promise<void>

  openFileDialog(path: string): Promise<Electron.OpenDialogReturnValue>
  openFileDialog(options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue>
  openFileDialog(path: string, options?: Electron.OpenDialogSyncOptions): Promise<Electron.OpenDialogReturnValue>
}

export const INativeService = createDecorator<INativeService>('INativeService')

export class NativeService implements INativeService {
  isSupported(): boolean {
    return Notification.isSupported()
  }

  private async createNotification(options: Electron.NotificationConstructorOptions, timeout = 2000): Promise<Notification | null> {
    if (this.isSupported()) {
      const notification = new Notification(options)

      notification.show()

      setTimeout(() => notification.close(), timeout)

      return notification
    }

    return null
  }

  async showNotification(body: string, title?: string, timeout = 2000): Promise<Notification | null> {
    return this.createNotification({
      body,
      title: title || 'LiveMoe',
    }, timeout)
  }

  async openUrl(url: string, options?: Electron.OpenExternalOptions): Promise<void> {
    return shell.openExternal(url, options)
  }

  async openFileDialog(path: string): Promise<Electron.OpenDialogReturnValue>
  async openFileDialog(options: Electron.OpenDialogSyncOptions): Promise<Electron.OpenDialogReturnValue>
  async openFileDialog(argv: string | Electron.OpenDialogSyncOptions): Promise<Electron.OpenDialogReturnValue> {
    if (typeof argv === 'string') {
      return dialog.showOpenDialog({
        defaultPath: argv,
        properties: ['openFile'],
      })
    }

    return dialog.showOpenDialog(argv)
  }
}
