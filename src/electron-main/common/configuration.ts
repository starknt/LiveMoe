/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IApplicationConfiguration } from 'common/electron-common/application'
import applicationLogger from 'common/electron-common/applicationLogger'
import { Emitter } from 'common/electron-common/base/event'
import type {
  IApplicationConfigurationChangeEvent,
  IConfigurationChangeEvent,
  IConfigurationKeyChangeEvent,
  IEnvironmentConfiguration,
  IPlayerConfigurationChangeEvent,
  IPlayerRuntimeConfigurationChangeEvent,
  Unsubscribe,
} from 'common/electron-common/configuration'
import { START_APPEARANCE } from 'common/electron-common/taskbar'
import type {
  IWallpaperPlayerConfiguration,
  IWallpaperPlayerRuntimeConfiguration,
} from 'common/electron-common/wallpaperPlayer'
import { FileHelper } from 'common/electron-main/fileHelper'
import { app } from 'electron'
import Store from 'electron-store'
import type { IDestroyable } from './lifecycle'

export class EnvironmentConfiguration
implements IEnvironmentConfiguration, IDestroyable {
  private readonly KEY = '10470c3b4b1fed12c3baac014be15fac67c6e815'

  private readonly EXT = 'lmconfiguration'

  private readonly application!: Store<IApplicationConfiguration>

  private readonly player!: Store<IWallpaperPlayerConfiguration>

  private readonly playerRuntime: Store<IWallpaperPlayerRuntimeConfiguration>

  private _onConfigurationChange = new Emitter<IConfigurationChangeEvent>()

  private _onPlayerConfigurationChange
    = new Emitter<IPlayerConfigurationChangeEvent>()

  private _onApplicationConfigurationChange
    = new Emitter<IApplicationConfigurationChangeEvent>()

  private readonly _onPlayerRuntimeConfigurationChange
    = new Emitter<IPlayerRuntimeConfigurationChangeEvent>()

  readonly onConfigurationChange = this._onConfigurationChange.event

  readonly onPlayerConfigurationChange
    = this._onPlayerConfigurationChange.event

  readonly onApplicationConfigurationChange
    = this._onApplicationConfigurationChange.event

  readonly onPlayerRuntimeConfigurationChange
    = this._onPlayerRuntimeConfigurationChange.event

  constructor() {
    try {
      this.application = new Store<IApplicationConfiguration>({
        name: 'lm.application',
        defaults: {
          selfStartup: false,
          autoUpdate: false,
          resourcePath: FileHelper.createResoucePath(),
          taskbar: {
            enabled: false,
            style: START_APPEARANCE,
          },
          cursor: {
            enabled: false,
            style: null,
          },
          coldStartup: false,
          closeAction: {
            dialog: false,
            action: 'hide',
          },
          updateTips: false,
          mode: 'normal',
          application: {
            name: app.getName(),
            description: '',
            version: {
              app: app.getVersion(),
              chrome: process.versions.chrome,
              electron: process.versions.electron,
              node: process.versions.node,
              v8: process.versions.v8,
            },
          },
        },
        schema: {
          selfStartup: {
            type: 'boolean',
          },
          autoUpdate: {
            type: 'boolean',
          },
          resourcePath: {
            type: 'string',
          },
          taskbar: {
            type: 'object',
          },
          cursor: {
            type: 'object',
            properties: {
              enabled: {
                type: 'boolean',
              },
              style: {
                type: ['object', 'null'],
              },
            },
          },
          coldStartup: {
            type: 'boolean',
          },
          closeAction: {
            type: 'object',
          },
          updateTips: {
            type: 'boolean',
          },
          mode: {
            type: 'string',
          },
          application: {
            type: 'object',
          },
        },
        watch: true,
        clearInvalidConfig: true,
        encryptionKey: this.KEY,
        fileExtension: this.EXT,
      })
    }
    catch (err) {
      console.error(err)
      applicationLogger.error(err)
    }

    try {
      this.player = new Store<IWallpaperPlayerConfiguration>({
        name: 'lm.player',
        defaults: {
          mute: false,
          mutePlay: false,
          volume: 40,
          desktop: {
            disabled: false,
            visible: true,
            onlyView: false,
          },
          playing: null,
          state: 'pending',
        },
        schema: {
          mute: {
            type: 'boolean',
          },
          mutePlay: {
            type: 'boolean',
          },
          volume: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
          },
          desktop: {
            type: 'object',
          },
          playing: {
            type: ['object', 'null'],
          },
          state: {
            type: 'string',
          },
        },
        watch: true,
        clearInvalidConfig: true,
        encryptionKey: this.KEY,
        fileExtension: this.EXT,
      })
    }
    catch (err) {
      console.error(err)
      applicationLogger.error(err)
    }

    this.playerRuntime = new Store<IWallpaperPlayerRuntimeConfiguration>({
      name: 'lm.player.runtime',
      defaults: {
        state: 'pending',
        type: 1,
        volume: 40,
        mute: false,
        loop: true,
        disabled: false,
        progress: null,
        wallpaperconfiguration: null,
      },
      encryptionKey: this.KEY,
      fileExtension: this.EXT,
    })

    this.initalize()
  }

  private initalize() {
    this.application.onDidAnyChange(() => {
      this._onApplicationConfigurationChange.fire({
        configuration: this.appConfiguration,
      })

      this._onConfigurationChange.fire({
        application: this.appConfiguration,
        player: this.playerConfiguration,
      })
    })

    this.player.onDidAnyChange(() => {
      this._onPlayerConfigurationChange.fire({
        configuration: this.playerConfiguration,
      })

      this._onConfigurationChange.fire({
        application: this.appConfiguration,
        player: this.playerConfiguration,
      })
    })

    this.playerRuntime.onDidAnyChange(() => {
      this._onPlayerRuntimeConfigurationChange.fire({
        configuration: this.playerRuntimeConfiguration,
      })
    })
  }

  get appConfiguration() {
    return this.application.store
  }

  get playerConfiguration() {
    return this.player.store
  }

  get playerRuntimeConfiguration() {
    return this.playerRuntime.store
  }

  onApplicationConfigurationDidChange<T extends any>(
    key: keyof IApplicationConfiguration,
    cb: IConfigurationKeyChangeEvent<T>,
    thisArg?: unknown,
  ) {
    return this.application.onDidChange(key, (nValue, oValue) => {
      if (nValue && oValue)
        cb.call(thisArg, <T>nValue, <T>oValue)
    })
  }

  onPlayerConfigurationDidChange<T extends any>(
    key: keyof IWallpaperPlayerConfiguration,
    cb: IConfigurationKeyChangeEvent<T>,
    thisArg?: unknown,
  ) {
    return this.player.onDidChange(key, (nValue, oValue) => {
      if (nValue && oValue)
        cb.call(thisArg, <T>nValue, <T>oValue)
    })
  }

  onPlayerRuntimeConfigurationDidChange<T extends any>(
    key: keyof IWallpaperPlayerRuntimeConfiguration,
    cb: IConfigurationKeyChangeEvent<T>,
    thisArg?: unknown,
  ): Unsubscribe {
    return this.playerRuntime.onDidChange(key, (nValue, oValue) => {
      if (nValue && oValue)
        cb.call(thisArg, <T>nValue, <T>oValue)
    })
  }

  setPlayerConfiguration(
    configuration: Partial<IWallpaperPlayerConfiguration>
  ): void

  setPlayerConfiguration(
    configuration: keyof IWallpaperPlayerConfiguration,
    value: unknown
  ): void

  setPlayerConfiguration(
    configuration:
    | Partial<IWallpaperPlayerConfiguration>
    | keyof IWallpaperPlayerConfiguration,
    value?: unknown,
  ): void {
    if (typeof configuration === 'object')
      this.player.set(configuration)

    if (typeof configuration === 'string')
      this.player.set(configuration, value)
  }

  setPlayerRuntimeConfiguration(
    configuration: Partial<IWallpaperPlayerRuntimeConfiguration>
  ): void

  setPlayerRuntimeConfiguration(
    configuration: keyof IWallpaperPlayerRuntimeConfiguration,
    value: unknown
  ): void

  setPlayerRuntimeConfiguration(
    configuration:
    | Partial<IWallpaperPlayerRuntimeConfiguration>
    | keyof IWallpaperPlayerRuntimeConfiguration,
    value?: unknown,
  ): void {
    if (typeof configuration === 'object')
      this.playerRuntime.set(configuration)
    else if (value)
      this.playerRuntime.set(configuration, value)
  }

  resetApplicationConfiguration(): void
  resetApplicationConfiguration(
    keys: (keyof IApplicationConfiguration)[]
  ): void

  resetApplicationConfiguration(keys?: (keyof IApplicationConfiguration)[]) {
    if (keys)
      this.application.reset(...keys)
    else this.application.clear()
  }

  resetPlayerConfiguration(): void
  resetPlayerConfiguration(keys: (keyof IWallpaperPlayerConfiguration)[]): void
  resetPlayerConfiguration(keys?: (keyof IWallpaperPlayerConfiguration)[]) {
    if (keys)
      this.player.reset(...keys)
    else this.player.clear()
  }

  resetPlayerRuntimeConfiguration(): void
  resetPlayerRuntimeConfiguration(
    keys: (keyof IWallpaperPlayerRuntimeConfiguration)[]
  ): void

  resetPlayerRuntimeConfiguration(
    keys?: (keyof IWallpaperPlayerRuntimeConfiguration)[],
  ): void {
    if (Array.isArray(keys))
      this.playerRuntime.reset(...keys)
    else
      this.playerRuntime.clear()
  }

  getPlayerConfiguration(key: keyof IWallpaperPlayerConfiguration): unknown
  getPlayerConfiguration(): IWallpaperPlayerConfiguration
  getPlayerConfiguration(
    key?: keyof IWallpaperPlayerConfiguration,
  ): unknown | IWallpaperPlayerConfiguration {
    if (typeof key === 'undefined')
      return this.player.store

    return this.player.get(key)
  }

  setApplicationConfiguration(
    configuration: keyof IApplicationConfiguration,
    value: unknown
  ): void

  setApplicationConfiguration(
    configuration: Partial<IApplicationConfiguration>
  ): void

  setApplicationConfiguration(
    configuration:
    | Partial<IApplicationConfiguration>
    | keyof IApplicationConfiguration,
    value?: unknown,
  ): void {
    if (typeof configuration === 'object')
      this.application.set(configuration)

    if (typeof configuration === 'string')
      this.application.set(configuration, value)
  }

  getApplicationConfiguration(key: keyof IApplicationConfiguration): unknown
  getApplicationConfiguration(): IApplicationConfiguration
  getApplicationConfiguration(
    key?: keyof IApplicationConfiguration,
  ): unknown | IApplicationConfiguration {
    if (typeof key === 'undefined')
      return this.application.store

    return this.application.get(key)
  }

  getPlayerRuntimeConfiguration<T>(
    key: keyof IWallpaperPlayerRuntimeConfiguration
  ): T

  getPlayerRuntimeConfiguration(): IWallpaperPlayerRuntimeConfiguration
  getPlayerRuntimeConfiguration<T = any>(
    key?: keyof IWallpaperPlayerRuntimeConfiguration,
  ): T | IWallpaperPlayerRuntimeConfiguration {
    if (key)
      return this.playerRuntime.get(key) as unknown as T

    return this.playerRuntime.store
  }

  destroy() {
    this._onConfigurationChange.dispose()
    this._onApplicationConfigurationChange.dispose()
    this._onPlayerConfigurationChange.dispose()
    this._onPlayerRuntimeConfigurationChange.dispose()
  }
}
