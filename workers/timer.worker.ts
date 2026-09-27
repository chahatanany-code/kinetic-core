// KINETIC CORE - Authoritative Web Worker Clock
// Runs in background thread isolated from UI lag and browser throttling.
// Relies on performance.now() timestamps to eliminate cumulative drift.

interface WorkerMessageInput {
  command: 'START' | 'PAUSE' | 'RESUME' | 'STOP' | 'PING';
  intervalMs?: number;
  initialElapsedMs?: number;
}

interface WorkerMessageOutput {
  type: 'TICK' | 'PONG' | 'STOPPED';
  timestamp: number;
  elapsedMs: number;
  driftMs: number;
}

let timerId: number | null = null;
let tickInterval = 50; // High precision 50ms pulse for smooth 20Hz ticks
let startTime = 0;
let accumulatedElapsed = 0;
let expectedTime = 0;
let lastTickTime = 0;

self.onmessage = (e: MessageEvent<WorkerMessageInput>) => {
  const { command, intervalMs, initialElapsedMs } = e.data;

  switch (command) {
    case 'START': {
      if (timerId !== null) {
        clearInterval(timerId);
      }
      tickInterval = intervalMs || 50;
      accumulatedElapsed = initialElapsedMs || 0;
      startTime = performance.now();
      expectedTime = startTime + tickInterval;
      lastTickTime = startTime;

      timerId = self.setInterval(runTick, tickInterval);
      break;
    }

    case 'PAUSE': {
      if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
      }
      if (startTime > 0) {
        accumulatedElapsed += (performance.now() - startTime);
        startTime = 0;
      }
      self.postMessage({
        type: 'STOPPED',
        timestamp: performance.now(),
        elapsedMs: accumulatedElapsed,
        driftMs: 0
      } as WorkerMessageOutput);
      break;
    }

    case 'RESUME': {
      if (timerId !== null) {
        clearInterval(timerId);
      }
      startTime = performance.now();
      expectedTime = startTime + tickInterval;
      lastTickTime = startTime;
      timerId = self.setInterval(runTick, tickInterval);
      break;
    }

    case 'STOP': {
      if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
      }
      startTime = 0;
      accumulatedElapsed = 0;
      self.postMessage({
        type: 'STOPPED',
        timestamp: performance.now(),
        elapsedMs: 0,
        driftMs: 0
      } as WorkerMessageOutput);
      break;
    }

    case 'PING': {
      self.postMessage({
        type: 'PONG',
        timestamp: performance.now(),
        elapsedMs: accumulatedElapsed + (startTime > 0 ? (performance.now() - startTime) : 0),
        driftMs: 0
      } as WorkerMessageOutput);
      break;
    }
  }
};

function runTick() {
  const now = performance.now();
  const currentElapsed = accumulatedElapsed + (now - startTime);
  const drift = now - expectedTime;

  expectedTime += tickInterval;
  lastTickTime = now;

  self.postMessage({
    type: 'TICK',
    timestamp: now,
    elapsedMs: currentElapsed,
    driftMs: Math.max(0, Math.round(drift * 100) / 100)
  } as WorkerMessageOutput);
}

export {};
