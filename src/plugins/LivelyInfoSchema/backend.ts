import type { IBackendPlugin, IPluginContext } from 'common/electron-common/plugin'
import type { IWallpaperConfigurationLivelyFile } from 'common/electron-common/wallpaperLoader'
import type { IWallpaperConfigurationFile } from 'common/electron-common/wallpaperPlayer'
import { WallpaperResource } from 'electron-main/common/resource'

function transformLivelyInfoConfiguration(
  basePath: string,
  rawConfiguration: Record<string | symbol | number, unknown>,
): IWallpaperConfigurationFile | null {
  const livelyInfoFile
      = rawConfiguration as unknown as IWallpaperConfigurationLivelyFile

  const { FileName, Desc, Preview, Title, Author } = livelyInfoFile

  const previewPath = WallpaperResource.getPreviewPath(basePath, Preview)

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

export default class LivelyInfoSchema implements IBackendPlugin {
  constructor(private readonly context: IPluginContext) {}

  onReady() {
    this.context.core.registerWallpaperSchema({
      name: 'LivelyInfo',
      ext: 'json',
      transform: transformLivelyInfoConfiguration.bind(this),
    })
  }
}
