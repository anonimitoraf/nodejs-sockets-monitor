import * as net from 'net';
import { Socket } from 'net';
import * as shimmer from 'shimmer';

type SocketStatKeys =
  | 'active'
  | 'close'
  | 'connect'
  | 'data'
  | 'drain'
  | 'end'
  | 'error'
  | 'lookup'
  | 'ready'
  | 'timeout'

type SocketStats = Record<SocketStatKeys, number>;

export const initialSocketStats: SocketStats = {
  active: 0,
  close: 0,
  connect: 0,
  data: 0,
  drain: 0,
  end: 0,
  error: 0,
  lookup: 0,
  ready: 0,
  timeout: 0
};

export type SocketStatsBySocketId = { [socketId: string]: SocketStats };

export function setupSocketStatsUpdater(agent: any, statsBySocketId: SocketStatsBySocketId) {
  const monkeyPatch = makeMonkeyPatch(statsBySocketId);
  shimmer.wrap(agent.prototype, 'createConnection', monkeyPatch);
  shimmer.wrap(net, 'createConnection', monkeyPatch);
}

function makeMonkeyPatch(statsBySocketId: SocketStatsBySocketId) {
  return function (originalFn: () => Socket) {
    return function () {
      const socket = originalFn.apply(this, arguments) as Socket;

      const [{ host, port }] = arguments;
      const socketName = makeSocketId(host, port);

      let stats = statsBySocketId[socketName];
      if (!stats) {
        // Clone initial stats
        stats = { ...initialSocketStats };
        statsBySocketId[socketName] = stats;
      }

      setupSocketListeners(socket, stats);
      return socket;
    };
  }
}

function setupSocketListeners(socket: Socket, stats: SocketStats) {
  let isCleanedUp = false;

  stats.active++;

  const onConnect = () => stats.connect++;
  const onDataReceive = () => stats.data++;
  const onDrain = () => stats.drain++;
  const onLookup = () => stats.lookup++;
  const onReady = () => stats.ready++;
  const onTimeout = () => stats.timeout++;
  const onClose = () => {
    stats.close++;
    cleanup();
  }
  const onEnd = () => {
    stats.end++;
    cleanup();
  }
  const onError = () => {
    stats.error++;
    cleanup();
  }

  const callbackByEventType = {
    'connect': onConnect,
    'data': onDataReceive,
    'drain': onDrain,
    'lookup': onLookup,
    'ready': onReady,
    'timeout': onTimeout,
    'close': onClose,
    'end': onEnd,
    'error': onError
  };

  Object.entries(callbackByEventType).forEach(([eventType, cb]) => socket.once(eventType, cb));

  const cleanup = () => {
    if (isCleanedUp) return;

    if (stats.active >= 1) {
      stats.active--;
    } else {
      console.warn(`Expected stats.active >= 1, value is ${stats.active}`);
    }

    Object.entries(callbackByEventType).forEach(([eventType, cb]) => socket.removeListener(eventType, cb));
    isCleanedUp = true;
  };
}

export function makeSocketId(host: string, port: string | number) {
  return `${host}:${port}`;
}