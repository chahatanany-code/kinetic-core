// KINETIC CORE - Dynamic Worker Factory
// Generates an isolated Web Worker directly from a Blob URL to avoid bundler path mismatch.

const workerScript = `
let timerId = null;
let tickInterval = 50;
let startTime = 0;
let accumulatedElapsed = 0;
let expectedTime = 0;

self.onmessage = function(e) {
  const data = e.data;
  const command = data.command;

  if (command === 'START') {
    if (timerId !== null) clearInterval(timerId);
    tickInterval = data.intervalMs || 50;
    accumulatedElapsed = data.initialElapsedMs || 0;
    startTime = performance.now();
    expectedTime = startTime + tickInterval;
    timerId = self.setInterval(runTick, tickInterval);
  } else if (command === 'PAUSE') {
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
    });
  } else if (command === 'RESUME') {
    if (timerId !== null) clearInterval(timerId);
    startTime = performance.now();
    expectedTime = startTime + tickInterval;
    timerId = self.setInterval(runTick, tickInterval);
  } else if (command === 'STOP') {
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
    });
  } else if (command === 'PING') {
    self.postMessage({
      type: 'PONG',
      timestamp: performance.now(),
      elapsedMs: accumulatedElapsed + (startTime > 0 ? (performance.now() - startTime) : 0),
      driftMs: 0
    });
  }
};

function runTick() {
  const now = performance.now();
  const currentElapsed = accumulatedElapsed + (now - startTime);
  const drift = now - expectedTime;
  expectedTime += tickInterval;

  self.postMessage({
    type: 'TICK',
    timestamp: now,
    elapsedMs: currentElapsed,
    driftMs: Math.max(0, Math.round(drift * 100) / 100)
  });
}
`;

export function createTimerWorker(): Worker | null {
  if (typeof window === 'undefined') return null;
  try {
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    return new Worker(url);
  } catch (err) {
    console.warn('[KineticCore Worker] Fallback to main thread timing:', err);
    return null;
  }
}
