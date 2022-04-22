import type { IChannel } from 'common/electron-common';
import type { LiveMoe } from 'livemoe';
import type { TASKBAR_APPEARANCE } from 'common/electron-common/taskbar';
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows';

const createTaskbarService = (
  taskbarService: IChannel
): LiveMoe.TaskbarService => {
  return {
    setTaskbar: async (appearance: TASKBAR_APPEARANCE) => {
      return taskbarService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'style',
        arg: appearance,
      });
    },
    getTaskbar: async () => {
      return taskbarService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'style',
      });
    },
    onStyleChange: async () => {
      return taskbarService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        event: 'style',
      });
    },
  };
};

export default createTaskbarService;
