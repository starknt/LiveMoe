import path from 'node:path'
import applicationLogger from 'common/electron-common/applicationLogger'
import type { Event } from '@livemoe/utils'
import { Emitter } from '@livemoe/utils'
import type { IDestroyable } from 'electron-main/common/lifecycle'
import Chokidar from 'chokidar'
import type { IApplicationContext } from 'electron-main/common/application'

export default class WallpaperResourceWatcher implements IDestroyable {
  private resourcePath: string

  private ready = false

  private readonly onAddedDirEmitter = new Emitter<string>()

  private readonly onDeleteDirEmitter = new Emitter<string>()

  private readonly onErrorEmitter = new Emitter<Error>()

  readonly onAddedDir = this.onAddedDirEmitter.event

  readonly onDeleteDir = this.onDeleteDirEmitter.event

  readonly onError = this.onErrorEmitter.event

  private onCreateWallpaperStart!: Event<string>

  private onCreateWallpaperEnded!: Event<string>

  private awaitDirs: string[] = []

  private watcher: Chokidar.FSWatcher | null = null

  constructor(
    private readonly context: IApplicationContext,
  ) {
    this.resourcePath = this.context.core.getApplicationConfiguration().resourcePath

    this.initalize()
    this.registerListener()
  }

  initalize() {
    this.watcher = Chokidar.watch(`${this.resourcePath}`, {
      ignored: /(^|[/\\])\../,
      persistent: true,
      awaitWriteFinish: true,
      followSymlinks: false,
      ignorePermissionErrors: true,
    })

    this.watcher
      .on('addDir', async(dirPath, stats) => {
        if (!stats || !this.ready)
          return

        if (!stats.isDirectory())
          return

        await new Promise<void>((resolve) => {
          const timer = setInterval(() => {
            if (!this.awaitDirs.includes(dirPath)) {
              clearInterval(timer)
              resolve()
            }
          }, 100)
        })

        if (path.resolve(dirPath, '..') === this.resourcePath)
          setTimeout(() => this.onAddedDirEmitter.fire(dirPath), 1000)

        console.log(`${dirPath} added`)
      })
      .on('unlinkDir', (dirPath) => {
        if (!this.ready)
          return

        this.onDeleteDirEmitter.fire(dirPath)

        console.log(`${dirPath} unlinkDir`)
      })
      .on('ready', () => {
        this.ready = true

        applicationLogger.info('wallpaper watcher ready')
      })
      .on('error', error =>
        applicationLogger.error(`[LiveMoe ResouceWatcher] error: ${error}`),
      )
  }

  registerListener() {
    this.context.lifecycle.onReady(() => {
      this.onCreateWallpaperStart = this.context.sendListenWindowMessage('lm:wallpaper', 'create:start')

      this.onCreateWallpaperEnded = this.context.sendListenWindowMessage('lm:wallpaper', 'create:ended')

      this.onCreateWallpaperStart((dir) => {
        console.log(`[WallpaperResourceWatcher] Create wallpaper start: ${dir}`)

        this.awaitDirs.push(dir)
      })

      this.onCreateWallpaperEnded((dir) => {
        console.log(`[WallpaperResourceWatcher] Create wallpaper ended: ${dir}`)

        this.awaitDirs.splice(this.awaitDirs.indexOf(dir), 1)
      })
    })
  }

  restart(path: string) {
    this.resourcePath = path

    if (this.watcher) {
      this.ready = false
      this.watcher.close()
      this.watcher = null
    }

    this.initalize()
  }

  destroy(): void {
    this.onAddedDirEmitter.dispose()
    this.onDeleteDirEmitter.dispose()
    this.onErrorEmitter.dispose()
  }
}
