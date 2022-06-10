import path from 'path'
import { IPCService as Service } from '@livemoe/ipc'
import type { IPCMainServer } from '@livemoe/ipc/main'
import type Application from 'electron-main/Application'
import type { DBError, DatabaseNamespace, Doc, DocRes } from 'common/electron-common/database'
import PouchDB from 'pouchdb'
import { Emitter, Event } from '@livemoe/utils'
import type { EventPreloadType } from 'common/electron-common/windows'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import { dev } from 'common/electron-common/environment'
import { Injectable, createDecorator } from '@livemoe/core'

export interface IDatabaseService {}

export const IDatabaseService = createDecorator<IDatabaseService>('IDatabaseService')

@Injectable(IDatabaseService)
export class DatabaseService implements IDatabaseService {}

export default class DataBase {
  private static instance: DataBase | null = null

  private readonly channelName = 'lm:db'

  private readonly service = new Service()

  private db!: PouchDB.Database

  private readonly docMaxByteLength = 1024 * 1024 * 2 // 2 MB

  public static getInstance(
    dataPath: string,
    server: IPCMainServer,
    application: Application,
    dataName = 'database',
  ): DataBase {
    if (DataBase.instance === null)
      DataBase.instance = new DataBase(dataPath, server, application, dataName)

    return DataBase.instance
  }

  private constructor(
    private readonly dataPath: string,
    private readonly server: IPCMainServer,
    private readonly application: Application,
    private readonly dataName = 'database',
  ) {
    this.init()
  }

  async init() {
    this.db = new PouchDB(path.join(this.dataPath, this.dataName), {
      auto_compaction: true,
    })

    this.db.setMaxListeners(Infinity)

    this.initalizeService()
  }

  errorInfo(name: string, message: string): DBError {
    return { error: true, name, message }
  }

  private checkDocSize<T>(doc: Doc<T>) {
    if (Buffer.byteLength(JSON.stringify(doc)) > this.docMaxByteLength) {
      return this.errorInfo(
        'exception',
        `doc max size ${this.docMaxByteLength / 1024 / 1024} M`,
      )
    }
    return false
  }

  /**
   * 创建一个命名空间
   * 在创建一个命名空间时，如果已经存在，则返回错误
   * 在该命名空间下，可以添加文档时, 文档 _id 会自动添加命名空间前缀
   * @param spaceName 命名空间
   *
   */
  getNamespace(spaceName: string) {
    return this.createNamespace(spaceName)
  }

  private initalizeService() {
    this.server.registerChannel(this.channelName, this.service)

    this.application.registerEvent(this.channelName, (type, preload) => {
      switch (type) {
        case WINDOW_MESSAGE_TYPE.WINDOW_CALL:
          return this.dispatchCallEvent(preload)
        case WINDOW_MESSAGE_TYPE.WINDOW_LISTEN:
          return this.dispatchListenEvent(preload)
      }

      return null ?? Event.None
    })

    this.service.registerCaller(
      WINDOW_MESSAGE_TYPE.IPC_CALL,
      async(preload: EventPreloadType) => {
        console.log('ipc call', preload)
        const result = await this.dispatchCallEvent(preload)
        console.log('ipc call result', result)
        return result
      },
    )

    this.service.registerListener(
      WINDOW_MESSAGE_TYPE.IPC_LISTEN,
      (preload: EventPreloadType) => {
        return this.dispatchListenEvent(preload)
      },
    )
  }

  private async dispatchCallEvent(preload: EventPreloadType) {
    switch (preload.event) {
      case 'put': {
        if (Array.isArray(preload.arg)) {
          const id = preload.arg[0] as string
          const doc = preload.arg[1] as Doc<any>

          if (!id && !doc)
            return null

          const result = await this.put(id, doc)

          return result
        }

        return null
      }
      case 'get': {
        if (Array.isArray(preload.arg)) {
          const spaceName: string = preload.arg[0] as string
          const id: string = preload.arg[1] as string

          if (!id && !spaceName)
            return null

          const result = await this.get(spaceName, id)

          return result
        }

        return null
      }
      case 'remove': {
        if (Array.isArray(preload.arg)) {
          const doc = preload.arg[0] as Doc<any>

          if (!doc)
            return null

          const result = await this.remove(doc)

          return result
        }

        return null
      }
      case 'bulkDocs': {
        if (Array.isArray(preload.arg)) {
          const docs = preload.arg[0] as Doc<any>[]

          if (!docs)
            return null

          const result = await this.bulkDocs(docs)

          return result
        }

        return []
      }
      case 'allDocs': {
        if (Array.isArray(preload.arg)) {
          const spaceName = preload.arg[0] as string

          const result = await this.allDocs(spaceName)

          return result
        }

        return null
      }
      default:
        return null
    }
  }

  private dispatchListenEvent(preload: EventPreloadType) {
    switch (preload.event) {
      case 'changes': {
        if (Array.isArray(preload.arg)) {
          const spaceName = preload.arg[0] as string
          const options = preload.arg[1] as PouchDB.Core.ChangesOptions

          if (!spaceName)
            return Event.None

          const result = this.changes(spaceName, options)

          return result
        }

        return Event.None
      }
      default:
        return Event.None
    }
  }

  private createNamespace(spaceName: string): DatabaseNamespace {
    return {
      put: async <T>(doc: Doc<T>) => {
        try {
          const result = await this.put(spaceName, doc)
          return result
        }
        catch (e: any) {
          return {
            id: this.getDocId(spaceName, doc._id),
            name: e.name,
            error: !0,
            message: e.message,
          }
        }
      },
      get: async(id: string) => {
        try {
          const result = await this.get(spaceName, id)

          return result
        }
        catch {
          return null
        }
      },
      remove: async <T>(doc: Doc<T>) => {
        return this.remove(doc, spaceName)
      },
      allDocs: async(namespace: string) => {
        return await this.allDocs(namespace)
      },
      bulkDocs: async(docs: Doc<any>[]) => {
        docs = docs.map((doc) => {
          doc._id = this.getDocId(spaceName, doc._id)
          return doc
        })

        return await this.bulkDocs(docs)
      },
      getNamespace: (spaceName) => {
        return this.getNamespace(spaceName)
      },
      changes: (
        options?: PouchDB.Core.ChangesOptions | undefined,
      ): Event<PouchDB.Core.ChangesResponseChange<{}>> => {
        return this.changes(spaceName, options)
      },
    }
  }

  async put<T>(name: string, doc: Doc<T>): Promise<DBError | DocRes> {
    try {
      this.checkDocSize(doc)

      const id = this.getDocId(name, doc._id)
      doc._id = id
      const result = await this.db.put(doc)
      result.id = this.replaceDocId(name, result.id)
      return result
    }
    catch (e: any) {
      doc._id = this.replaceDocId(name, doc._id)
      return { id: doc._id, name: e.name, error: !0, message: e.message }
    }
  }

  async get(spaceName: string, id: string): Promise<DocRes | null> {
    try {
      const result: DocRes = await this.db.get(this.getDocId(spaceName, id))
      result._id = this.replaceDocId(spaceName, result._id)
      return result
    }
    catch (e) {
      return null
    }
  }

  async remove<T>(
    doc: Doc<T>,
    spaceName?: string,
  ): Promise<DBError | DocRes<T>> {
    try {
      if (!doc._rev) {
        // throw new Error('doc._rev is required');
        return this.errorInfo('exception', 'doc._rev is required')
      }
      if (spaceName)
        doc._id = this.getDocId(spaceName, doc._id)

      const result = await this.db.remove(doc as any)
      return result
    }
    catch (e: any) {
      return { id: doc._id, name: e.name, error: !0, message: e.message }
    }
  }

  async bulkDocs<T>(docs: Array<Doc<T>>): Promise<Array<DocRes | DBError>> {
    try {
      const response = await this.db.bulkDocs(docs)

      const result: Array<DocRes | DBError> = response.map((item, index) => {
        if ((<PouchDB.Core.Response>item).ok) {
          return {
            _id: item.id ?? '',
            _rev: item.rev ?? '',
            ok: (<PouchDB.Core.Response>item).ok ?? false,
            data: docs[index].data,
          }
        }

        item = <PouchDB.Core.Error>item

        return {
          _id: item.id ?? '',
          ...item,
        } as DBError
      })

      return result
    }
    catch (e: any) {
      return []
    }
  }

  async allDocs(spaceName?: string): Promise<Array<DocRes>> {
    try {
      let result: PouchDB.Core.AllDocsResponse<{}>

      if (spaceName) {
        result = await this.db.allDocs({
          include_docs: true,
          startkey: spaceName,
          endkey: `${spaceName}\uFFFF`,
        })
      }
      else {
        result = await this.db.allDocs({
          include_docs: true,
        })
      }

      return result.rows.map((item) => {
        return {
          _id: (<any>item).doc._id,
          _rev: (<any>item).doc._rev,
          data: (<any>item).doc.data,
        }
      })
    }
    catch (e: any) {
      return []
    }
  }

  changes(
    spaceName: string,
    options?: PouchDB.Core.ChangesOptions | undefined,
  ): Event<PouchDB.Core.ChangesResponseChange<{}>> {
    const namespaceChange = new Emitter<
      PouchDB.Core.ChangesResponseChange<{}>
    >()
    this.db
      .changes({
        ...options,
        include_docs: true,
        live: true,
        since: 'now',
        filter: (doc) => {
          return doc._id.startsWith(spaceName)
        },
      })
      .on('change', (value) => {
        value.id = this.replaceDocId(spaceName, value.id)
        namespaceChange.fire(value)
      })

    return namespaceChange.event
  }

  private getDocId(...args: Array<string>): string {
    return args.join('/')
  }

  private replaceDocId(name: string, id: string): string {
    return id.replace(`${name}/`, '')
  }

  async destroy(): Promise<void> {
    return await this.db.close()
  }
}
