import { IChannel } from 'common/electron-common';
import {
  DatabaseNamespace,
  Doc,
  DocRes,
  DBError,
} from 'common/electron-common/database';
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows';
import { LiveMoe } from 'livemoe';

const createDatabaseService = (dbService: IChannel): LiveMoe.DbService => {
  function getDocId(...args: Array<string>): string {
    return args.join('/');
  }

  function createNamespace(spaceName: string): DatabaseNamespace {
    return {
      put: async <T>(doc: Doc<T>) => {
        const result = await dbService.call<DocRes | DBError>(
          WINDOW_MESSAGE_TYPE.IPC_CALL,
          {
            type: WINDOW_MESSAGE_TYPE.IPC_CALL,
            event: 'put',
            arg: [spaceName, doc],
          }
        );
        return result;
      },
      get: async (id: string) => {
        try {
          const result: DocRes = await dbService.call(
            WINDOW_MESSAGE_TYPE.IPC_CALL,
            {
              type: WINDOW_MESSAGE_TYPE.IPC_CALL,
              event: 'get',
              arg: [spaceName, id],
            }
          );

          return result;
        } catch {
          return null;
        }
      },
      remove: async <T>(doc: Doc<T>) => {
        doc._id = getDocId(spaceName, doc._id);

        const result: DocRes = await dbService.call(
          WINDOW_MESSAGE_TYPE.IPC_CALL,
          {
            type: WINDOW_MESSAGE_TYPE.IPC_CALL,
            event: 'remove',
            arg: [doc],
          }
        );
        return result;
      },
      bulkDocs: async (docs: Doc<any>[]) => {
        docs = docs.map((doc) => {
          doc._id = getDocId(spaceName, doc._id);
          return doc;
        });

        const result: DocRes[] = await dbService.call(
          WINDOW_MESSAGE_TYPE.IPC_CALL,
          {
            type: WINDOW_MESSAGE_TYPE.IPC_CALL,
            event: 'bulkDocs',
            arg: [docs],
          }
        );
        return result;
      },
      allDocs: async (namespace?: string) => {
        const result: DocRes[] = await dbService.call(
          WINDOW_MESSAGE_TYPE.IPC_CALL,
          {
            type: WINDOW_MESSAGE_TYPE.IPC_CALL,
            event: 'allDocs',
            arg: [namespace ?? spaceName],
          }
        );
        return result;
      },
      changes: (options) => {
        return dbService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
          type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
          event: 'changes',
          arg: [spaceName, options],
        });
      },
      getNamespace: (spaceName) => {
        return createNamespace(spaceName);
      },
    };
  }

  return {
    getNamespace: async (spaceName) => {
      return createNamespace(spaceName);
    },
  };
};

export default createDatabaseService;
