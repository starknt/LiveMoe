import type { ChildProcessWithoutNullStreams } from 'child_process'
import { spawn } from 'child_process'
import { constants } from 'os'
import { Emitter } from 'common/electron-common/base/event'
import { win } from 'common/electron-common/environment'
import { resolveExtraPath } from 'electron-main/utils'
import type { IDestroyable } from 'electron-main/common/lifecycle'

export interface IWallpaperPlayerMsgProcessError {
  name: string
  description: string
}

class WallpaperPlayerMsgProcess implements IDestroyable {
  private readonly _onStart = new Emitter<void>()

  private readonly _onStop = new Emitter<void>()

  private readonly _onError = new Emitter<IWallpaperPlayerMsgProcessError>()

  private instance: ChildProcessWithoutNullStreams | null = null

  readonly onStart = this._onStart.event

  readonly onStop = this._onStop.event

  readonly onError = this._onError.event

  constructor(private readonly hWnd: number) {
    this.initalize()
  }

  initalize() {
    this.setup()
  }

  private setupWin() {
    if (this.instance)
      return

    try {
      this.instance = spawn('Wallpaper-Player.exe', [`--HWND=${this.hWnd}`], {
        windowsHide: true,
        cwd: resolveExtraPath('win', process.arch),
      })

      this._onStart.fire()
    }
    catch (err) {
      if (err instanceof Error)
        this._onError.fire({ name: err.name, description: err.message })
    }
  }

  public setup() {
    if (win())
      this.setupWin()
  }

  public kill() {
    if (!this.instance)
      return

    this.instance.kill(constants.signals.SIGINT)
    this.instance = null
    this._onStop.fire()
  }

  destroy(): void {
    this._onStart.dispose()
    this._onStop.dispose()
    this._onError.dispose()

    this.kill()
  }
}

export default WallpaperPlayerMsgProcess
