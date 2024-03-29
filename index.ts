import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { SocketStatsBySocketId, setupSocketStatsUpdater } from './lib/agent-helper';

const statsBySocketId = initStatsBySocketId();

export function subscribeToSocketStats(
  statsUpdateCb: (statsBySocketId: SocketStatsBySocketId) => void,
  intervalMs: number = 1000
): void {
  setInterval(() => statsUpdateCb(statsBySocketId), intervalMs);
}

function initStatsBySocketId() {
  const statsBySocketId: SocketStatsBySocketId = {};
  setupSocketStatsUpdater(HttpAgent, statsBySocketId);
  setupSocketStatsUpdater(HttpsAgent, statsBySocketId);
  return statsBySocketId;
}