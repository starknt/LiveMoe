import type { IChannel } from '@livemoe/ipc'
import type { IWallpaperConfiguration, PlayerRuntimeConfiguration } from 'common/electron-common/wallpaperPlayer'
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
    setConfiguration: async(configuration: PlayerRuntimeConfiguration) => {
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
    toggle: async() => {
      return await wallpaperPlayerService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'toggle',
      })
    },
    mode: async(mode) => {
      return await wallpaperPlayerService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'mode',
        arg: mode,
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
    onPlaylistChange: async() => {
      return wallpaperPlayerService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        event: 'playlist',
      })
    },
  }
}

export default createWallpaperPlayerService
