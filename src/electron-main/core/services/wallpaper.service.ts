import path from 'path'
import fs from 'fs'
import { IPCService as Service } from '@livemoe/ipc'
import type { IWallpaperConfiguration, IWallpaperConfigurationFile } from 'common/electron-common/wallpaperPlayer'
import type { EventPreloadType } from 'common/electron-common/windows'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import type { Server as IPCMainServer } from '@livemoe/ipc/main'
import type { IApplicationContext } from 'electron-main/common/application'
import { Emitter, Event, createCancelablePromise, generateUuid } from '@livemoe/utils'
import { FileHelper } from 'common/electron-main/fileHelper'
import template from 'art-template'
import { resolveArtTemplate } from 'electron-main/utils'
import type { IApplicationConfiguration } from 'common/electron-common/application'
import { extract } from 'common/electron-main/zip'
import { app } from 'electron'
import fsExtra from 'fs-extra'
import trash from 'trash'
import type { ChangeRepositoryEvent, MoveRepositoryEvent } from 'common/electron-common/wallpaper.service'

export default class WallpaperService {
  private readonly channelName = 'lm:wallpaper'

  private readonly service = new Service()

  private readonly onCreateStartEmitter = new Emitter<string>()

  private readonly onCreateEndedEmitter = new Emitter<string>()

  private readonly onChangeRepositoryBeforeEmitter = new Emitter<void>()

  private readonly onChangeRepositoryAfterEmitter = new Emitter<ChangeRepositoryEvent>()

  private readonly onMoveRepositoryBeforeEmitter = new Emitter<string>()

  private readonly onMoveRepositoryAfterEmitter = new Emitter<MoveRepositoryEvent>()

  readonly onCreateStart = this.onCreateStartEmitter.event

  readonly onChangeRepositoryBefore = this.onChangeRepositoryBeforeEmitter.event

  readonly onChangeRepositoryAfter = this.onChangeRepositoryAfterEmitter.event

  readonly onMoveRepositoryBefore = this.onMoveRepositoryBeforeEmitter.event

  readonly onMoveRepositoryAfter = this.onMoveRepositoryAfterEmitter.event

  readonly onCreateEnd = this.onCreateEndedEmitter.event

  constructor(private readonly server: IPCMainServer, private readonly context: IApplicationContext) {
    this.registerListener()
  }

  registerListener() {
    this.server.registerChannel(this.channelName, this.service)

    this.context.registerMessageHandler(this.channelName, (type, preload) => {
      switch (type) {
        case WINDOW_MESSAGE_TYPE.WINDOW_CALL:
          return this.dispatchCallerEvent(preload)
        case WINDOW_MESSAGE_TYPE.WINDOW_LISTEN:
          return this.dispatchListenerEvent(preload)
      }

      return Event.None
    })

    this.service.registerCaller(WINDOW_MESSAGE_TYPE.IPC_CALL, async(preload: EventPreloadType) => {
      return await this.dispatchCallerEvent(preload)
    })

    this.service.registerListener(WINDOW_MESSAGE_TYPE.IPC_LISTEN, (preload: EventPreloadType) => {
      return this.dispatchListenerEvent(preload)
    })
  }

  async dispatchCallerEvent(preload: EventPreloadType) {
    switch (preload.event) {
      case 'create:video':
        if (typeof preload.arg === 'object')
          return await this.createVideo(preload.arg)

        return false
      case 'create:html':
        if (typeof preload.arg === 'object')
          return await this.createHtml(preload.arg)
        return false
      case 'create:picture':
        if (typeof preload.arg === 'object')
          return await this.createPicture(preload.arg)
        return false

      case 'change:repository':
        return await this.changeRepository()
      case 'delete':
        if (typeof preload.arg === 'object')
          return await this.delete(preload.arg)

        return false
      default:
        return false
    }
  }

  dispatchListenerEvent(preload: EventPreloadType) {
    console.log('dispatchListenerEvent', preload)

    switch (preload.event) {
      case 'create:start':
        return this.onCreateStart
      case 'create:end':
        return this.onCreateEnd
      case 'change:repository:before':
        return this.onChangeRepositoryBefore
      case 'change:repository:after':
        return this.onChangeRepositoryAfter
      case 'move:repository:before':
        return this.onMoveRepositoryBefore
      case 'move:repository:after':
        return this.onMoveRepositoryAfter
      default:
        return Event.None
    }
  }

  async delete(configuration: IWallpaperConfiguration) {
    if (fs.existsSync(configuration.resourcePath)) {
      try {
        await trash(configuration.resourcePath)
        return true
      }
      catch (err) {
        console.error('删除失败', err)

        return false
      }
    }

    return false
  }

  async createVideo(configuration: IWallpaperConfigurationFile) {
    const applicationConfiguration = this.context.core.getApplicationConfiguration()

    // 生成文件夹
    const dirName = this.generateDir(applicationConfiguration)
    try {
      const file = path.parse(configuration.src)
      const preview = path.parse(configuration.preview)

      await fs.promises.copyFile(configuration.src, path.join(`${applicationConfiguration.resourcePath}`, `${dirName}`, `${file.base}`))
      await fs.promises.copyFile(configuration.preview, path.join(`${applicationConfiguration.resourcePath}`, `${dirName}`, `${preview.base}`))

      await FileHelper.writeJSON(path.join(`${applicationConfiguration.resourcePath}`, `${dirName}`, 'theme.lmw'), {
        ...configuration,
        src: file.base,
        preview: preview.base,
      })

      return true
    }
    catch {
      return false
    }
    finally {
      this.onCreateEndedEmitter.fire(dirName)
    }
  }

  async createHtml(configuration: IWallpaperConfigurationFile) {
    const applicationConfiguration = this.context.core.getApplicationConfiguration()

    const file = path.parse(configuration.src)
    const preview = path.parse(configuration.preview)

    const tempDirname = `livemoe-${file.name}`

    const tempDirPath = path.join(app.getPath('temp'), tempDirname)
    let dirName = this.generateDirName()

    try {
      this.onCreateStartEmitter.fire(dirName)

      while (fs.existsSync(path.join(`${applicationConfiguration.resourcePath}`, `${dirName}`)))
        dirName = this.generateDirName(generateUuid().substring(0, 2))

      // 解压到临时目录
      const cancelablePromise = createCancelablePromise(async(token) => {
        if (fs.existsSync(tempDirPath)) {
          await fs.promises.rm(tempDirPath, {
            recursive: true,
            force: true,
          })
        }
        else {
          await fs.promises.mkdir(tempDirPath)
        }

        await extract(configuration.src, tempDirPath, {}, token)
      })

      await cancelablePromise

      const result = fs.readdirSync(path.join(`${tempDirPath}`, file.name), { withFileTypes: true }).find(dir =>
        dir.name === 'index.html' && dir.isFile(),
      )

      if (!result)
        return false

      if (!fs.existsSync(path.join(tempDirPath, file.name)))
        return false

      // 移动文件夹
      await FileHelper.move(path.join(tempDirPath, file.name), path.join(`${applicationConfiguration.resourcePath}`, `${dirName}`))

      // 生成配置文件
      await fs.promises.copyFile(configuration.preview, path.join(`${applicationConfiguration.resourcePath}`, `${dirName}`, `${preview.base}`))

      await FileHelper.writeJSON(path.join(`${applicationConfiguration.resourcePath}`, `${dirName}`, 'theme.lmw'), {
        ...configuration,
        src: 'index.html',
        preview: preview.base,
      })

      return true
    }
    catch (error) {
      console.error(error)

      return false
    }
    finally {
      await FileHelper.rm(path.join(tempDirPath, file.name))
      await FileHelper.rm(tempDirPath)
      this.onCreateEndedEmitter.fire(dirName)
    }
  }

  async createPicture(configuration: IWallpaperConfigurationFile) {
    const applicationConfiguration = this.context.core.getApplicationConfiguration()

    // 生成文件夹
    const dirName = this.generateDir(applicationConfiguration)
    try {
      const html = template(resolveArtTemplate('picture'), {

      })

      const preview = path.parse(configuration.preview)

      const file = path.parse(configuration.src)

      await fs.promises.writeFile(path.join(`${applicationConfiguration.resourcePath}`, `${dirName}`, 'index.html'), html)

      await FileHelper.writeJSON(path.join(applicationConfiguration.resourcePath, `${dirName}`, 'theme.lmw'), {
        ...configuration,
        src: 'index.html',
        preview: preview.base,
      })
      await fs.promises.writeFile(path.join(applicationConfiguration.resourcePath, `${dirName}`, 'LMWConfig.json'), `
        var config = {"src":'${file.base}'}
      `)

      await fs.promises.copyFile(configuration.src, path.join(`${applicationConfiguration.resourcePath}`, `${dirName}`, `${file.base}`))
      await fs.promises.copyFile(configuration.preview, path.join(`${applicationConfiguration.resourcePath}`, `${dirName}`, `${preview.base}`))

      return true
    }
    catch {
      return false
    }
    finally {
      this.onCreateEndedEmitter.fire(dirName)
    }
  }

  async changeRepository() {
    this.onChangeRepositoryBeforeEmitter.fire()

    const result: string[] | undefined = await this.context.sendCallWindowMessage('lm:gui', 'open-dir', {
      title: '选择新的壁纸仓库',
      defaultPath: this.context.core.getApplicationConfiguration().resourcePath,
    } as Electron.OpenDialogOptions)

    if (!result) {
      this.onChangeRepositoryAfterEmitter.fire({
        type: 'cancel',
        repositoryPath: '',
      })

      return false
    }

    if (Array.isArray(result) && result.length > 0) {
      const repositoryPath = result[0]

      if (path.normalize(repositoryPath) === path.normalize(this.context.core.getApplicationConfiguration().resourcePath)) {
        this.onChangeRepositoryAfterEmitter.fire({
          type: 'cancel',
          repositoryPath,
        })

        return true
      }

      this.onChangeRepositoryAfterEmitter.fire({
        type: 'success',
        repositoryPath,
      })

      // 开始移动壁纸仓库
      setTimeout(() => {
        this.moveRepository(repositoryPath)
      }, 1000)

      return true
    }
    else {
      this.onChangeRepositoryAfterEmitter.fire({
        type: 'cancel',
        repositoryPath: '',
      })
    }

    return false
  }

  async moveRepository(repositoryPath: string) {
    const resourcePath = path.join(repositoryPath, 'LiveMoeResource')
    this.onMoveRepositoryBeforeEmitter.fire(resourcePath)
    try {
      const oldResourcePath = this.context.core.getApplicationConfiguration().resourcePath

      // 检查文件夹是否存在
      if (fsExtra.existsSync(resourcePath)) {
        // noop
      }
      else {
        // 先复制壁纸到新的仓库
        fsExtra.copySync(this.context.core.getApplicationConfiguration().resourcePath, resourcePath)
      }

      this.context.lifecycle.onChange(async(e) => {
        switch (e.type) {
          case 'all':
            try {
              console.log('oldResourcePath:', oldResourcePath)

              await fsExtra.emptyDir(oldResourcePath)
              fsExtra.removeSync(oldResourcePath)
            }
            catch (error) {
              console.error(error)
            }
            break
        }
      })

      this.onMoveRepositoryAfterEmitter.fire({
        type: 'success',
        repositoryPath: resourcePath,
      })
    }
    catch (error) {
      console.error('Error: ', error)
      this.onMoveRepositoryAfterEmitter.fire({
        type: 'error',
        repositoryPath: resourcePath,
      })
    }
  }

  generateDir(applicationConfiguration: IApplicationConfiguration) {
    // 创建文件夹
    let dirName = this.generateDirName()
    while (fs.existsSync(path.join(`${applicationConfiguration.resourcePath}`, `${dirName}`)))
      dirName = this.generateDirName(generateUuid().substring(0, 2))

    this.onCreateStartEmitter.fire(dirName)

    fs.mkdirSync(path.join(`${applicationConfiguration.resourcePath}`, `${dirName}`))
    return dirName
  }

  generateDirName(extra = '') {
    const date = new Date()

    return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${extra}`
  }

  destroy() {
    this.onCreateStartEmitter.dispose()
    this.onCreateEndedEmitter.dispose()
    this.onChangeRepositoryBeforeEmitter.dispose()
    this.onChangeRepositoryAfterEmitter.dispose()
    this.onMoveRepositoryBeforeEmitter.dispose()
    this.onMoveRepositoryAfterEmitter.dispose()
  }
}
