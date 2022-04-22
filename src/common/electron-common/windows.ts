export const enum WINDOW_CHANNEL {
  MAIN = 'lm:main',
  PLAYER = 'lm:player',
  SETTINGS = 'lm:settings',
  WALLPAPER = 'lm:wallpaper:player',
  TRAY = 'lm:tray',
}

export const enum WINDOW_MESSAGE_TYPE {
  WINDOW_CALL = 'window-caller',
  WINDOW_LISTEN = 'window-listen',
  IPC_CALL = 'ipc-caller',
  IPC_LISTEN = 'ipc-listen',
}

export interface EventPreloadType {
  type: WINDOW_MESSAGE_TYPE;
  event: string;
  arg?: any | unknown[];
  reply?: (...args: unknown[]) => void;
}
