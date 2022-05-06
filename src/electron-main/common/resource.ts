import fs from 'fs'
import path from 'path'
import { isNil } from 'common/electron-common/types'
import type { IWallpaperConfigurationLivelyFile, IWallpaperConfigurationUpUpFile } from 'common/electron-common/wallpaperLoader'
import type { IWallpaperConfigurationFile } from 'common/electron-common/wallpaperPlayer'
import { FileHelper } from 'common/electron-main/fileHelper'

export namespace WallpaperResource {
  export function getPreviewPath(basePath: string, preview?: string) {
    if (preview && fs.existsSync(path.join(basePath, preview)))
      return path.join(basePath, preview)

    if (preview && fs.existsSync(preview))
      return preview

    for (let i = 0; i < FileHelper.ImageExt.length; i += 1) {
      const previewPath = path.join(
        basePath,
        `preview${FileHelper.ImageExt[i]}`,
      )
      if (fs.existsSync(previewPath))
        return previewPath
    }

    return null
  }

  export const validWallpaperExt = ['theme.lmw', 'theme.upup']

  export const wallpaperTypeMap = {
    3: 'html',
    2: 'html',
    1: 'video',
  }

  export function transformLiveMoeConfiguration(
    basePath: string,
    rawConfiguration: Record<string | symbol | number, unknown>,
  ): IWallpaperConfigurationFile | null {
    const configuration
      = rawConfiguration as unknown as IWallpaperConfigurationFile

    const previewPath = getPreviewPath(
      basePath,
      configuration?.preview || undefined,
    )

    if (!isNil(previewPath) && previewPath)
      configuration.preview = previewPath
    else
      return null

    return configuration
  }

  export function transformUpUpConfiguration(
    basePath: string,
    rawConfiguration: Record<string | symbol | number, unknown>,
  ): IWallpaperConfigurationFile | null {
    const upupFile
      = rawConfiguration as unknown as IWallpaperConfigurationUpUpFile

    const { name, preview, description, src } = upupFile
    let { themeType } = upupFile

    const previewPath = getPreviewPath(basePath, preview)

    if (!themeType) {
      // 检查src
      if (src && (src.endsWith('.html') || src.endsWith('.htm')))
        themeType = 2
      else if (src && src.endsWith('.mp4'))
        themeType = 1
      else
        return null
    }

    if (!themeType)
      return null
    if (!previewPath)
      return null

    const wallpaperConfiguration: IWallpaperConfigurationFile = {
      type: themeType,
      used: 1,
      url: '',
      _id: '',
      tags: [],
      createTime: Date.now(),
      uploadTime: -1,
      accessibility: 'private',
      version: 1,
      preview: previewPath,
      author: '',
      name: name || '',
      description: typeof description === 'string' ? description : '',
      src,
    }

    return wallpaperConfiguration
  }

  export function transformLivelyInfoConfiguration(
    basePath: string,
    rawConfiguration: Record<string | symbol | number, unknown>,
  ): IWallpaperConfigurationFile | null {
    const livelyInfoFile
      = rawConfiguration as unknown as IWallpaperConfigurationLivelyFile

    const { FileName, Desc, Preview, Title, Author } = livelyInfoFile

    const previewPath = getPreviewPath(basePath, Preview)

    let themeType: null | 2 | 1 | 3 = null

    if (FileName && (FileName.endsWith('.html') || FileName.endsWith('.htm')))
      themeType = 2
    else if (FileName && FileName.endsWith('.mp4'))
      themeType = 1
    else
      return null

    if (!themeType)
      return null
    if (!previewPath)
      return null

    const wallpaperConfiguration: IWallpaperConfigurationFile = {
      type: themeType,
      used: 1,
      url: '',
      _id: '',
      tags: [],
      createTime: Date.now(),
      uploadTime: -1,
      accessibility: 'private',
      version: 1,
      preview: previewPath,
      author: Author,
      name: Title ?? '',
      description: typeof Desc === 'string' ? Desc : '',
      src: FileName,
    }

    return wallpaperConfiguration
  }
}
