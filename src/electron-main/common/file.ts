import nodePath from 'path'
import fs from 'fs-extra'
import { createDecorator } from '@livemoe/core'
import type { CancelablePromise } from '@livemoe/utils'
import { createCancelablePromise } from '@livemoe/utils'
import type { LoggerService } from 'electron-main/common/log'
import { ILoggerService } from 'electron-main/common/log'
import { IEnviromentService } from 'electron-main/core/services/environmentService'
import type { IExtractOptions, IFile } from './zip'
import { extract, zip } from './zip'

export interface IFileService {
  existsSync(path: string): boolean
  exists(path: string): Promise<boolean>

  is(path: string, type: 'file' | 'directory', exts?: string | string[]): Promise<boolean>
  is(paths: string[], type: 'file' | 'directory', exts?: string | string[]): Promise<boolean[]>
  isDirectory(paths: string[]): Promise<boolean[]>
  isDirectory(path: string): Promise<boolean>
  isFile(paths: string[]): Promise<boolean[]>
  isFile(path: string): Promise<boolean>
  isZip(path: string): Promise<boolean>
  isImage(path: string): Promise<boolean>
  isVideo(path: string): Promise<boolean>

  /**
   * @param path directory path
   */
  zip(path: string): Promise<CancelablePromise<string>>

  /**
   * @param path zip file path
   * @param dest dest directory
   * @param options
   */
  unzip(path: string, dest: string, options?: IExtractOptions): Promise<CancelablePromise<void>>

  writeFile(path: string, data: string): Promise<void>
  readFile(path: string, encoding: BufferEncoding): Promise<string>

  /**
   * @param path file path
   * @param data object data
   */
  writeJson<T extends Record<string | number, any>>(path: string, data: T): Promise<void>

  /**
   * @param path json file path
   */
  readJson<T>(path: string): Promise<T>
  /**
   * @param path `directory` or `file` path
   */
  remove(path: string): Promise<void>
}

export const IFileService = createDecorator<IFileService>('IFileService')

export class FileService implements IFileService {
  private readonly logger = this.loggerService.create(FileService.name)

  constructor(@ILoggerService private readonly loggerService: LoggerService, @IEnviromentService private readonly enviromentService: IEnviromentService) {}

  async isFile(paths: string[]): Promise<boolean[]>
  async isFile(path: string): Promise<boolean>
  async isFile(paths: string | string[]): Promise<boolean[] | boolean> {
    if (Array.isArray(paths))
      return this.is(paths, 'file')

    return await this.is(paths, 'file')
  }

  async isDirectory(paths: string[]): Promise<boolean[]>
  async isDirectory(path: string): Promise<boolean>
  async isDirectory(paths: string[] | string): Promise<boolean | boolean[]> {
    if (Array.isArray(paths))
      return this.is(paths, 'directory')

    return this.is(paths, 'directory')
  }

  writeFile(path: string, data: string): Promise<void> {
    return fs.writeFile(path, data)
  }

  readFile(path: string, encoding: BufferEncoding): Promise<string> {
    return fs.readFile(path, encoding)
  }

  writeJson<T extends Record<string | number, any>>(path: string, data: T): Promise<void> {
    return fs.writeJson(path, data)
  }

  readJson<T>(path: string): Promise<T> {
    return fs.readJson(path)
  }

  async zip(path: string): Promise<CancelablePromise<string>> {
    path = nodePath.normalize(path)

    const exists = await this.exists(path)

    if (!exists)
      throw new Error(`File ${path} does not exist`)

    const files = await this.readDir(path)

    const cancelablePromise = createCancelablePromise((token) => {
      token.onCancellationRequested(async() => {
        if (token.isCancellationRequested)
          return

        const exists = await this.exists(path)

        if (exists) {
          cancelablePromise.finally(() => {
            fs.unlink(path).catch((error) => {
              if (this.enviromentService.dev())
                this.logger.error(error)
            })
          })
        }
      })

      return zip(path, files)
    })

    return cancelablePromise
  }

  async unzip(path: string, dest: string, options?: IExtractOptions): Promise<CancelablePromise<void>> {
    path = nodePath.normalize(path)
    dest = nodePath.normalize(dest)

    const is = await this.isZip(path)

    if (!is) {
      this.enviromentService.dev() && this.logger.error(`File ${path} is not a zip file`)

      throw new Error(`File ${path} is not a zip file`)
    }

    const cancelablePromise = createCancelablePromise((token) => {
      return extract(path, dest, options, token)
    })

    return cancelablePromise
  }

  private async readDir(path: string): Promise<IFile[]> {
    const directory = await fs.readdir(path, { withFileTypes: true })
    const files: IFile[] = []

    for (const file of directory) {
      if (file.isFile()) {
        files.push({
          path: nodePath.join(path, file.name),
        })
      }

      if (file.isDirectory()) {
        const _files = await this.readDir(nodePath.join(path, file.name))

        files.push(..._files)
      }
    }

    return files
  }

  async is(path: string[], type: 'file' | 'directory', extensions?: string | string[]): Promise<boolean[]>
  async is(path: string, type: 'file' | 'directory', extensions?: string | string[]): Promise<boolean>
  async is(paths: string | string[], type: 'file' | 'directory', exts?: string | string[]): Promise<boolean | boolean[]> {
    if (Array.isArray(paths)) {
      const result: boolean[] = []

      for (const path of paths)
        result.push(await this.is(path, type, exts))

      return result
    }
    else {
      const stat = await fs.stat(paths)

      switch (type) {
        case 'file':
          if (Array.isArray(exts)) {
            const result: boolean[] = []

            for (const ext of exts)
              result.push(stat.isFile() && paths.endsWith(ext))

            return result.some(Boolean)
          }
          else if (exts) {
            return stat.isFile() && paths.endsWith(exts)
          }
          else {
            return stat.isFile()
          }
        case 'directory':
          return stat.isDirectory()
        default:
          return false
      }
    }
  }

  async isZip(path: string): Promise<boolean> {
    return this.is(path, 'file', ['zip'])
  }

  async isImage(path: string): Promise<boolean> {
    return this.is(path, 'file', ['jpg', 'jpeg', 'png', 'gif', 'bmp'])
  }

  async isVideo(path: string): Promise<boolean> {
    return this.is(path, 'file', ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'mpg', 'mpeg'])
  }

  existsSync(path: string): boolean {
    return fs.existsSync(path)
  }

  exists(path: string): Promise<boolean> {
    return fs.pathExists(path)
  }

  remove(path: string): Promise<void> {
    if (!this.exists(path))
      throw new Error(`File ${path} does not exist`)

    return fs.remove(path)
  }
}
