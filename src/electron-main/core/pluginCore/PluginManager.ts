import { Service } from 'common/electron-common'
import { Event } from 'common/electron-common/base/event'
import type { IBackendPlugin, PluginPackage } from 'common/electron-common/plugin'
import { isClass } from 'common/electron-common/types'
import type { EventPreloadType } from 'common/electron-common/windows'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import type { IApplicationContext } from 'electron-main/common/application'
import PluginCore from './PluginCore'
import PluginLoader from './PluginLoader'

interface PluginContext {}

export default class PluginManager {
  private readonly channelName = 'lm:plugin'

  private readonly service: Service = new Service()

  private readonly core: PluginCore = new PluginCore()

  private readonly loader: PluginLoader = new PluginLoader()

  private readonly backendPlugins: Map<string, IBackendPlugin> = new Map()

  private readonly frontendPlugins: Map<string, PluginPackage> = new Map()

  context: PluginContext

  constructor(appContext: IApplicationContext) {
    this.context = {
      ...appContext,
    }

    appContext.core.registerService(this.channelName, this.service)

    this.registerListener()

    this.loader.plugins.forEach((config) => {
      if (config.pluginType === 'backend')
        this.registerBackendPlugin(config)
      if (config.pluginType === 'frontend')
        this.registerFrontendPlugin(config)
      if (config.pluginType === 'mixin') {
        this.registerBackendPlugin(config)
        this.registerFrontendPlugin(config)
      }
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
      const Plugin = await import(plugin.backend.entry).then(module => module.default)

      if (isClass(Plugin)) {
        const pluginInstance = new Plugin(this.context)

        this.backendPlugins.set(plugin.name, pluginInstance)

        console.log(`register backend plugin: ${plugin.name}`, pluginInstance)
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
}
