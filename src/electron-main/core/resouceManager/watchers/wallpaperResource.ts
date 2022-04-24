import path from 'path'
import applicationLogger from 'common/electron-common/applicationLogger'
import { Emitter, Event } from 'common/electron-common/base/event'
import type { IEnvironmentConfiguration } from 'common/electron-common/configuration'
import type { IWallpaperConfigurationFileSchema } from 'common/electron-common/wallpaperLoader'
import type { IDestroyable } from 'electron-main/common/lifecycle'
import Chokidar from 'chokidar'

export default class WallpaperResourceWatcher implements IDestroyable {
  private resourcePath: string

  private _ready = false

  private readonly _onReady = new Emitter<void>()

  private readonly _onAddWallpaper = new Emitter<void>()

  private readonly _onError = new Emitter<Error>()

  readonly onReady = this._onReady.event

  readonly onAddWallpaper = this._onAddWallpaper.event

  readonly onError = this._onError.event

  private watcher: Chokidar.FSWatcher | null = null

  constructor(
    private readonly configuration: IEnvironmentConfiguration,
    private readonly validWallpaperSchema: IWallpaperConfigurationFileSchema[],
  ) {
    this.resourcePath = <string>(
      this.configuration.getApplicationConfiguration('resourcePath')
    )

    this.initalize()
  }

  initalize() {
    this.watcher = Chokidar.watch(`${this.resourcePath}`, {
      ignored: /(^|[/\\])\../,
      persistent: true,
      awaitWriteFinish: true,
      followSymlinks: false,
    })

    this.watcher.on('change', (path, stats) => {
      if (stats!.isDirectory())
        return

      const extension = path.split('.').pop()

      if (extension === 'json')
        this._onAddWallpaper.fire()
    })
      .on('ready', () => {
        this._ready = true
        this._onReady.fire()

        applicationLogger.info('wallpaper watcher ready')
      })
      .on('add', (filePath) => {
        for (let i = 0; i < this.validWallpaperSchema.length; i += 1) {
          if (this.validWallpaperSchema[i].ext === path.basename(filePath))
            return
        }
      })
      .on('unlinkDir', (path) => {})
      .on('error', error =>
        applicationLogger.error(`[LiveMoe ResouceWatcher] error: ${error}`),
      )
  }

  whenReady() {
    if (this._ready)
      return Promise.resolve()

    return Event.toPromise(this.onReady)
  }

  destroy(): void {
    this._onError.dispose()
    this._onReady.dispose()
    this._onAddWallpaper.dispose()
  }
}
