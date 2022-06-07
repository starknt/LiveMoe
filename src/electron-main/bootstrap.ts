import type minimist from 'minimist'
import { app } from 'electron'
import { InstantiationService, ServiceCollection, SyncDescriptor } from '@livemoe/core'
import Application from './Application'
import { EnviromentService, IEnviromentService } from './core/services/environmentService'
import { ILoggerService, LoggerService } from './core/services/log'

function registerListener() {
  app.on('before-quit', () => {
    console.log('dispose server ...')
  })

  app.on('will-quit', () => {
    console.log('will-quit')
  })
}

async function bootstrap(args: minimist.ParsedArgs) {
  registerListener()

  const serviceCollection = new ServiceCollection()
  serviceCollection.set(IEnviromentService, new SyncDescriptor(EnviromentService))
  serviceCollection.set(ILoggerService, new SyncDescriptor(LoggerService))
  const instantiationService = new InstantiationService(serviceCollection)

  instantiationService.createInstance(new SyncDescriptor(Application, [args]))
}

export default bootstrap
