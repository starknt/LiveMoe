import { withNullAsUndefined } from 'common/electron-common/types'

export namespace TimerHelper {
  export class PausableIntervalTimer {
    private timer: NodeJS.Timer | null = null

    constructor(
      private readonly time: number,
      private readonly listener: () => void,
      private readonly thisArg?: unknown,
    ) {
      this.start()
    }

    private start() {
      if (this.timer)
        return

      this.timer = setInterval(this.listener.bind(this.thisArg), this.time)
    }

    pause() {
      if (!this.timer)
        return

      clearInterval(this.timer)
      this.timer = null
    }

    restore() {
      this.start()
    }

    reset() {
      this.dispose()
      this.start()
    }

    dispose() {
      if (this.timer)
        clearInterval(this.timer)
      this.timer = null
    }
  }

  export class PausableTimeoutTimer {
    private _timer: NodeJS.Timeout | null = null

    private _iTimer: NodeJS.Timer | null = null

    private _time = this.time

    constructor(
      private readonly time: number,
      private readonly listener: () => void,
      private readonly thisArg?: unknown,
    ) {
      this.start()
    }

    private start() {
      if (this._timer)
        return

      this._timer = setTimeout(this.listener.bind(this.thisArg), this._time)
      this.setupIntervalTimer()
    }

    private setupIntervalTimer() {
      if (this._iTimer || this._time === 0)
        return
      this._iTimer = setInterval(() => {
        this._time -= 10
        if (this._time <= 0 && this._iTimer) {
          this._time = 0
          clearInterval(this._iTimer)
        }
      }, 10)
    }

    pause() {
      if (!this._timer)
        return

      if (this._time !== 0 && this._iTimer) {
        clearInterval(withNullAsUndefined(this._iTimer))
        this._iTimer = null
      }
      clearInterval(this._timer)
      this._timer = null
    }

    restore() {
      this.start()
    }

    reset() {
      this.dispose()
      this.start()
    }

    dispose() {
      if (this._iTimer)
        clearInterval(this._iTimer)

      if (this._timer)
        clearTimeout(this._timer)

      this._iTimer = null
      this._timer = null
    }
  }
}
