import path from 'path'
import type { Event } from 'common/electron-common/base/event'
import { isNil } from 'common/electron-common/types'
import type {
  IWallpaperConfiguration,
  IWallpaperPlayProgress,
  IWallpaperPlayerPlayingConfiguration,
} from 'common/electron-common/wallpaperPlayer'
import { FileHelper } from 'common/electron-main/fileHelper'
import type { LoadFileOptions, LoadURLOptions } from 'electron'
import type { IDestroyable } from './lifecycle'

export interface IWallpaperFailLoadEvent {
  errorCode: number
  errorDescription: string
}

export interface IWallpaperView extends IDestroyable {
  readonly onDidFinshLoad: Event<void>
  readonly onDidFailLoad: Event<IWallpaperFailLoadEvent>

  get id(): number

  loadURL(url: string): Promise<void>
  loadURL(url: string, options: LoadURLOptions): Promise<void>

  loadFile(filePath: string): Promise<void>
  loadFile(filePath: string, options: LoadFileOptions): Promise<void>
}

export interface IWallpaperController {
  play(): void
  pause(): void
  prev(): void
  next(): void
}

export interface IWallpaperPlayer extends IWallpaperController, IDestroyable {
  readonly onReady: Event<void>
  readonly onPlayChanged: Event<IWallpaperConfiguration>
  readonly onPaused: Event<void>
  readonly onProgress: Event<IWallpaperPlayProgress>
  readonly onEnded: Event<void>
  readonly onClosed: Event<void>
  readonly onDestroy: Event<void>

  destroy(): void
}

export async function validateWallpaperConfiguration(
  configuration: IWallpaperConfiguration,
): Promise<boolean> {
  if (isNil(configuration) || typeof configuration !== 'object')
    return false

  if (typeof configuration.name !== 'string')
    return false

  if (typeof configuration.playPath !== 'string')
    return false

  if (!(await FileHelper.exists(configuration.playPath)))
    return false

  if (typeof configuration.resourcePath !== 'string')
    return false

  if (!(await FileHelper.exists(configuration.resourcePath)))
    return false

  if (
    isNil(configuration)
    || typeof configuration.rawConfiguration !== 'object'
  )
    return false

  if (typeof configuration.rawConfiguration._id !== 'string')
    return false

  if (typeof configuration.rawConfiguration.accessibility !== 'string')
    return false

  if (typeof configuration.rawConfiguration.author !== 'string')
    return false

  if (typeof configuration.rawConfiguration.createTime !== 'number')
    return false

  if (typeof configuration.rawConfiguration.description !== 'string')
    return false

  if (typeof configuration.rawConfiguration.name !== 'string')
    return false

  if (typeof configuration.rawConfiguration.preview !== 'string')
    return false

  if (
    !(await FileHelper.exists(
      path.join(
        configuration.resourcePath,
        configuration.preview,
      ),
    ))
  ) {
    if (
      await FileHelper.exists(path.join(configuration.resourcePath, configuration.preview))
    )
      return true

    return false
  }

  return true
}

export async function validatePlayingConfiguration(
  configuration: IWallpaperPlayerPlayingConfiguration,
): Promise<boolean> {
  if (isNil(configuration) || typeof configuration !== 'object')
    return false

  if (isNil(configuration) || typeof configuration.configuration !== 'object')
    return false

  const rest = await validateWallpaperConfiguration(
    configuration.configuration,
  )

  return rest
}
