import { Event } from 'common/electron-common/base/event'
import { app } from 'electron'

export const appReady = Event.fromNodeEventEmitter(app, 'ready')
export const appWillQuit = Event.fromNodeEventEmitter(app, 'will-quit')
