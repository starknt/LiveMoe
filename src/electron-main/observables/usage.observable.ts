import { Emitter } from 'common/electron-common/base/event'
import type { CPUUsage, ProcessMemoryInfo, SystemMemoryInfo } from 'electron'

export async function getApplicationUsage() {
  const cpuUsage = process.getCPUUsage()
  const memoryUsage = await process.getProcessMemoryInfo()
  const systemMemoryInfo = process.getSystemMemoryInfo()

  return {
    cup: cpuUsage,
    memory: {
      process: memoryUsage,
      system: systemMemoryInfo,
    },
  }
}

const useageEmitter = new Emitter<Promise<Usage>>()

setInterval(() => {
  useageEmitter.fire(getApplicationUsage())
}, 60 * 1000)

export const onApplcationUsage = useageEmitter.event

export interface Usage {
  cup: CPUUsage
  memory: {
    process: ProcessMemoryInfo
    system: SystemMemoryInfo
  }
}
