import { Service } from 'common/electron-common'
import { Emitter, Event } from 'common/electron-common/base/event'
import { dev } from 'common/electron-common/environment'
import type { IBackendPlugin, IPluginContext, PluginPackage } from 'common/electron-common/plugin'
import { isClass } from 'common/electron-common/types'
import type { EventPreloadType } from 'common/electron-common/windows'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import type { IApplicationContext } from 'electron-main/common/application'
import PluginCore from './PluginCore'
import PluginLoader from './PluginLoader'

export default class PluginManager {
  private readonly channelName = 'lm:plugin'

  private readonly service: Service = new Service()

  private readonly core: PluginCore = new PluginCore()

  private readonly loader: PluginLoader = new PluginLoader()

  private readonly backendPlugins: Map<string, IBackendPlugin> = new Map()

  private readonly frontendPlugins: Map<string, PluginPackage> = new Map()

  private readonly initedEmitter = new Emitter<void>()

  readonly inited = this.initedEmitter.event

  context: IPluginContext

  constructor(appContext: IApplicationContext) {
    this.context = {
      ...appContext,
      tool: dev() ? require('win-func-tools') : __non_webpack_require__('win-func-tools'),
    }

    appContext.core.registerService(this.channelName, this.service)

    this.registerListener()
    let index = 0

    this.loader.plugins.forEach(async(config) => {
      if (config.pluginType === 'backend')
        await this.registerBackendPlugin(config)
      if (config.pluginType === 'frontend')
        await this.registerFrontendPlugin(config)
      if (config.pluginType === 'mixin') {
        await this.registerBackendPlugin(config)
        await this.registerFrontendPlugin(config)
      }
      index++
      if (index === this.loader.plugins.size - 1)
        setTimeout(() => this.initedEmitter.fire())
    })

    this.inited(() => {
      this.backendPlugins.forEach((plugin) => {
        plugin?.onReady?.()
      })
    })

    this.context.lifecycle.onQuit(() => {
      this.backendPlugins.forEach((plugin) => {
        plugin?.onDestroy?.()
      })
    })
  }

  registerListener() {
    this.service.registerCaller(WINDOW_MESSAGE_TYPE.IPC_CALL, async(preload: EventPreloadType) => {
      return await this.dispatchCallerEvent(preload)
    })

    this.service.registerListener(WINDOW_MESSAGE_TYPE.IPC_LISTEN, (preload: EventPreloadType) => {
      return this.dispatchListenerEvent(preload)
    })
  }

  async dispatchCallerEvent(preload: EventPreloadType) {
    switch (preload.event) {
      case 'plugin':
        return [...this.frontendPlugins.values()]
      default:
        return false
    }
  }

  dispatchListenerEvent(preload: EventPreloadType) {
    switch (preload.event) {
      default:
        return Event.None
    }
  }

  async registerBackendPlugin(plugin: PluginPackage) {
    // TODO: 这样写不太好, 插件内部出错的话, 会可能导致整个应用崩溃
    try {
      let Plugin = dev() ? await import(plugin.backend.entry).then(module => module.default) : __non_webpack_require__(plugin.backend.entry)

      Plugin = Plugin.default ? Plugin.default : Plugin

      if (isClass(Plugin)) {
        const pluginInstance = new Plugin(this.context)

        this.backendPlugins.set(plugin.name, pluginInstance)

        console.log(`register backend plugin: ${plugin.name}`)
      }
      else {
        console.error(`register backend plugin: ${plugin.name} failed, plugin must be a class`)
      }
    }
    catch (error) {
      console.error(`register backend plugin error: ${error}`)
    }
  }

  async registerFrontendPlugin(plugin: PluginPackage) {
    this.frontendPlugins.set(plugin.name, plugin)
  }

  destroy() {
    this.initedEmitter.dispose()

    this.backendPlugins.forEach((plugin) => {
      plugin?.onDestroy?.()
    })
  }
}
