import { markTracked, NoneDispose, trackDisposable } from "./utils";

// only have a dispose way to release all listeners
export interface IDisposable {
  dispose(): void;
}

export interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining(): DOMHighResTimeStamp;
}

export class DisposableStore implements IDisposable {
  // 存储需要 dispose 的对象
  private readonly _toDispose: Set<IDisposable> = new Set<IDisposable>();

  // 是否已经全部 disaposed （释放） 完成
  private _isDisposed: boolean = false;

  // 释放所有 并标记为可追踪
  public dispose(): void {
    if (this._isDisposed) {
      return;
    }

    markTracked(this);
    this._isDisposed = true;
    this.clear();
  }

  // 释放所有 disposes 但并不标记为可追踪
  public clear(): void {
    this._toDispose.forEach(item => item.dispose());
    this._toDispose.clear();
  }

  public add<T extends IDisposable>(t: T): T {
    if (!t) {
      return t;
    }
    if ((t as any as DisposableStore) === this) {
      throw new Error('Cannot register a disposable on itself!');
    }

    markTracked(t);
    if (this._isDisposed) {
      console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack);
    } else {
      this._toDispose.add(t);
    }

    return t;
  }
}

export function isDisposable<E extends object>(thing: E): thing is E & IDisposable {
  return typeof (<IDisposable>(<any>thing)).dispose === 'function' && (<IDisposable>(<any>thing)).dispose.length === 0;
}

export function toDisposable(fn: () => void): IDisposable {
  const self = trackDisposable({
    dispose: () => {
      markTracked(self);
      fn();
    },
  });
  return self;
}

export function combinedDisposable(...disposables: IDisposable[]): IDisposable {
  disposables.forEach(markTracked);
  return trackDisposable({ dispose: () => dispose(disposables) });
}

// dispose 抽象类
export abstract class Disposable implements IDisposable {
  static None = NoneDispose; // 判断是否为空的 dispose 对象

  private readonly _store = new DisposableStore(); // 存储可释放对象
  public dispose(): void {
    markTracked(this);
    this._store.dispose();
  }

  protected _register<T extends IDisposable>(t: T): T {
    if ((t as any as Disposable) === this) {
      throw new Error('Cannot register a disposable on itself!');
    }
    return this._store.add(t);
  }
}

export function dispose<T extends IDisposable>(disposable: T): T;
export function dispose<T extends IDisposable>(disposable: T | undefined): T | undefined;
export function dispose<T extends IDisposable>(disposables: T[]): T[];
export function dispose<T extends IDisposable>(disposables: readonly T[]): readonly T[];
export function dispose<T extends IDisposable>(disposables: T | T[] | undefined): T | T[] | undefined {
  if (Array.isArray(disposables)) {
    disposables.forEach(d => {
      if (d) {
        markTracked(d);
        d.dispose();
      }
    });
    return [];
  } else if (disposables) {
    markTracked(disposables);
    disposables.dispose();
    return disposables;
  } else {
    return undefined;
  }
}
