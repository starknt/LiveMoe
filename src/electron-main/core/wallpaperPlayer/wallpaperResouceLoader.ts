import path from 'path'
import fs, { type Dirent, promises as fsPromises } from 'fs'
import { Emitter } from 'common/electron-common/base/event'
import type { IWallpaperConfiguration, IWallpaperConfigurationFile } from 'common/electron-common/wallpaperPlayer'
import type { IDestroyable } from 'electron-main/common/lifecycle'
import { FileHelper } from 'common/electron-main/fileHelper'
import applicationLogger from 'common/electron-common/applicationLogger'
import type { IWallpaperChangeEvent, IWallpaperConfigurationFileSchema, IWallpaperConfigurationFileWithBasePath } from 'common/electron-common/wallpaperLoader'
import { validateWallpaperConfiguration } from 'electron-main/common/wallpaperPlayer'
import type Application from 'electron-main/Application'
import { WallpaperResource } from 'electron-main/common/resource'
import { resolveGlobalAssets } from 'electron-main/utils'
import { extract } from 'common/electron-main/zip'
import { createCancelablePromise } from 'common/electron-common/base/cancelablePromise'
import { ApplicationNotification } from 'electron-main/common/notification'
import { retry } from 'common/electron-common/utils'
import { generateUuid } from 'common/electron-common/base/uuid'
import WallpaperResourceWatcher from './wallpaperResourceWatcher'

export default class WallpaperLoader implements IDestroyable {
  private resourcePath!: string

  private readonly validWallpaperSchema: IWallpaperConfigurationFileSchema[] = []

  private resourceWatcher: WallpaperResourceWatcher | null = null

  private readonly beforeLoadEmitter = new Emitter<void>()

  readonly onBeforeLoad = this.beforeLoadEmitter.event

  private readonly loadEmitter = new Emitter<void>()

  readonly onLoad = this.loadEmitter.event

  private afterLoadEmitter = new Emitter<IWallpaperConfiguration[]>()

  readonly onAfterLoad = this.afterLoadEmitter.event

  private onChangeEmitter = new Emitter<IWallpaperChangeEvent>()

  readonly onChange = this.onChangeEmitter.event

  constructor(private readonly application: Application) {
    this.resourcePath = application.configuration.resourcePath
    this.initalizWallpaperSchema()
  }

  async initalize() {
    this.resourceWatcher = new WallpaperResourceWatcher(this.application.context)

    await this.initalizeWallpaperResource()

    try {
      await retry(this.loadWallpapers.bind(this), 3)
    }
    catch (err) {
      ApplicationNotification.info(
        '无法加载壁纸资源, 请检查资源文件是否存在',
        'LiveMoe 错误',
      )
      this.afterLoadEmitter.fire([])
    }

    this.registerListener()
  }

  private initalizWallpaperSchema() {
    this.registerWallpaperSchema({
      name: 'theme',
      ext: 'lmw',
      transform: WallpaperResource.transformLiveMoeConfiguration,
    })
    this.registerWallpaperSchema({
      name: 'theme',
      ext: 'upup',
      transform: WallpaperResource.transformUpUpConfiguration,
    })
  }

  private async initalizeWallpaperResource() {
    if (fs.existsSync(this.resourcePath))
      return

    if (fs.existsSync(resolveGlobalAssets('LiveMoeResource.zip'))) {
      const extractZip = createCancelablePromise(async(cancelToken) => {
        try {
          await extract(
            resolveGlobalAssets('LiveMoeResource.zip'),
            path.resolve(this.resourcePath, '..'),
            {},
            cancelToken,
          )
          return true
        }
        catch {
          return false
        }
      })

      await extractZip
        .then((success) => {
          console.log('壁纸资源解压完毕', success)
        })
        .catch((err) => {
          console.error('壁纸资源解压失败', err)
          ApplicationNotification.info('壁纸资源解压失败')
        })
    }
  }

  private async loadWallpapers() {
    this.loadEmitter.fire()

    const rawWallpaperResources = await this.loadRawWallpaperResources()

    const baseWallpaperResources = rawWallpaperResources.map(
      this.parseWallpaperBaseConfiguration.bind(this),
    )

    const wallpaperConfigurations = await Promise.all(baseWallpaperResources)
      .then((configurationFiles) => {
        return <IWallpaperConfigurationFileWithBasePath[]>(
          configurationFiles.filter(Boolean)
        )
      })
      .then(this.transform2WallpaperResult.bind(this))
      .then(this.validateConfiguration.bind(this))
      .catch(err => console.error(err))

    this.afterLoadEmitter.fire(wallpaperConfigurations!)
  }

  private async reloadWallpapers() {
    const rawWallpaperResources = await this.loadRawWallpaperResources()

    const baseWallpaperResources = rawWallpaperResources.map(
      this.parseWallpaperBaseConfiguration.bind(this),
    )

    const wallpaperConfigurations = await Promise.all(baseWallpaperResources)
      .then((configurationFiles) => {
        return <IWallpaperConfigurationFileWithBasePath[]>(
          configurationFiles.filter(Boolean)
        )
      })
      .then(this.transform2WallpaperResult.bind(this))
      .then(this.validateConfiguration.bind(this))
      .catch(err => console.error(err))

    this.onChangeEmitter.fire({
      type: 'all',
      configuration: wallpaperConfigurations!,
      path: this.resourcePath,
    })
  }

  private async loadRawWallpaperResources() {
    applicationLogger.info(
      `本次加载壁纸资源, 所有的壁纸文件配置文件: ${this.validWallpaperSchema
        .map(schema => `${schema.name}.${schema.ext}`)
        .join(', ')}, 仓库地址为: ${this.resourcePath}`,
    )

    return (
      await fsPromises.readdir(this.resourcePath, { withFileTypes: true })
    ).filter(d => d.isDirectory() && this.filterInvlidatePath(d))
  }

  private filterInvlidatePath(value: Dirent) {
    const basePath = path.join(this.resourcePath, value.name)
    for (let i = 0; i < this.validWallpaperSchema.length; i += 1) {
      if (
        fs.existsSync(
          path.join(
            basePath,
            `${this.validWallpaperSchema[i].name}.${this.validWallpaperSchema[i].ext}`,
          ),
        )
      )
        return true
    }

    return false
  }

  private async parseWallpaperBaseConfiguration(value: Dirent) {
    const basePath = path.join(this.resourcePath, value.name)

    console.log('basePath', basePath)

    return await this.readWallpaperConfiguration(basePath)
  }

  private async readWallpaperConfiguration(basePath: string) {
    for (let i = 0; i < this.validWallpaperSchema.length; i += 1) {
      const themePath = path.join(
        basePath,
        `${this.validWallpaperSchema[i].name}.${this.validWallpaperSchema[i].ext}`,
      )

      if (!fs.existsSync(themePath))
        continue

      try {
        const rawConfiguration = await FileHelper.readJSON<
          Record<string | number | symbol, unknown>
        >(themePath)

        const transformRest = this.validWallpaperSchema[i].transform(
          basePath,
          rawConfiguration,
        )

        // if (transformRest !== null) {
        //   await FileHelper.writeJSON(path.join(basePath, 'theme.lmw'), transformRest)
        //     .then(v => v)
        //     .catch(err => console.error(err))
        //     .catch(err =>
        //       applicationLogger.error(
        //         'wallpaper loader output theme.lmw failed',
        //         err,
        //       ),
        //     )
        // }

        if (transformRest === null)
          return null

        return { basePath, ...transformRest }
      }
      catch (err) {
        console.error(err)

        applicationLogger.error(
          'wallpaper loader read configuration file failed',
          err,
        )

        return null
      }
    }

    return null
  }

  private transform2WallpaperResult(
    configurationFiles: IWallpaperConfigurationFileWithBasePath[],
  ) {
    return configurationFiles.map((configuration) => {
      return {
        id: generateUuid(),
        author: configuration.author,
        preview: configuration.preview,
        name: configuration.name,
        description: configuration.description,
        playPath: path.join(configuration.basePath, configuration.src),
        resourcePath: configuration.basePath,
        baseResourcePath: this.resourcePath,
        dirName: path.parse(configuration.basePath).name,
        rawConfiguration: {
          type: configuration.type,
          used: configuration.used,
          _id: configuration._id,
          tags: configuration.tags,
          createTime: configuration.createTime,
          uploadTime: configuration.uploadTime,
          accessibility: configuration.accessibility,
          version: configuration.version,
          preview: configuration.preview,
          author: configuration.author,
          name: configuration.name,
          description: configuration.description,
          src: configuration.src,
        } as IWallpaperConfigurationFile,
      } as IWallpaperConfiguration
    })
  }

  private validateConfiguration(configurationFiles: IWallpaperConfiguration[]) {
    console.log('validateConfiguration', configurationFiles.length)

    return configurationFiles.filter(
      async configuration =>
        await validateWallpaperConfiguration(configuration),
    )
  }

  private async registerListener() {
    this.application.onConfigChange(() => {
      if (this.application.configuration.resourcePath !== this.resourcePath) {
        this.resourcePath = this.application.configuration.resourcePath
        this.resourceWatcher?.restart(this.resourcePath)
        setTimeout(() => this.reloadWallpapers(), 1000)
      }
    })

    this.resourceWatcher?.onAddedDir(async(dirPath) => {
      // 检查是否是壁纸资源
      const result = await this.readWallpaperConfiguration(dirPath)

      if (!result)
        return

      const configuration = this.transform2WallpaperResult([result])[0]

      this.onChangeEmitter.fire({
        type: 'added',
        path: dirPath,
        configuration,
      })
    })

    this.resourceWatcher?.onDeleteDir((dirPath) => {
      this.onChangeEmitter.fire({
        type: 'deleted',
        path: dirPath,
        configuration: null,
      })
    })
  }

  registerWallpaperSchema(schema: IWallpaperConfigurationFileSchema) {
    // 注册一个壁纸的配置文件解析器
    this.validWallpaperSchema.push(schema)
  }

  destroy() {
    this.afterLoadEmitter.dispose()
    this.loadEmitter.dispose()
    this.beforeLoadEmitter.dispose()
    this.onChangeEmitter.dispose()
    this.resourceWatcher?.destroy()
  }
}
