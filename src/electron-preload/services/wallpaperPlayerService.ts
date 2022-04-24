import type { IChannel } from 'common/electron-common'
import type {
  IWallpaperConfiguration,
  PlayRuntimeConfiguration,
} from 'common/electron-common/wallpaperPlayer'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import type { LiveMoe } from 'livemoe'

const createWallpaperPlayerService = (
  wallpaperPlayerService: IChannel,
): LiveMoe.WallpaperPlayerService => {
  return {
    getPlayList: async() => {
      const result = await wallpaperPlayerService.call<
        IWallpaperConfiguration[]
      >(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'playlist',
      })
      return result
    },
    getConfiguration: async() => {
      return await wallpaperPlayerService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'configuration',
      })
    },
    setConfiguration: async(configuration: PlayRuntimeConfiguration) => {
      return await wallpaperPlayerService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'configuration',
        arg: configuration,
      })
    },

    play: async(configuration) => {
      return await wallpaperPlayerService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'play',
        arg: configuration,
      })
    },
    pause: async() => {
      return await wallpaperPlayerService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'pause',
      })
    },
    prev: async() => {
      return await wallpaperPlayerService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'prev',
      })
    },
    next: async() => {
      return await wallpaperPlayerService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'next',
      })
    },
    disable: async() => {
      return await wallpaperPlayerService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'disable',
      })
    },
    enable: async() => {
      return await wallpaperPlayerService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'enable',
      })
    },
    mute: async() => {
      return await wallpaperPlayerService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'mute',
      })
    },
    sound: async() => {
      return await wallpaperPlayerService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'sound',
      })
    },
    seek: async(time: number) => {
      return await wallpaperPlayerService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'seek',
        arg: time,
      })
    },
    volume: async(volume: number) => {
      return await wallpaperPlayerService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'volume',
        arg: volume,
      })
    },

    onConfigChange: async() => {
      return wallpaperPlayerService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        event: 'configuration',
      })
    },
    onPlay: async() => {
      return wallpaperPlayerService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        event: 'play',
      })
    },
    onProgress: async() => {
      return wallpaperPlayerService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        event: 'progress',
      })
    },
  }
}

export default createWallpaperPlayerService
