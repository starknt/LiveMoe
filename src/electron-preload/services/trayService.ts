import type { IChannel } from '@livemoe/ipc'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import type { LiveMoe } from 'livemoe'

const createTrayService = (trayService: IChannel): LiveMoe.TrayService => {
  return {
    hide: async() => {
      return trayService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'hide',
      })
    },
    onShow: async() => {
      return trayService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        event: 'show',
      })
    },
    onHide: async() => {
      return trayService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        event: 'hide',
      })
    },
    setIgnoreMouseEvents: async(ignore: boolean) => {
      return await trayService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'ignoreMouse',
        arg: [ignore],
      })
    },
  }
}

export default createTrayService
