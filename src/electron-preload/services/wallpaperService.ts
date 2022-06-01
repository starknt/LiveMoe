import type { IChannel } from '@livemoe/ipc'
import { WINDOW_MESSAGE_TYPE } from 'common/electron-common/windows'
import type { LiveMoe } from 'livemoe'

export default function createWallpaperService(wallpaperService: IChannel): LiveMoe.WallpaperService {
  return {
    createHtmlWallpaper: async(configuration) => {
      return await wallpaperService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'create:html',
        arg: configuration,
      })
    },
    createVideoWallpaper: async(configuration) => {
      return await wallpaperService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'create:video',
        arg: configuration,
      })
    },
    createImageWallpaper: async(configuration) => {
      return await wallpaperService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'create:picture',
        arg: configuration,
      })
    },

    changeRepository: async() => {
      return await wallpaperService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'change:repository',
      })
    },

    deleteWallpaper: async(configuration) => {
      return await wallpaperService.call(WINDOW_MESSAGE_TYPE.IPC_CALL, {
        type: WINDOW_MESSAGE_TYPE.IPC_CALL,
        event: 'delete',
        arg: configuration,
      })
    },

    onChangeRepositoryBefore: async() => {
      return wallpaperService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        event: 'change:repository:before',
      })
    },
    onChangeRepositoryAfter: async() => {
      return wallpaperService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        event: 'change:repository:after',
      })
    },
    onCreateStart: async() => {
      return wallpaperService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        event: 'create:start',
      })
    },
    onCreateEnd: async() => {
      return wallpaperService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        event: 'create:end',
      })
    },
    onMoveRepositoryBefore: async() => {
      return wallpaperService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        event: 'move:repository:before',
      })
    },
    onMoveRepositoryAfter: async() => {
      return wallpaperService.listen(WINDOW_MESSAGE_TYPE.IPC_LISTEN, {
        type: WINDOW_MESSAGE_TYPE.IPC_LISTEN,
        event: 'move:repository:after',
      })
    },
  }
}
