import fs from 'fs'
import path from 'path'
import { pluginPath } from 'electron-main/utils'
import { dev } from 'common/electron-common/environment'
import type { PluginPackage } from 'common/electron-common/plugin'

export default class PluginLoader {
  private readonly pluginPath: string = pluginPath

  private readonly pluginConfigMap: Map<string, PluginPackage> = new Map()

  constructor() {
    this.loadPlugins()
  }

  // 加载插件
  loadPlugins(): void {
    /**
     * 先读取插件配置文件
     */
    const plugins = this.filterInvalidPlugin(this.getRawFiles())
    const pluginConfigurations = this.getPlguinConfigurations(plugins)

    pluginConfigurations.filter((config) => {
      try {
        this.checkPlguinConfiguration(config)
      }
      catch (error) {
        console.error(`plugin error: ${error}`)

        return false
      }
      return true
    }).forEach((plugin) => {
      this.pluginConfigMap.set(plugin.name, plugin)
    })

    // fix path
    this.pluginConfigMap.forEach(async(config) => {
      if (config.pluginType === 'mixin') {
        config.backend.entry = path.join(this.pluginPath, config.name, config.backend.entry)
        config.frontend.entry = path.join(this.pluginPath, config.name, config.frontend.entry)
      }
      else if (config.pluginType === 'frontend') {
        config.frontend.entry = path.join(this.pluginPath, config.name, config.frontend.entry)
      }
      else if (config.pluginType === 'backend') {
        config.backend.entry = path.join(this.pluginPath, config.name, config.backend.entry)
      }
    })
  }

  get plugins(): Map<string, PluginPackage> {
    return this.pluginConfigMap
  }

  getRawFiles() {
    return fs.readdirSync(this.pluginPath, { withFileTypes: true }).filter(Boolean)
  }

  filterInvalidPlugin(files: fs.Dirent[]) {
    return files.filter(file => file.isDirectory()).filter(file => fs.existsSync(path.join(this.pluginPath, file.name, 'package.json')))
  }

  checkPlguinConfiguration(config: PluginPackage) {
    if (!config.name)
      throw new Error('插件配置文件必须包含name字段')
    if (!config.displayName)
      throw new Error('插件配置文件必须包含version字段')
    if (!config.description)
      throw new Error('插件配置文件必须包含description字段')
    if (!config.author)
      throw new Error('插件配置文件必须包含author字段')
    if (!config.pluginType)
      throw new Error('插件配置文件必须包含pluginType字段')

    if (config.pluginType === 'mixin') {
      if (!config.backend)
        throw new Error('插件配置文件必须包含backend字段')
      if (!config.frontend)
        throw new Error('插件配置文件必须包含frontend字段')
    }

    if (config.pluginType === 'frontend') {
      if (!config.frontend)
        throw new Error('插件配置文件必须包含frontend字段')
    }

    if (config.pluginType === 'backend') {
      if (!config.backend)
        throw new Error('插件配置文件必须包含backend字段')
    }
  }

  getPlguinConfigurations(plugins: fs.Dirent[]) {
    return plugins.map<PluginPackage>((plugin) => {
      try {
        const pluginConfig = fs.readFileSync(path.join(this.pluginPath, plugin.name, 'package.json'), 'utf8')
        return JSON.parse(pluginConfig)
      }
      catch (error) {
        if (dev())
          console.error(error)
        return null
      }
    }).filter(Boolean)
  }
}
