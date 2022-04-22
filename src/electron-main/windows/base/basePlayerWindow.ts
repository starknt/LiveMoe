import { BrowserWindow, BrowserWindowConstructorOptions, Display } from 'electron';
import { screenWatcher } from 'electron-main/observables/screen.observable';

class BasePlayerWindow extends BrowserWindow {
  constructor(options: BrowserWindowConstructorOptions) {
    super(options);

    this.autoResize();
  }

  private autoResize() {
    screenWatcher((e) => {
      this.handleAutoResize(e.display);
    })
  }

  handleAutoResize(display: Display) {
    if (this.isDestroyed()) {
      return;
    }

    if (!display) return;

    const { size } = display;

    this.setFullScreen(true);
    this.setBounds(
      { x: 0, y: 0, height: size.height, width: size.width },
      true
    );
  }

  destroy() {
    super.destroy();
  }
}

export default BasePlayerWindow;
