import { IChannel } from 'common/electron-common';
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows';
import * as is from 'common/electron-common/environment';
import { LiveMoe } from 'livemoe';

const createWindowsService = (
  windowsService: IChannel
): LiveMoe.WindowsService => {
  return {
    refresh: async (windowId: string) => {
      return await windowsService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'refresh',
        arg: windowId,
      });
    },

    toggleWindow: (windowId: string) => {
      return new Promise((resolve, reject) => {
        windowsService
          .call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
            type: WINDOW_MESSAGE_TYPE.IPC_CALL,
            event: 'window',
            arg: windowId,
          })
          .then((result) => {
            resolve(result);
          })
          .catch((error) => {
            reject(error);
            if (is.dev()) console.error(error);
          });
      });
    },
    addEventListener: (eventName: string, windowId: string) => {
      return new Promise((resolve) => {
        const event = windowsService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
          type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
          event: eventName,
          arg: [windowId],
        });

        resolve(event);
      });
    },
    sendWindowMessage: (
      windowId: string,
      eventName: string,
      ...args: any[]
    ) => {
      return windowsService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'command',
        arg: [windowId, eventName, ...args],
      });
    },
  };
};

export default createWindowsService;
