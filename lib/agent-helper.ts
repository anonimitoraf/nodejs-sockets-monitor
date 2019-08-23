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
  // const socketRandomId = (Math.random() * 100000000).toFixed(0);
  let isCleanedUp = false;

  stats.active++;

  const onConnect = () => stats.connect++;
  socket.once('connect', onConnect);

  const onDataReceive = () => stats.data++;
  socket.once('data', onDataReceive);

  const onDrain = () => stats.drain++;
  socket.once('drain', onDrain);

  const onLookup = () => stats.lookup++;
  socket.once('lookup', onLookup);

  const onReady = () => stats.ready++;
  socket.once('ready', onReady);

  const onTimeout = () => stats.timeout++;
  socket.once('timeout', onTimeout);

  const onClose = () => {
    stats.close++;
    cleanup();
  }
  socket.once('close', onClose);

  const onEnd = () => {
    stats.end++;
    cleanup();
  }
  socket.once('end', onEnd);

  const onError = () => {
    stats.error++;
    cleanup();
  }
  socket.once('error', onError);


  const cleanup = () => {
    if (isCleanedUp) return;

    if (stats.active >= 1) {
      stats.active--;
    } else {
      console.warn(`Expected stats.active >= 1, value is ${stats.active}`);
    }

    socket.removeListener('close', onClose);
    socket.removeListener('data', onDataReceive);
    socket.removeListener('end', onEnd);
    socket.removeListener('error', onError);
    isCleanedUp = true;
  };
}

function makeSocketId(host: string, port: string) {
  return `${host}:${port}`;
}