import { Event } from 'common/electron-common/base/event'
import type { EventPreloadType } from 'common/electron-common/windows'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import { IWindow } from 'electron-main/common/windows'
import type { IWindowOptions } from 'electron-main/core/windowManager/WindowPool'
import { resolveHtmlPath } from 'electron-main/utils'

export default class MainWindow extends IWindow {
  static readonly id = 'main'

  static readonly configuration: IWindowOptions = {
    id: MainWindow.id,
    width: 1280,
    maxWidth: 1280,
    height: 760,
    maxHeight: 760,
    fullscreen: false,
    resizable: false,
    fullscreenable: false,
    path: resolveHtmlPath(MainWindow.id),
    logic: MainWindow.logic,
  }

  static logic(this: IWindow) {
    Reflect.set(this, 'handleCommand', (preload: EventPreloadType): any => {
      const { event: command, reply } = preload
      switch (command) {
        case 'toggle':
          this.toggle()
          break
        case 'show':
          this.show()
          break
        case 'hide':
          this.hide()
          break
        case 'min':
          this.minimize()
          break
        case 'max':
          this.maximize()
          break
        case 'fullscreen':
          this.setFullScreen(true)
          break
        case 'exitFullscreen':
          this.setFullScreen(false)
          break
        case 'exit':
          break
        case 'refresh':
          this.webContents.reloadIgnoringCache()
          break
        default:
          return -1
      }

      if (reply)
        reply(true)
    })

    Reflect.set(
      this,
      'processEvents',
      (type: WINDOW_MESSAGE_TYPE, preload: EventPreloadType): any => {
        if (
          type === WINDOW_MESSAGE_TYPE.IPC_LISTEN
          || type === WINDOW_MESSAGE_TYPE.WINDOW_LISTEN
        )
          return Reflect.get(this, 'handleEvent')(preload)

        return Reflect.get(this, 'handleCommand')(preload)
      },
    )

    Reflect.set(
      this,
      'handleEvent',
      (preload: EventPreloadType): Event<any> => {
        const { event } = preload
        switch (event) {
          case 'toggle':
            return Event.fromNodeEventEmitter(this, 'toggle', () =>
              this.isVisible(),
            )
          case 'show':
            return Event.fromNodeEventEmitter(this, 'show', () => false)
          case 'hide':
            return Event.fromNodeEventEmitter(this, 'hide', () => false)
          case 'min':
            return Event.fromNodeEventEmitter(this, 'min', () => false)
          case 'max':
            return Event.fromNodeEventEmitter(this, 'max', () => false)
          case 'fullscreen':
            return Event.fromNodeEventEmitter(this, 'fullscreen', () => false)
          case 'exitFullscreen':
            return Event.fromNodeEventEmitter(
              this,
              'exitFullscreen',
              () => false,
            )
          case 'exit':
            return Event.fromNodeEventEmitter(this, 'exit', () => false)
          default:
            return Event.None
        }
      },
    )
  }
}
