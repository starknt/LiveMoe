import { Service } from 'common/electron-common';
import {
  EventPreloadType,
  WINDOW_MESSAGE_TYPE,
} from 'common/electron-common/windows';
import { IPCMainServer } from 'common/electron-main';

export default class GuiService {
  private readonly channelName = 'lm:gui';

  private readonly service = new Service();

  constructor(private readonly server: IPCMainServer) {
    this.server.registerChannel(this.channelName, this.service);

    this.registerListener();
  }

  registerListener() {
    this.service.registerCaller(
      WINDOW_MESSAGE_TYPE.IPC_CALL,
      async (preload: EventPreloadType) => {
        return await this.dispatchCallerEventMessage(preload);
      }
    );
  }

  private async dispatchCallerEventMessage(preload: EventPreloadType) {
    switch (preload.event) {
      default:
        return false;
    }
  }
}
