import { IDisposable } from '../electron-common/base/lifecycle';
import { VSBuffer } from '../electron-common/base/buffer';
import { BufferWriter, serialize } from '../electron-common/base/bufferHelper';
import { Protocol, ChannelClient, ChannelServer, IChannel, IChannelClient, IChannelServer, IMessagePassingProtocol, IServerChannel } from '../electron-common';
import { Event } from '../electron-common/base/event';

interface ICommonProtocol {
	send(event: string | symbol, ...args: unknown[]): void;
	on(event: string | symbol, callback: Function): void;
	removeListener(event: string | symbol, listener: (...args: unknown[]) => void): void;
}

export class IPCClient<TContext = string> implements IChannelClient, IChannelServer<TContext>, IDisposable {
  private readonly channelClient: ChannelClient;

  private readonly channelServer: ChannelServer<TContext>;

  constructor(protocol: IMessagePassingProtocol, ctx: TContext) {
    const writer = new BufferWriter();
    serialize(writer, ctx);
    protocol.send(writer.buffer);

    this.channelClient = new ChannelClient(protocol);
    this.channelServer = new ChannelServer(protocol, ctx);
  }

  getChannel<T extends IChannel>(channelName: string): T {
    return this.channelClient.getChannel(channelName);
  }

  registerChannel(channelName: string, channel: IServerChannel<TContext>): void {
    this.channelServer.registerChannel(channelName, channel);
  }

  dispose(): void {
    this.channelClient.dispose();
    this.channelServer.dispose();
  }
}

export class Client extends IPCClient implements IDisposable {
	static commonProtocol?: ICommonProtocol;

  private readonly protocol: Protocol;

  private static createProtocol(commonProtocol?: ICommonProtocol): Protocol {
		let ipcRenderer: ICommonProtocol;
		let onMessage;
		if(typeof window.require === 'function' && window.require('electron').ipcRenderer) {
			// node
			ipcRenderer = window.require('electron').ipcRenderer;
			onMessage = Event.fromNodeEventEmitter<VSBuffer>(ipcRenderer, 'ipc:message', (_, message: Buffer) => VSBuffer.wrap(message));
    	ipcRenderer.send('ipc:hello');
		} else {
			// web
			// 优先使用构造函数传入的参数
			if(commonProtocol) {
				ipcRenderer = commonProtocol;
				onMessage = Event.fromNodeEventEmitter(ipcRenderer, 'ipc:message', (_, message: any) => VSBuffer.wrap(message));
				ipcRenderer.send('ipc:hello');
			} else if(this.commonProtocol) {
				ipcRenderer = this.commonProtocol;
				onMessage = Event.fromNodeEventEmitter(ipcRenderer, 'ipc:message', (_, message: any) => VSBuffer.wrap(message));
				ipcRenderer.send('ipc:hello');
			} else {
				throw new Error('FatalError: In the web environment, you must provide a custom protocol, otherwise the RendererServer will not work properly');
			}
		}

    return new Protocol(ipcRenderer, onMessage);
  }

  /**
   *
   * @param ctx 创建连接上下文
   * @param commonProtocol 用于扩展服务器的通信方式
   */
  constructor(ctx: string, commonProtocol?: ICommonProtocol) {
    const protocol = Client.createProtocol(commonProtocol);
    super(protocol, ctx);
    this.protocol = protocol;
  }

  dispose(): void {
    this.protocol.dispose();
  }
}
