import {
  CancelablePromise,
  CancellationToken,
  CancellationTokenSource,
  createCancelablePromise,
} from './cancelablePromise';
import {
  IDisposable,
  combinedDisposable,
  toDisposable,
} from './lifecycle';
import {
  BufferReader,
  BufferWriter,
  deserialize,
  serialize,
} from './bufferHelper';
import { Emitter, Event } from './event';
import { VSBuffer } from './buffer';
import { canceled } from './errors';

// 消息传输协议定义
export interface IMessagePassingProtocol {
  onMessage: Event<VSBuffer>;
  send(buffer: VSBuffer): void;
}

export interface Client<TContext> {
  readonly ctx: TContext;
}

export interface ClientConnectionEvent {
  protocol: IMessagePassingProtocol;
  onDidClientDisconnect: Event<void>;
}

export interface Connection<TContext> extends Client<TContext> {
  readonly channelServer: ChannelServer<TContext>;
  readonly channelClient: ChannelClient;
}

export enum ResponseType {
  Initialize = 200, // 初始化消息返回
  PromiseSuccess = 201, // promise 成功
  PromiseError = 202, // promise 失败
  PromiseErrorObj = 203, // promise 失败
  EventFire = 204, // 发射事件
}

export enum RequestType {
  Promise = 100,
  PromiseCancel = 101,
  EventListen = 102,
  EventDispose = 103,
}

enum State {
  Uninitialized, // 未初始化
  Idle, // 空闲
}

interface PendingRequest {
  request: IRawPromiseRequest | IRawEventListenRequest;
  timeoutTimer: any;
}

type IRawPromiseRequest = {
  type: RequestType.Promise;
  id: number;
  channelName: string;
  name: string;
  arg: any;
};
type IRawPromiseCancelRequest = { type: RequestType.PromiseCancel; id: number };
type IRawEventListenRequest = {
  type: RequestType.EventListen;
  id: number;
  channelName: string;
  name: string;
  arg: any;
};
type IRawEventDisposeRequest = { type: RequestType.EventDispose; id: number };
type IRawRequest =
  | IRawPromiseRequest
  | IRawPromiseCancelRequest
  | IRawEventListenRequest
  | IRawEventDisposeRequest;

type IRawInitializeResponse = { type: ResponseType.Initialize };
type IRawPromiseSuccessResponse = {
  type: ResponseType.PromiseSuccess;
  id: number;
  data: any;
};
type IRawPromiseErrorResponse = {
  type: ResponseType.PromiseError;
  id: number;
  data: { message: string; name: string; stack: string[] | undefined };
};
type IRawPromiseErrorObjResponse = {
  type: ResponseType.PromiseErrorObj;
  id: number;
  data: any;
};
type IRawEventFireResponse = {
  type: ResponseType.EventFire;
  id: number;
  data: any;
};
type IRawResponse =
  | IRawInitializeResponse
  | IRawPromiseSuccessResponse
  | IRawPromiseErrorResponse
  | IRawPromiseErrorObjResponse
  | IRawEventFireResponse;
type IHandler = (response: IRawResponse) => void;

// 服务端频道接口
export interface IServerChannel<TContext = string> {
  call<T>(
    ctx: TContext,
    command: string,
    arg?: any,
    cancellationToken?: CancellationToken
  ): Promise<T>; // 发起服务请求
  listen<T>(ctx: TContext, event: string, arg?: any): Event<T>; // 监听消息
}

// 频道的服务端接口
export interface IChannelServer<TContext = string> {
  registerChannel(channelName: string, channel: IServerChannel<TContext>): void;
}

// 频道客户端接口
export interface IChannel {
  call<T, TT = any>(
    command: string,
    arg?: TT,
    cancellationToken?: CancellationToken
  ): Promise<T>;
  listen<T, TT = any>(event: string, arg?: TT): Event<T>;
}

export interface IChannelClient {
  getChannel<T extends IChannel>(channelName: string): T;
}

export class ChannelServer<TContext = string>
  implements IChannelServer<TContext>, IDisposable
{
  // 保存客户端可以访问的频道信息
  private readonly channels = new Map<string, IServerChannel<TContext>>();

  // 消息通信协议监听
  private protocolListener: IDisposable | null;

  // 保存活跃的请求，在收到取消消息后，进行取消执行，释放资源
  private readonly activeRequests = new Map<number, IDisposable>();

  // 在频道服务器注册之前，可能会到来很多请求，此时他们会停留在这个队列里
  // 如果 timeoutDelay 过时后，则会移除
  // 如果频道注册完成，则会从此队列里拿出并执行
  private readonly pendingRequests = new Map<string, PendingRequest[]>();

  constructor(
    private readonly protocol: IMessagePassingProtocol, // 消息协议
    private readonly ctx: TContext, // 服务名
    private readonly timeoutDelay: number = 1000 // 通信超时时间
  ) {
    this.protocolListener = this.protocol.onMessage((msg) =>
      this.onRawMessage(msg)
    );
    // 当我们频道服务端实例化完成时，我们需要给频道客服端返回实例化完成的消息：
    this.sendResponse({ type: ResponseType.Initialize });
  }

  private onRawMessage(message: VSBuffer): void {
    // 解读消息
    const reader = new BufferReader(message);
    const header = deserialize(reader);
    const body = deserialize(reader);
    const type = header[0] as RequestType;
    // 返回执行结果
    switch (type) {
      case RequestType.Promise:
        return this.onPromise({
          type,
          id: header[1],
          channelName: header[2],
          name: header[3],
          arg: body,
        });
      case RequestType.EventListen:
        return this.onEventListen({
          type,
          id: header[1],
          channelName: header[2],
          name: header[3],
          arg: body,
        });
      case RequestType.PromiseCancel:
        return this.disposeActiveRequest({ type, id: header[1] });
      case RequestType.EventDispose:
        return this.disposeActiveRequest({ type, id: header[1] });
      default:
        break;
    }
  }

  private disposeActiveRequest(request: IRawRequest): void {
    const disposable = this.activeRequests.get(request.id);

    if (disposable) {
      disposable.dispose();
      this.activeRequests.delete(request.id);
    }
  }

  public dispose(): void {
    if (this.protocolListener) {
      this.protocolListener.dispose();
      this.protocolListener = null;
    }
    this.activeRequests.forEach((d) => d.dispose());
    this.activeRequests.clear();
  }

  registerChannel(
    channelName: string,
    channel: IServerChannel<TContext>
  ): void {
    this.channels.set(channelName, channel);
    // 如果频道还未注册好之前就来了很多请求，则在此时进行请求执行。
    setTimeout(() => this.flushPendingRequests(channelName), 0);
  }

  private flushPendingRequests(channelName: string): void {
    const requests = this.pendingRequests.get(channelName);

    if (requests) {
      for (const request of requests) {
        clearTimeout(request.timeoutTimer);

        switch (request.request.type) {
          case RequestType.Promise:
            this.onPromise(request.request);
            break;
          case RequestType.EventListen:
            this.onEventListen(request.request);
            break;
          default:
            break;
        }
      }

      this.pendingRequests.delete(channelName);
    }
  }

  private sendResponse(response: IRawResponse): void {
    switch (response.type) {
      case ResponseType.Initialize:
        return this.send([response.type]);

      case ResponseType.PromiseSuccess:
      case ResponseType.PromiseError:
      case ResponseType.PromiseErrorObj:
      case ResponseType.EventFire:
        return this.send([response.type, response.id], response.data);
      default:
        break;
    }
  }

  private send(header: any, body: any = undefined): void {
    const writer = new BufferWriter();
    serialize(writer, header);
    serialize(writer, body);
    this.sendBuffer(writer.buffer);
  }

  private sendBuffer(message: VSBuffer): void {
    try {
      this.protocol.send(message);
    } catch (err) {
      // noop
    }
  }

  private onPromise(request: IRawPromiseRequest): void {
    const channel = this.channels.get(request.channelName);
    // 如果频道不存在，则放入 PendingRequest，等待频道注册或者过期。
    if (!channel) {
      this.collectPendingRequest(request);
      return;
    }

    // 取消请求 token -> 机制见 可取消的 Promise 部分内容讲解
    const cancellationTokenSource = new CancellationTokenSource();
    let promise: Promise<any>;
    try {
      promise = channel.call(
        this.ctx,
        request.name,
        request.arg,
        cancellationTokenSource.token
      );
    } catch (err) {
      promise = Promise.reject(err);
    }

    const { id } = request;

    promise.then(
      (data) => {
        this.sendResponse(<IRawResponse>{
          id,
          data,
          type: ResponseType.PromiseSuccess,
        });
        this.activeRequests.delete(request.id);
      },
      (err) => {
        if (err instanceof Error) {
          // 如果有异常，进行消息的异常处理，并返回响应结果。
          this.sendResponse(<IRawResponse>{
            id,
            data: {
              message: err.message,
              name: err.name,
              stack: err.stack
                ? err.stack.split
                  ? err.stack.split('\n')
                  : err.stack
                : undefined,
            },
            type: ResponseType.PromiseError,
          });
        } else {
          this.sendResponse(<IRawResponse>{
            id,
            data: err,
            type: ResponseType.PromiseErrorObj,
          });
        }

        this.activeRequests.delete(request.id);
      }
    );

    const disposable = toDisposable(() => cancellationTokenSource.cancel());
    this.activeRequests.set(request.id, disposable);
  }

  private onEventListen(request: IRawEventListenRequest) {
    request = <IRawEventListenRequest>request;
    const channel = this.channels.get(request.channelName);

    if (!channel) {
      this.collectPendingRequest(request);
      return;
    }

    const { id } = request;
    const event = channel.listen(this.ctx, request.name, request.arg);
    const disposable = event((data) =>
      this.sendResponse(<IRawResponse>{
        id,
        data,
        type: ResponseType.EventFire,
      })
    );

    this.activeRequests.set(id, disposable);
  }

  private collectPendingRequest(
    request: IRawPromiseRequest | IRawEventListenRequest
  ): void {
    let pendingRequests = this.pendingRequests.get(request.channelName);

    if (!pendingRequests) {
      pendingRequests = [];
      this.pendingRequests.set(request.channelName, pendingRequests);
    }

    const timer = setTimeout(() => {
      console.error(`Unknown channel: ${request.channelName}`);

      if (request.type === RequestType.Promise) {
        this.sendResponse(<IRawResponse>{
          id: request.id,
          data: {
            name: 'Unknown channel',
            message: `Channel name '${request.channelName}' timed out after ${this.timeoutDelay}ms`,
            stack: undefined,
          },
          type: ResponseType.PromiseError,
        });
      }
    }, this.timeoutDelay);

    pendingRequests.push({ request, timeoutTimer: timer });
  }
}

export class ChannelClient implements IChannelClient, IDisposable {
  private protocolListener: IDisposable | null;

  private state: State = State.Uninitialized; // 频道的状态

  private isDisposed = false;

  private lastRequestId = 0; // 通信请求唯一 ID 管理

  // 活跃中的 request, 用于取消的时候统一关闭;如果频道被关闭了（dispose），则统一会往所有的频道发送取消消息，从而确保通信的可靠性。
  private readonly activeRequests = new Set<IDisposable>();

  private readonly handlers = new Map<number, IHandler>(); // 通信返回结果后的处理

  private readonly _onDidInitialize = new Emitter<void>();

  readonly onDidInitialize = this._onDidInitialize.event; // 当频道被初始化时会触发事件

  constructor(private readonly protocol: IMessagePassingProtocol) {
    this.protocolListener = this.protocol.onMessage((msg) =>
      this.onBuffer(msg)
    );
  }

  private onBuffer(message: VSBuffer): void {
    const reader = new BufferReader(message);
    const header = deserialize(reader);
    const body = deserialize(reader);
    const type: ResponseType = header[0];

    switch (type) {
      case ResponseType.Initialize:
        return this.onResponse({ type: header[0] });

      case ResponseType.PromiseSuccess:
      case ResponseType.PromiseError:
      case ResponseType.EventFire:
      case ResponseType.PromiseErrorObj:
        return this.onResponse({ type: header[0], id: header[1], data: body });
    }
  }

  private onResponse(response: IRawResponse): void {
    if (response.type === ResponseType.Initialize) {
      this.state = State.Idle;
      this._onDidInitialize.fire();
      return;
    }

    const handler = this.handlers.get(response.id);

    if (handler) {
      handler(response);
    }
  }

  dispose(): void {
    if (this.protocolListener) {
      // 移除消息监听
      this.protocolListener.dispose();
      this.protocolListener = null;
    }

    // 如果有请求仍然在执行中，清理所有请求，释放主进程资源
    this.activeRequests.forEach((p) => p.dispose());
    this.activeRequests.clear();
    this.isDisposed = true;
  }

  getChannel<T extends IChannel>(channelName: string): T {
    const that = this;
    return {
      call(command: string, arg?: any, cancellationToken?: CancellationToken) {
        if (that.isDisposed) {
          return Promise.reject(canceled());
        }
        return that.requestPromise(
          channelName,
          command,
          arg,
          cancellationToken
        );
      },
      listen(event: string, arg: any) {
        if (that.isDisposed) {
          return Promise.reject(canceled());
        }
        return that.requestEvent(channelName, event, arg);
      },
    } as T;
  }

  private requestEvent(
    channelName: string,
    eventName: string,
    arg: any,
    cancellationToken = CancellationToken.None
  ): Event<any> {
    const id = this.lastRequestId++;
    const type = RequestType.EventListen;
    const request: IRawRequest = {
      id,
      type,
      channelName,
      name: eventName,
      arg,
    };

    let uninitializedPromise: CancelablePromise<void> | null = null;

    const emitter = new Emitter<any>({
      onFirstListenerAdd: () => {
        uninitializedPromise = createCancelablePromise((_) =>
          this.whenInitialized()
        );
        uninitializedPromise.then(() => {
          uninitializedPromise = null;
          this.activeRequests.add(emitter);
          this.sendRequest(request);
        });
      },
      onLastListenerRemove: () => {
        if (uninitializedPromise) {
          uninitializedPromise.cancel();
          uninitializedPromise = null;
        } else {
          this.activeRequests.delete(emitter);
          this.sendRequest({ id, type: RequestType.EventDispose });
        }
      },
    });

    const handler: IHandler = (res: IRawResponse) =>
      emitter.fire((res as IRawEventFireResponse).data);
    this.handlers.set(id, handler);

    return emitter.event;
  }

  private requestPromise(
    channelName: string,
    name: string,
    arg?: any,
    cancellationToken = CancellationToken.None
  ): Promise<any> {
    const id = this.lastRequestId++;
    const type = RequestType.Promise;
    const request: IRawRequest = { id, type, channelName, name, arg };

    // 如果请求被取消了，则不再执行。
    if (cancellationToken.isCancellationRequested) {
      return Promise.reject(canceled());
    }

    let disposable: IDisposable;

    const result = new Promise((resolve, reject) => {
      // 如果请求被取消了，则不再执行。
      if (cancellationToken.isCancellationRequested) {
        return reject(canceled());
      }

      // 只有频道确认注册完成后，才开始发送请求，否则一直处于队列中
      // 在「频道服务端」准备就绪后，会发送就绪消息回来，此时会触发状态变更为「idle」就绪状态
      // 从而会触发 uninitializedPromise.then
      // 从而消息可以进行发送
      let uninitializedPromise: CancelablePromise<void> | null =
        createCancelablePromise((_) => this.whenInitialized());
      uninitializedPromise.then(() => {
        uninitializedPromise = null;

        const handler: IHandler = (response) => {
          // console.log('main process response:', JSON.stringify(response, null, 2));
          // 根据返回的结果类型，进行处理, 这里不处理 Initialize 这个会在更上层处理
          switch (response.type) {
            case ResponseType.PromiseSuccess:
              this.handlers.delete(id);
              resolve(response.data);
              break;

            case ResponseType.PromiseError:
              this.handlers.delete(id);
              const error = new Error(response.data.message);
              (<any>error).stack = response.data.stack;
              error.name = response.data.name;
              reject(error);
              break;

            case ResponseType.PromiseErrorObj:
              this.handlers.delete(id);
              reject(response.data);
              break;
            default:
              break;
          }
        };

        // 保存此次请求的处理
        this.handlers.set(id, handler);

        // 开始发送请求
        this.sendRequest(request);
      });

      const cancel = () => {
        // 如果还未初始化，则直接取消
        if (uninitializedPromise) {
          uninitializedPromise.cancel();
          uninitializedPromise = null;
        } else {
          // 如果已经初始化，并且在请求中，则发送中断消息
          this.sendRequest({ id, type: RequestType.PromiseCancel });
        }

        reject(canceled());
      };

      const cancellationTokenListener =
        cancellationToken.onCancellationRequested(cancel);
      disposable = combinedDisposable(
        toDisposable(cancel),
        cancellationTokenListener
      );
      this.activeRequests.add(disposable);
    });

    return result.finally(() => this.activeRequests.delete(disposable));
  }

  private sendRequest(request: IRawRequest): void {
    switch (request.type) {
      case RequestType.Promise:
      case RequestType.EventListen:
        return this.send(
          [request.type, request.id, request.channelName, request.name],
          request.arg
        );

      case RequestType.EventDispose:
      case RequestType.PromiseCancel:
        return this.send([request.type, request.id]);
      default:
        break;
    }
  }

  private send(header: any, body: any = undefined): void {
    const writer = new BufferWriter();
    serialize(writer, header);
    serialize(writer, body);
    this.sendBuffer(writer.buffer);
  }

  private sendBuffer(message: VSBuffer): void {
    try {
      this.protocol.send(message);
    } catch (err) {
      // noop
    }
  }

  private whenInitialized(): Promise<void> {
    if (this.state === State.Idle) {
      return Promise.resolve();
    } else {
      return Event.toPromise(this.onDidInitialize);
    }
  }
}


