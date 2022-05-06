import { Emitter } from 'common/electron-common/base/event'
import { dev, win } from 'common/electron-common/environment'

export const enum QUERY_USER_FULLSCREEN_STATE {
  QUNS_NOT_PRESENT = 1,
  QUNS_BUSY,
  QUNS_RUNNING_D3D_FULL_SCREEN,
  QUNS_PRESENTATION_MODE,
  QUNS_ACCEPTS_NOTIFICATIONS,
  QUNS_QUIET_TIME,
  QUNS_APP,
}

type MapFullScreenState = Record<number, boolean>

export const mapFullScreenState: MapFullScreenState = {
  1: false,
  2: true,
  3: true,
  4: true,
  5: false,
  6: false,
  7: false,
}

const queryUserState = new Emitter<boolean>()
let trayVisible = false
export const setTrayVisible = (visible: boolean) => {
  trayVisible = visible
}

const queryUserStateCreater = () => {
  return setInterval(() => {
    if (win()) {
      // 检查Tray是否在前台
      if (trayVisible)
        return

      queryUserState.fire(
        mapFullScreenState[dev() ? require('win-func-tools') : __non_webpack_require__('win-func-tools').QueryUserState()],
      )
    }
  }, 1000)
}

let timer: NodeJS.Timeout | null = queryUserStateCreater()

export const stopQueryUserState = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

export const startQueryUserState = () => {
  if (!timer)
    timer = queryUserStateCreater()
}

export const QueryUserState = queryUserState.event
