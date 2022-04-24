import { app } from 'electron'

export namespace AutoStartup {
  export const APP_LOGIN_SETTING = {
    args: ['--LiveMoe_autoStartup'],
  }

  export function enable(): Promise<void> {
    return new Promise<void>((resolve) => {
      const enabled = app.getLoginItemSettings(APP_LOGIN_SETTING).openAtLogin

      if (enabled)
        resolve()

      app.setLoginItemSettings({
        ...APP_LOGIN_SETTING,
        openAtLogin: true,
      })

      resolve()
    })
  }

  export function disable(): Promise<void> {
    return new Promise<void>((resolve) => {
      const enabled = app.getLoginItemSettings(APP_LOGIN_SETTING).openAtLogin

      if (enabled) {
        app.setLoginItemSettings({
          openAtLogin: false,
        })
      }

      resolve()
    })
  }

  export function isEnable(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const enabled = app.getLoginItemSettings(APP_LOGIN_SETTING).openAtLogin
      resolve(enabled)
    })
  }
}
