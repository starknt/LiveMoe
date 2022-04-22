import { Emitter } from 'common/electron-common/base/event';
import {
  IWallpaperConfiguration,
  IWallpaperConfigurationFile,
} from 'common/electron-common/wallpaperPlayer';
import { IDestroyable } from 'electron-main/common/lifecycle';
import fsPromises from 'fs/promises';
import { FileHelper } from 'common/electron-main/fileHelper';
import applicationLogger from 'common/electron-common/applicationLogger';
import type {
  IWallpaperConfigurationFileSchema,
  IWallpaperResourceChangedEvent,
  IWallpaperResourcePathBeforeChangeEvent,
  IWallpaperResourcePathChangedEvent,
  IWallpaperConfigurationFileWithBasePath,
} from 'common/electron-common/wallpaperLoader';
import { validateWallpaperConfiguration } from 'electron-main/common/wallpaperPlayer';
import path from 'path';
import fs, { Dirent } from 'fs';
import Application from 'electron-main/Application';
import { WallpaperResource } from 'electron-main/common/resource';

export interface IAddWallpaperEvent {}

export default class WallpaperLoader implements IDestroyable {
  private resourcePath!: string;

  private readonly validWallpaperSchema: IWallpaperConfigurationFileSchema[] =
    [];

  private readonly _onResourceLoad = new Emitter<void>();

  private readonly _onResourceLoadEnded = new Emitter<
    IWallpaperConfiguration[]
  >();

  private readonly _onResourceChanged =
    new Emitter<IWallpaperResourceChangedEvent>();

  private readonly _onResourcePathBeforeChange =
    new Emitter<IWallpaperResourcePathBeforeChangeEvent>();

  private readonly _onResourcePathChanged =
    new Emitter<IWallpaperResourcePathChangedEvent>();

  /**
   * 准备加载壁纸资源
   */
  readonly onResourceLoad = this._onResourceLoad.event;

  /**
   * 第一次加载壁纸资源完毕
   */
  readonly onResourceLoadEnded = this._onResourceLoadEnded.event;

  /**
   * 壁纸资源发生变化
   */
  readonly onResourceChanged = this._onResourceChanged.event;

  /**
   * 准备移动壁纸资源
   */
  readonly onResourcePathBeforeChange = this._onResourcePathBeforeChange.event;

  /**
   * 移动壁纸资源完毕
   */
  readonly onResourcePathChanged = this._onResourcePathChanged.event;

  constructor(private readonly application: Application) {
    this.resourcePath = application.configuration.resourcePath;

    this.initalize();
  }

  private async initalize() {
    this.registerListener();

    this.initalizWallpaperSchema();

    try {
      await this.loadWallpapers();
    } catch (err) {
      console.error('加载壁纸资源出错', err);
      this._onResourceLoadEnded.fire([]);
    }
  }

  initalizWallpaperSchema() {
    this.registerWallpaperSchema({
      ext: 'theme.lmw',
      transform: WallpaperResource.transformLiveMoeConfiguration,
    });
    this.registerWallpaperSchema({
      ext: 'theme.upup',
      transform: WallpaperResource.transformUpUpConfiguration,
    });
  }

  private async loadWallpapers() {
    this._onResourceLoad.fire();

    const rawWallpaperResources = await this.loadRawWallpaperResources();

    const baseWallpaperResources = rawWallpaperResources.map(
      this.parseWallpaperBaseConfiguration.bind(this)
    );

    const wallpaperConfigurations = await Promise.all(baseWallpaperResources)
      .then((configurationFiles) => {
        return <IWallpaperConfigurationFileWithBasePath[]>(
          configurationFiles.filter(Boolean)
        );
      })
      .then(this.transform2WallpaperResult)
      .then(this.validateConfiguration)
      .then((wallpaperConfigurations) => wallpaperConfigurations)
      .catch((err) => console.error(err));

    this._onResourceLoadEnded.fire(wallpaperConfigurations!);
  }

  private async loadRawWallpaperResources() {
    return (
      await fsPromises.readdir(this.resourcePath, { withFileTypes: true })
    ).filter((d) => d.isDirectory() && this.filterInvlidatePath(d));
  }

  private filterInvlidatePath(value: Dirent) {
    const basePath = path.join(this.resourcePath, value.name);
    for (let i = 0; i < this.validWallpaperSchema.length; i += 1) {
      if (
        fs.existsSync(path.join(basePath, this.validWallpaperSchema[i].ext))
      ) {
        return true;
      }
    }

    return false;
  }

  private async parseWallpaperBaseConfiguration(value: Dirent) {
    const basePath = path.join(this.resourcePath, value.name);
    const themePath = path.join(basePath, 'theme.lmw');
    if (fs.existsSync(themePath)) {
      const rawConfiguration = await FileHelper.readJSON<
        Record<string | number | symbol, unknown>
      >(themePath);

      const transformRest = this.validWallpaperSchema[0].transform(
        basePath,
        rawConfiguration
      );

      if (transformRest === null) return null;

      return { basePath, ...transformRest };
    }

    for (let i = 1; i < this.validWallpaperSchema.length; i += 1) {
      const themePath = path.join(basePath, this.validWallpaperSchema[i].ext);

      if (!fs.existsSync(themePath)) return null;

      try {
        const rawConfiguration = await FileHelper.readJSON<
          Record<string | number | symbol, unknown>
        >(themePath);
        const transformRest = this.validWallpaperSchema[i].transform(
          basePath,
          rawConfiguration
        );

        if (transformRest !== null) {
          FileHelper.writeJSON(path.join(basePath, 'theme.lmw'), transformRest)
            .then((v) => v)
            .catch((err) => console.error(err))
            .catch((err) =>
              applicationLogger.error(
                'wallpaper loader output theme.lmw failed',
                err
              )
            );
        }

        if (transformRest === null) return null;

        return { basePath, ...transformRest };
      } catch (err) {
        console.error(err);

        applicationLogger.error(
          'wallpaper loader read configuration file failed',
          err
        );

        return null;
      }
    }

    return null;
  }

  private transform2WallpaperResult(
    configurationFiles: IWallpaperConfigurationFileWithBasePath[]
  ) {
    return configurationFiles.map((configuration) => {
      return {
        name: configuration.name,
        playPath: path.join(configuration.basePath, configuration.src),
        resourcePath: configuration.basePath,
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
      } as IWallpaperConfiguration;
    });
  }

  private validateConfiguration(configurationFiles: IWallpaperConfiguration[]) {
    return configurationFiles.filter(
      async (configuration) =>
        await validateWallpaperConfiguration(configuration)
    );
  }

  private async registerListener() {
    this.application.onConfigChange(() => {
      this.resourcePath =
        this.application.configuration.resourcePath;
    });
  }

  private registerWallpaperSchema(schema: IWallpaperConfigurationFileSchema) {
    // 注册一个壁纸的配置文件解析器
    this.validWallpaperSchema.push(schema);
  }

  destroy() {
    this._onResourceLoad.dispose();
    this._onResourceLoadEnded.dispose();
    this._onResourceChanged.dispose();
    this._onResourcePathChanged.dispose();
    this._onResourcePathBeforeChange.dispose();
  }
}
