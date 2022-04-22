import { win } from 'common/electron-common/environment';
import EventEmitter from 'events';
import {
  OpenMode,
  ObjectEncodingOptions,
  existsSync,
  Dirent,
  statSync,
} from 'fs';
import { cp, open, FlagAndOpenMode, mkdir } from 'fs/promises';
import { resolveGlobalAssets } from 'electron-main/utils';
import path, { dirname } from 'path';

export namespace FileHelper {
  export const ImageExt = ['.png', '.jpg', '.jpeg', '.gif'];

  // export async function exists(path: string[]): Promise<boolean>;
  export async function exists(path: string): Promise<boolean>;
  export async function exists(path: string) {
    return existsSync(path);

    // try {
    //   if (Array.isArray(path)) {
    //     for (let p of path) {
    //       await access(p);
    //     }
    //   } else {
    //     await access(path);
    //   }
    //   return true;
    // } catch (err) {
    //   console.error(err);

    //   return false;
    // }
  }

  export async function createDirectory(path: string): Promise<boolean> {
    try {
      const _path = dirname(path);
      await mkdir(_path, { recursive: true });
      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }

  export const createResoucePath = () => {
    if (win()) {
      const Dirve = ['F:', 'E:', 'D:', 'C:'];
      for (let i = 0; i < Dirve.length; i += 1) {
        if (existsSync(Dirve[i])) {
          return path.join(Dirve[i], 'LiveMoeResource');
        }
      }
    }

    return resolveGlobalAssets('LiveMoeResource');
  };

  export async function move(src: string, dest: string) {
    try {
      await cp(src, dest);
    } catch (err) {
      throw err;
    }
  }

  export async function readJSON<T extends any>(path: string): Promise<T>;
  export async function readJSON<T extends any>(
    path: string,
    options: { encoding?: null; flag?: OpenMode }
  ): Promise<T>;
  export async function readJSON<T extends any>(
    path: string,
    options?: { encoding?: null; flag?: OpenMode }
  ): Promise<T> {
    // 检查文件是否可操作
    const fileHandle = await open(path, 'r');
    try {
      const rest = JSON.parse((await fileHandle.readFile(options)).toString());

      return rest;
    } catch (err) {
      throw err;
    } finally {
      fileHandle.close();
    }
  }

  export async function writeJSON<T extends Record<string, any>>(
    path: string,
    data: T
  ): Promise<void>;
  export async function writeJSON<T extends Record<string, any>>(
    path: string,
    data: T,
    options:
      | BufferEncoding
      | (ObjectEncodingOptions & FlagAndOpenMode & EventEmitter.Abortable)
  ): Promise<void>;
  export async function writeJSON<T extends Record<string, any>>(
    path: string,
    data: T,
    options?:
      | BufferEncoding
      | (ObjectEncodingOptions & FlagAndOpenMode & EventEmitter.Abortable)
  ): Promise<void> {
    const fileHandle = await open(path, 'w+');

    try {
      const _data = JSON.stringify(data);

      await fileHandle.writeFile(_data, options);
    } catch (err) {
      throw err;
    } finally {
      await fileHandle.close();
    }
  }

  export function isDirectory(dir: Dirent[] | Dirent | string) {
    if (Array.isArray(dir)) {
      return Array.some(
        dir.map((v) => v.isDirectory()),
        (v) => v
      );
    } else if (typeof dir === 'object') {
      return dir.isDirectory();
    } else {
      return statSync(dir).isDirectory();
    }
  }

  export function filter<T extends any>(
    values: T[],
    fn: (value: T) => boolean
  ) {
    return values.filter(fn);
  }

  export function map<T extends any, R extends any>(
    value: T[],
    transform: (...args: T[]) => R
  ): R[] {
    return value.map((v) => transform(v));
  }
}
