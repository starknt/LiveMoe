/* eslint-disable import/no-mutable-exports */
import { URL } from 'url'
import path from 'path'
import { dev } from 'common/electron-common/environment'

export let assetsPath: string
export let globalAssetsPath: string
export let pluginPath: string

if (dev()) {
  assetsPath = path.join(__dirname, 'template')
  globalAssetsPath = path.join(__dirname, '../../assets')
  pluginPath = path.join(__dirname, '../plugins')
}
else {
  assetsPath = path.join(__dirname, 'template')
  globalAssetsPath = path.join(process.resourcesPath, 'assets')
  pluginPath = path.join(process.resourcesPath, 'plugins')
}

export const resolveGlobalAssets = (...paths: string[]) => {
  return path.join(globalAssetsPath, ...paths)
}

export let resolveHtmlPath: (htmlFileName: string) => string

export const resolveWallpaperHtmlPath: (htmlFileName: string) => string = (
  htmlFileName: string,
) =>
  path.resolve(
    assetsPath,
    htmlFileName.endsWith('.html') ? htmlFileName : `${htmlFileName}.html`,
  )

export let resolvePreloadPath: (preloadFileName: string) => string

export let PanelsPath: string

if (dev())
  PanelsPath = path.join(__dirname, '../../release/app/dist/renderer')
else
  PanelsPath = path.join(__dirname, '../renderer')

if (dev()) {
  const port = process.env.PORT || 1212
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`https://localhost:${port}`)
    url.pathname = htmlFileName
    return url.href
  }

  resolvePreloadPath = (preloadFilePath: string) => {
    return `${path.resolve(
      __dirname,
      '../../release/app/dist/main',
      preloadFilePath.endsWith('.js')
        ? preloadFilePath
        : `${preloadFilePath}.js`,
    )}`
  }
}
else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file:///${path.resolve(
      __dirname,
      '../renderer/',
      htmlFileName,
      'index.html',
    )}`
  }

  resolvePreloadPath = (preloadFilePath: string) => {
    return `${path.resolve(
      __dirname,
      preloadFilePath.endsWith('.js')
        ? preloadFilePath
        : `${preloadFilePath}.js`,
    )}`
  }
}

export let resolveExtraPath: (...paths: string[]) => string

if (dev()) {
  resolveExtraPath = (...paths: string[]) =>
    path.join(__dirname, '../../extra', ...paths)
}
else {
  resolveExtraPath = (...paths: string[]) =>
    path.join(process.resourcesPath, 'extra', ...paths)
}
