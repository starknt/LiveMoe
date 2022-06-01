import { Event } from "@livemoe/utils";

type RevisionId = string;

export interface DatabaseNamespace {
  getNamespace(spaceName: string): DatabaseNamespace;
  put<T>(doc: Doc<T>): Promise<DBError | DocRes>;
  get<T = any>(id: string): Promise<DocRes<T> | null>;
  remove<T>(doc: Doc<T>): Promise<DBError | DocRes>;
  bulkDocs<T>(docs: Array<Doc<T>>): Promise<Array<DocRes | DBError>>;
  allDocs(namespace: string): Promise<Array<DocRes>>;
  changes(options?: PouchDB.Core.ChangesOptions): Event<PouchDB.Core.ChangesResponseChange<{}>>;
}

// TODO: 附件和索引
export interface Doc<T> {
  _id: string;
  data: T;
  _rev?: RevisionId;
  _attachments?: any;
}

export interface DocRes<T = any> {
  id?: string;
  ok?: boolean;
  data: T;
  _rev: RevisionId;
  _id: string;
}

export interface DBError {
  /**
   * HTTP Status Code during HTTP or HTTP-like operations
   */
  status?: number | undefined;
  name?: string | undefined;
  message?: string | undefined;
  reason?: string | undefined;
  error?: string | boolean | undefined;
  id?: string | undefined;
  rev?: RevisionId | undefined;
}

export interface AllDocsOptions {
  include_docs?: boolean;
  startkey?: string;
  endkey?: string;
  keys?: string[];
}
