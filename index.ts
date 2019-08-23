import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { SocketStatsBySocketId, setupSocketStatsUpdater } from './lib/agent-helper';

export function subscribeToSocketStats(
  statsUpdateCb: (statsBySocketId: SocketStatsBySocketId) => void,
  intervalMs: number = 1000
): void {
  const statsBySocketId: SocketStatsBySocketId = {};

  setupSocketStatsUpdater(HttpAgent, statsBySocketId);
  setupSocketStatsUpdater(HttpsAgent, statsBySocketId);
  setInterval(() => {
    statsUpdateCb(statsBySocketId);
  }, intervalMs);
}