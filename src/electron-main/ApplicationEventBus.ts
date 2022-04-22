import { Service } from 'common/electron-common';
import applicationLogger from 'common/electron-common/applicationLogger';
import { EventPreloadType, WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows';
import { IPCMainServer } from 'common/electron-main';
import { IApplicationEventBus } from './common/application';
import EventEmitter from 'events';
import { Event } from 'common/electron-common/base/event';
import { info } from './core/Logger/logger';

export default class ApplicationEventBus
  extends EventEmitter
  implements IApplicationEventBus
{
  protected readonly MAX_LISTENERS = 0;

  protected readonly channelName = 'lm:application';

  protected readonly applicationService = new Service();

  events: Map<
    string,
    (
      event: WINDOW_MESSAGE_TYPE,
      preload: EventPreloadType
    ) => void | Promise<any> | Event<any>
  >;

  constructor(protected readonly server: IPCMainServer) {
    super();
    this.setMaxListeners(this.MAX_LISTENERS);

    this.events = new Map();

    this.registerService();
  }

  private registerService() {
    try {
      this.server.registerChannel(this.channelName, this.applicationService);
      return true;
    } catch (err) {
      if (err instanceof Error)
        applicationLogger.error(`RegisterChannel Exception: ${err.message}`);
    }

    return false;
  }

  registerEvent(
    channelName: string,
    event: (
      event: WINDOW_MESSAGE_TYPE,
      preload: EventPreloadType
    ) => any | Promise<any> | Event<any>
  ): boolean {
    if (this.events.has(channelName)) {
      return false;
    }

    this.events.set(channelName, event);

    return true;
  }

  unregisterEvent(channelName: string): boolean {
    if (this.events.has(channelName)) {
      this.events.delete(channelName);
      return true;
    }

    return false;
  }

  sendWindowMessage(
    channelName: string,
    preload: EventPreloadType
  ): any | Event<any> {
    info('sendWindowMessage:', channelName, preload);

    if (this.events.has(channelName)) {
      return this.dispatchEvents(channelName, preload);
    }

    return this.handleNoop(preload);
  }

  handleNoop(preload: EventPreloadType) {
    if (preload.type === WINDOW_MESSAGE_TYPE.WINDOW_CALL) {
      return false;
    } else {
      return Event.None;
    }
  }

  dispatchEvents(channelName: string, preload: EventPreloadType) {
    return this.events.get(channelName)?.(preload.type, preload);
  }
}
