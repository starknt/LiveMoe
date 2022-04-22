import { debounce } from 'common/electron-common/base/functional';
import { ipcRenderer } from 'electron';

/// **************************************************************  ///

// Video 壁纸相关
const videoPrefix = 'ipc:video';

const ipcMainVideoPlay = `${videoPrefix}:play`;
const ipcMainVideoPause = `${videoPrefix}:pause`;
const ipcMainVideoLoop = `${videoPrefix}:loop`;
// 快捷命令 toggle
const ipcMainVideoLoopToggle = `${videoPrefix}:loop:toggle`;

// 视频时间

const ipcWPStop = 'ipc:wp:stop';
const ipcWPStopCancelToken = 'ipc:wp:stop:canceltoken';
/// **************************************************************  ///

let video: HTMLVideoElement | null;
let liveVideoDiv;
// __video_instance__ video     __live_video__

window.addEventListener('load', () => {
  window.addEventListener('dblclick', (e) => {
    ipcRenderer.send('lm:wallpaper:viewMode', e.pageX, e.pageY);
  });

  ipcRenderer.on(ipcWPStop, () => {
    ipcRenderer.sendSync(ipcWPStopCancelToken);
  });

  liveVideoDiv = document.getElementById('__live_video__');
  // Video
  if (liveVideoDiv) {
    let config: {
      id: string;
      src: string;
    };

    video = <HTMLVideoElement>document.getElementById('__video_instance__');

    video.addEventListener('ended', () => {
      ipcRenderer.send('ipc:video:end');
    });

    video.addEventListener(
      'timeupdate',
      debounce(() => {
        if (video && !Number.isNaN(video.duration)) {
          const { currentTime, duration } = video;

          ipcRenderer.send('ipc:video:progress', {
            currentTime: currentTime,
            duration: duration,
          });
        }
      }, 5)
    );

    video.addEventListener('canplaythrough', () => {
      video && video.play();
    });

    ipcRenderer.on('lm:wallpaper:init', (_event, _config) => {
      config = _config;

      if (video) video.src = config.src;
    });

    ipcRenderer.on('ipc:video:progress', (_e, p) => {
      if (!video) return;

      const { paused } = video;

      video.currentTime =
        Math.floor(p.currentTime) % Math.floor(video.duration);

      if (paused) video.pause();
    });

    ipcRenderer.on(ipcMainVideoPlay, () => {
      if (!video) return;

      video.play();
    });

    ipcRenderer.on(ipcMainVideoPause, () => {
      if (!video) return;

      video.pause();
    });

    ipcRenderer.on(ipcMainVideoLoopToggle, () => {
      if (!video) return;

      video.loop = !video.loop;
    });

    ipcRenderer.on(ipcMainVideoLoop, (_e, loop: boolean) => {
      if (!video) return;

      video.loop = loop;
    });
  }

  // 通用
  ipcRenderer.on('ipc:volume', (_event, volume) => {
    const videos = document.getElementsByTagName('video');
    const audios = document.getElementsByTagName('audio');

    for (let i = 0; i < videos.length; i += 1) {
      if (volume > 1) {
        videos[i].volume = 1;
      } else if (volume < 0) {
        videos[i].volume = 0;
      } else {
        videos[i].volume = volume;
      }
    }

    for (let i = 0; i < audios.length; i += 1) {
      if (volume > 1) {
        audios[i].volume = 1;
      } else if (volume < 0) {
        audios[i].volume = 0;
      } else {
        audios[i].volume = volume;
      }
    }
  });

  ipcRenderer.on('ipc:mute', (_event, mute) => {
    const _mute = !!mute;

    const videos = document.getElementsByTagName('video');
    const audios = document.getElementsByTagName('audio');

    for (let i = 0; i < videos.length; i += 1) {
      videos[i].muted = _mute;
    }

    for (let i = 0; i < audios.length; i += 1) {
      audios[i].muted = _mute;
    }
  });
});
