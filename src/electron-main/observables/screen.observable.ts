import type { Display } from 'electron'
import { screen } from 'electron'
import { Event } from 'common/electron-common/base/event'

interface ScreenEvent {
  event: Electron.Event
  display: Display
  changedMetrics: string[]
}

export const screenWatcher = Event.fromNodeEventEmitter<ScreenEvent>(
  screen,
  'display-metrics-changed',
  (_event, display, changedMetrics) => {
    return { event: _event, display, changedMetrics }
  },
)
