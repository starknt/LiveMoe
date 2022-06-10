import type { WriteStream } from 'fs'
import { createWriteStream, promises } from 'fs'
import type { Readable } from 'stream'
import path from 'path'
import type { Entry, ZipFile } from 'yauzl'
import { open as _openZip } from 'yauzl'
import * as yazl from 'yazl'
import type { CancellationToken } from '@livemoe/utils'
import { Sequencer, createCancelablePromise } from '@livemoe/utils'

export interface IExtractOptions {
  overwrite?: boolean

  /**
   * Source path within the ZIP archive. Only the files contained in this
   * path will be extracted.
   */
  sourcePath?: string
}

interface IOptions {
  sourcePathRegex: RegExp
}

export type ExtractErrorType = 'CorruptZip' | 'Incomplete'

export class ExtractError extends Error {
  readonly type?: ExtractErrorType
  readonly cause: Error

  constructor(type: ExtractErrorType | undefined, cause: Error) {
    let message = cause.message

    switch (type) {
      case 'CorruptZip':
        message = `Corrupt ZIP: ${message}`
        break
    }

    super(message)
    this.type = type
    this.cause = cause
  }
}

function modeFromEntry(entry: Entry) {
  const attr = entry.externalFileAttributes >> 16 || 33188

  return [448 /* S_IRWXU */, 56 /* S_IRWXG */, 7]
    .map(mask => attr & mask)
    .reduce((a, b) => a + b, attr & 61440 /* S_IFMT */)
}

function toExtractError(err: Error): ExtractError {
  if (err instanceof ExtractError)
    return err

  let type: ExtractErrorType | undefined

  if (/end of central directory record signature not found/.test(err.message))
    type = 'CorruptZip'

  return new ExtractError(type, err)
}

async function extractEntry(
  stream: Readable,
  fileName: string,
  mode: number,
  targetPath: string,
  token: CancellationToken,
): Promise<void> {
  const dirName = path.dirname(fileName)
  const targetDirName = path.join(targetPath, dirName)
  if (!targetDirName.startsWith(targetPath)) {
    return Promise.reject(
      new Error(`
        invalid file .Error extracting ${fileName}.
      `),
    )
  }
  const targetFileName = path.join(targetPath, fileName)

  let istream: WriteStream

  token.onCancellationRequested(() => {
    if (istream)
      istream.destroy()
  })

  await Promise.resolve(
    promises.mkdir(targetDirName, { recursive: true }),
  )
  return await new Promise<void>((resolve, reject) => {
    if (token.isCancellationRequested)
      return

    try {
      istream = createWriteStream(targetFileName, { mode })
      istream.once('close', () => resolve())
      istream.once('error', reject)
      stream.once('error', reject)
      stream.pipe(istream)
    }
    catch (error_1) {
      reject(error_1)
    }
  })
}

function extractZip(
  zipfile: ZipFile,
  targetPath: string,
  options: IOptions,
  token: CancellationToken,
): Promise<void> {
  let last = createCancelablePromise<void>(() => Promise.resolve())
  let extractedEntriesCount = 0

  token.onCancellationRequested(() => {
    last.cancel()
    zipfile.close()
  })

  return new Promise((resolve, reject) => {
    const throttler = new Sequencer()

    const readNextEntry = (token: CancellationToken) => {
      if (token.isCancellationRequested)
        return

      extractedEntriesCount++
      zipfile.readEntry()
    }

    zipfile.once('error', reject)
    zipfile.once('close', () =>
      last.then(() => {
        if (
          token.isCancellationRequested
          || zipfile.entryCount === extractedEntriesCount
        ) {
          resolve()
        }
        else {
          reject(
            new ExtractError(
              'Incomplete',
              new Error(
                'incompleteExtract'
                  + `Incomplete. Found {0} of {1} entries${
                  extractedEntriesCount
                  }${zipfile.entryCount}`,
              ),
            ),
          )
        }
      }, reject),
    )
    zipfile.readEntry()
    zipfile.on('entry', (entry: Entry) => {
      if (token.isCancellationRequested)
        return

      if (!options.sourcePathRegex.test(entry.fileName)) {
        readNextEntry(token)
        return
      }

      const fileName = entry.fileName.replace(options.sourcePathRegex, '')

      // directory file names end with '/'
      if (/\/$/.test(fileName)) {
        const targetFileName = path.join(targetPath, fileName)
        last = createCancelablePromise(token =>
          promises
            .mkdir(targetFileName, { recursive: true })
            .then(() => readNextEntry(token))
            .then(undefined, reject),
        )
        return
      }

      const stream = openZipStream(zipfile, entry)
      const mode = modeFromEntry(entry)

      last = createCancelablePromise(token =>
        throttler
          .queue(() =>
            stream.then(stream =>
              extractEntry(stream, fileName, mode, targetPath, token).then(() =>
                readNextEntry(token),
              ),
            ),
          )
          .then(null, reject),
      )
    })
  })
}

export function openZip(zipFile: string, lazy = false): Promise<ZipFile> {
  return new Promise<ZipFile>((resolve, reject) => {
    _openZip(
      zipFile,
      lazy ? { lazyEntries: true } : undefined!,
      (error: Error | null, zipfile?: ZipFile) => {
        if (error)
          reject(toExtractError(error))

        else
          resolve(zipfile!)
      },
    )
  })
}

function openZipStream(zipFile: ZipFile, entry: Entry): Promise<Readable> {
  return new Promise<Readable>((resolve, reject) => {
    zipFile.openReadStream(entry, (error: Error | null, stream?: Readable) => {
      if (error)
        reject(toExtractError(error))

      else
        resolve(stream!)
    })
  })
}

export interface IFile {
  path: string
  contents?: Buffer | string
  localPath?: string
}

export function zip(zipPath: string, files: IFile[]): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const zip = new yazl.ZipFile()
    files.forEach((f) => {
      if (f.contents) {
        zip.addBuffer(
          typeof f.contents === 'string'
            ? Buffer.from(f.contents, 'utf8')
            : f.contents,
          f.path,
        )
      }
      else if (f.localPath) {
        zip.addFile(f.localPath, f.path)
      }
    })
    zip.end()

    const zipStream = createWriteStream(zipPath)
    zip.outputStream.pipe(zipStream)

    zip.outputStream.once('error', reject)
    zipStream.once('error', reject)
    zipStream.once('finish', () => resolve(zipPath))
  })
}

export async function extract(
  zipPath: string,
  targetPath: string,
  options: IExtractOptions = {},
  token: CancellationToken,
): Promise<void> {
  const sourcePathRegex = new RegExp(
    options.sourcePath ? `^${options.sourcePath}` : '',
  )

  let promise = openZip(zipPath, true)

  if (options.overwrite) {
    promise = promise.then(zipfile =>
      promises.rm(targetPath).then(() => zipfile),
    )
  }

  const zipfile_1 = await promise
  return await extractZip(zipfile_1, targetPath, { sourcePathRegex }, token)
}

async function read(zipPath: string, filePath: string): Promise<Readable> {
  const zipfile = await openZip(zipPath)
  return await new Promise<Readable>((resolve, reject) => {
    zipfile.on('entry', (entry: Entry) => {
      if (entry.fileName === filePath) {
        openZipStream(zipfile, entry).then(
          stream => resolve(stream),
          err => reject(err),
        )
      }
    })

    zipfile.once('close', () => reject(new Error('notFound' + `${filePath} not found inside zip.`)),
    )
  })
}

export async function buffer(zipPath: string, filePath: string): Promise<Buffer> {
  const stream = await read(zipPath, filePath)
  return await new Promise<Buffer>((resolve, reject) => {
    const buffers: Buffer[] = []
    stream.once('error', reject)
    stream.on('data', (b: Buffer) => buffers.push(b))
    stream.on('end', () => resolve(Buffer.concat(buffers)))
  })
}
