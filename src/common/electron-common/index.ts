export type {
  Client,
  ClientConnectionEvent,
  Connection,
  IChannel,
  IChannelClient,
  IChannelServer,
  IMessagePassingProtocol,
  IServerChannel,
} from './base/ipc';
export { ChannelClient, ChannelServer } from './base/ipc';
export { type Sender, Protocol } from './base/ipc.electron';
export type {
  IEventListener,
  IListener,
  IServiceEventListener,
  IServiceListener,
} from './ipc.service';
export { Service, type IService } from './ipc.service';
