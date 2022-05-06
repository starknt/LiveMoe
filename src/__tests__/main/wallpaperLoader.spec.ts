import type { Dirent } from 'fs'
import fs, { promises as fsPromises } from 'fs'
import path from 'path'
import type { IWallpaperConfigurationFileSchema, IWallpaperConfigurationUpUpFile } from 'common/electron-common/wallpaperLoader'
import { describe, expect, test } from 'vitest'
import type { IWallpaperConfigurationFile } from 'common/electron-common/wallpaperPlayer'
import { isNil } from '../../common/electron-common/types'
import { FileHelper } from '../../common/electron-main/fileHelper'

const resourcePath = path.join('F:\\LiveMoeResource')

async function loadRawWallpaperResources(resourcePath: string, validWallpaperSchema: IWallpaperConfigurationFileSchema[]) {
  return (
    await fsPromises.readdir(resourcePath, { withFileTypes: true })
  ).filter(d => d.isDirectory() && filterInvlidatePath(d, validWallpaperSchema))
}

function filterInvlidatePath(value: Dirent, validWallpaperSchema: IWallpaperConfigurationFileSchema[]) {
  const basePath = path.join(resourcePath, value.name)
  for (let i = 0; i < validWallpaperSchema.length; i += 1) {
    if (
      fs.existsSync(
        path.join(
          basePath,
            `${validWallpaperSchema[i].name}.${validWallpaperSchema[i].ext}`,
        ),
      )
    )
      return true
  }

  return false
}

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

describe('测试壁纸配置的转换是否正确', () => {
  test('测试壁纸配置的转换是否正确(1)', async() => {
    expect(await loadRawWallpaperResources(resourcePath, [])).toEqual([])
  }, 2)

  test('测试壁纸配置的转换是否正确(2)', async() => {
    const validWallpaperSchema: IWallpaperConfigurationFileSchema[] = []

    validWallpaperSchema.push({
      name: 'theme',
      ext: 'lmw',
      transform: transformLiveMoeConfiguration,
    })

    expect((await loadRawWallpaperResources(resourcePath, validWallpaperSchema)).length).toEqual(24)
  }, 2)

  test('测试壁纸配置的转换是否正确(3)', async() => {
    const validWallpaperSchema: IWallpaperConfigurationFileSchema[] = []

    validWallpaperSchema.push({
      name: 'theme',
      ext: 'upup',
      transform: transformUpUpConfiguration,
    })

    expect((await loadRawWallpaperResources(resourcePath, validWallpaperSchema)).length)
      .toBe(9)
  }, 2)
})
