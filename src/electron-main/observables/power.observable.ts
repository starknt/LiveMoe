import { Event } from 'common/electron-common/base/event'
import { powerMonitor } from 'electron'
/**
 * @platfrom macOS, Windows
 */
export const lockScreenWatcher = Event.fromNodeEventEmitter(powerMonitor, 'lock-screen')
/**
 * @platfrom macOS, Windows
 */
export const unLockScreenWatcher = Event.fromNodeEventEmitter(powerMonitor, 'unlock-screen')

/**
 * @platfrom Linux, macOS
 */
export const shutDownWatcher = Event.fromNodeEventEmitter(powerMonitor, 'shut-down')

/**
 * @platfrom macOS, Windows
 */
export const onBattery = Event.fromNodeEventEmitter(powerMonitor, 'on-battery')

export function isBattery() {
  return powerMonitor.isOnBatteryPower()
}
