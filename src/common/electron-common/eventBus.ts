type RemoveEventChannl = Function;

export interface IEventListener {
  (...args: any[]): void;
}

export interface IEventBus {
  registerEventChannel(
    channel: string,
    listener: EventListener
  ): RemoveEventChannl;

  emitEvent(channel: string, ...args: unknown[]): any;
}

export abstract class EventBus implements IEventBus {
  private readonly channels = new Map<string, IEventListener>();

  registerEventChannel(channel: string, listener: EventListener): Function {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, listener);
    }

    return () => {
      if (this.channels.has(channel)) {
        this.channels.delete(channel);
      }
    };
  }

  emitEvent(channel: string, ...args: unknown[]) {
    if(this.channels.has(channel)) {
      const listener = <IEventListener>this.channels.get(channel);

      const result = listener(...args);

      return result;
    }

    return null;
  }
}
