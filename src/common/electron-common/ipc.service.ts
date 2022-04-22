import { CancellationToken } from './base/cancelablePromise';
import { Event } from './base/event';
import { IServerChannel } from './base/ipc';

export interface IServiceListener<T> {
  thisArg?: unknown;
  listener: IListener<T>;
}

export interface IServiceEventListener<T> {
  thisArg?: unknown;
  listener: IEventListener<T>;
}

export interface IListener<T> {
  (args: any, cancellationToken?: CancellationToken): Promise<T>;
}

export interface IEventListener<T> {
  (args: any): Event<T>;
}

export interface IService {
  registerCaller<T>(command: string, listener: IListener<T>): boolean;
  registerCaller<T>(
    command: string,
    listener: IListener<T>,
    ctx: string
  ): boolean;
  registerCaller<T>(
    command: string,
    listener: IListener<T>,
    thisArg: unknown
  ): boolean;

  removeCaller(command: string): boolean;
  removeCaller(command: string, ctx: string): boolean;

  registerListener<T>(event: string, listener: IEventListener<T>): boolean;
  registerListener<T>(
    event: string,
    listener: IEventListener<T>,
    ctx: string
  ): boolean;
  registerListener<T>(
    event: string,
    listener: IEventListener<T>,
    thisArg: unknown
  ): boolean;

  removeListener(event: string): boolean;
  removeListener(event: string, ctx: string): boolean;
}

export class Service implements IService, IServerChannel {
  private readonly eventIdentifier = 'lm:event';

  private readonly callerIdentifier = 'lm:caller';

  private readonly listeners = new Map<
    string,
    IServiceListener<unknown> | IServiceEventListener<unknown>
  >();

  registerCaller<T>(command: string, listener: IListener<T>): boolean;
  registerCaller<T>(
    command: string,
    listener: IListener<T>,
    ctx: string
  ): boolean;
  registerCaller<T>(
    command: string,
    listener: IListener<T>,
    thisArg: unknown
  ): boolean;
  registerCaller<T>(command: string, listener: IListener<T>, ctx?: unknown) {
    if (typeof ctx === 'string') {
      const callerIdentifier = `${this.callerIdentifier}:${command}:${ctx}`;

      if (this.listeners.has(callerIdentifier)) {
        return false;
      }

      this.listeners.set(callerIdentifier, { listener });
    } else {
      const callerIdentifier = `${this.callerIdentifier}:${command}`;

      if (this.listeners.has(callerIdentifier)) {
        return false;
      }

      this.listeners.set(callerIdentifier, { listener, thisArg: ctx });
    }

    return true;
  }

  removeCaller(command: string): boolean;
  removeCaller(command: string, ctx: string): boolean;
  removeCaller(command: string, ctx?: string) {
    if (ctx) {
      const callerIdentifier = `${this.callerIdentifier}:${command}:${ctx}`;
      return this.listeners.delete(callerIdentifier);
    }

    return this.listeners.delete(`${this.callerIdentifier}:${command}`);
  }

  registerListener<T>(event: string, listener: IEventListener<T>): boolean;
  registerListener<T>(
    event: string,
    listener: IEventListener<T>,
    ctx: string
  ): boolean;
  registerListener<T>(
    event: string,
    listener: IEventListener<T>,
    thisArg: unknown
  ): boolean;
  registerListener<T>(
    event: string,
    listener: IEventListener<T>,
    ctx?: unknown
  ) {
    if (typeof ctx === 'string') {
      const eventIdentifier = `${this.eventIdentifier}:${event}:${ctx}`;

      if (this.listeners.has(eventIdentifier)) {
        return false;
      }

      this.listeners.set(eventIdentifier, { listener });
    }

    this.listeners.set(`${this.eventIdentifier}:${event}`, {
      listener,
      thisArg: ctx,
    });

    return true;
  }

  removeListener(event: string): boolean;
  removeListener(event: string, ctx: string): boolean;
  removeListener(event: string, ctx?: string) {
    if (typeof ctx === 'string') {
      const eventIdentifier = `${this.eventIdentifier}:${event}:${ctx}`;
      return this.listeners.delete(eventIdentifier);
    }

    const eventIdentifier = `${this.eventIdentifier}:${event}`;
    return this.listeners.delete(eventIdentifier);
  }

  call<T>(
    ctx: string,
    command: string,
    arg?: any,
    cancellationToken?: CancellationToken
  ): Promise<T> {
    if (this.listeners.has(`${this.callerIdentifier}:${command}:${ctx}`)) {
      const litener = <IServiceListener<T>>(
        this.listeners.get(`${this.callerIdentifier}:${command}:${ctx}`)
      );

      return litener.listener.call(litener.thisArg, arg, cancellationToken);
    }

    if (this.listeners.has(`${this.callerIdentifier}:${command}`)) {
      const litener = <IServiceListener<T>>(
        this.listeners.get(`${this.callerIdentifier}:${command}`)
      );

      return litener.listener.call(litener.thisArg, arg);
    }

    return Promise.reject();
  }

  listen<T>(ctx: string, event: string, arg?: any): Event<T> {
    if (this.listeners.has(`${this.eventIdentifier}:${event}:${ctx}`)) {
      const litener = <IServiceEventListener<T>>(
        this.listeners.get(`${this.eventIdentifier}:${event}:${ctx}`)
      );

      return litener.listener.call(litener.thisArg, arg);
    }

    if (this.listeners.has(`${this.eventIdentifier}:${event}`)) {
      const litener = <IServiceEventListener<T>>(
        this.listeners.get(`${this.eventIdentifier}:${event}`)
      );

      return litener.listener.call(litener.thisArg, arg);
    }

    return Event.None;
  }
}
