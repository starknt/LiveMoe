import type { IDisposable } from 'common/electron-common/base/lifecycle'
import type { BrowserWindowConstructorOptions, Display } from 'electron'
import { Emitter, Event } from 'common/electron-common/base/event'
import { BrowserWindow } from 'electron'
import { screenWatcher } from 'electron-main/observables/screen.observable'

abstract class BaseWindow extends BrowserWindow {
  private _onReadyToShow = new Emitter<void>()

  private ready = false

  private onReadyToShow = this._onReadyToShow.event

  constructor(options: BrowserWindowConstructorOptions) {
    super(options)

    this.onReadyToShow(() => {
      this.ready = true
    })

    this.on('ready-to-show', () => this._onReadyToShow.fire())

    // 屏蔽右键菜单
    this.hookWindowMessage(278, () => {
      this.blur()
      this.focus()
      this.setEnabled(false)
      setTimeout(() => {
        this.setEnabled(true)
      }, 100)
      return true
    })
  }

  async show(): Promise<void> {
    await this.whenReadyToShow()

    return super.show()
  }

  async hide(): Promise<void> {
    await this.whenReadyToShow()

    return super.hide()
  }

  toggle() {
    if (!this.isVisible())
      this.show()
    else
      this.hide()

    this.emit('toggle', this.isVisible())
  }

  whenReadyToShow() {
    if (this.ready)
      return Promise.resolve()
    return Event.toPromise(this.onReadyToShow)
  }

  destroy() {
    this.unhookWindowMessage(278)
    this._onReadyToShow.dispose()
    super.destroy()
  }
}

class BaseAutoResizeWindow extends BaseWindow {
  private electronScreen: Display | null = null

  private screenWatcherDisposer: IDisposable | null = null

  constructor(private readonly options: BrowserWindowConstructorOptions) {
    super(options)

    this.autoResize()
  }

  private autoResize() {
    if (!this.options.transparent) {
      this.screenWatcherDisposer = screenWatcher((e) => {
        this.handleAutoResize(e.display)
      })
    }
  }

  private handleAutoResize(display: Display) {
    if (!this.electronScreen)
      this.electronScreen = display

    const { width: _oWidth, height: _oHeight } = (<Display> this.electronScreen)
      ?.workArea

    this.electronScreen = display

    if (this.isDestroyed()) {
      this.screenWatcherDisposer?.dispose()
      this.screenWatcherDisposer = null
      return
    }

    if (!display)
      return

    const { floor, abs } = Math
    const { workAreaSize } = display

    const { width: _width, height: _height } = this.getBounds()

    // const x = floor(abs(_x * scaleFactor));
    // const y = floor(abs(_y * scaleFactor));
    const width = floor(abs(workAreaSize.width / _oWidth) * _width)
    const height = floor(abs(workAreaSize.height / _oHeight) * _height)

    if (this.isFullScreen())
      this.setFullScreen(true)
    if (this.isSimpleFullScreen())
      this.setSimpleFullScreen(true)
    // this.setSize(width, height);
    this.setContentSize(width, height, true)
  }

  destroy() {
    super.destroy()
  }
}

export { BaseWindow, BaseAutoResizeWindow }
