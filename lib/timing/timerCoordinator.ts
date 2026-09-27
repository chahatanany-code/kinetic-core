// KINETIC CORE - Authoritative Training Clock Coordinator
// Decouples timing authority from UI render loops.
// Uses Web Worker pulses + performance.now() differential timestamps.
// Automatically schedules Web Audio cues and Screen Wake Lock.

import { IntervalState, ClockDiagnostic, CustomTrainingPreset } from '@/types';
import { createTimerWorker } from './workerSource';
import { soundEngine } from '../audio/soundSynthesizer';
import { requestWakeLock, releaseWakeLock } from './wakeLock';

export interface TimerConfig {
  roundsCount: number;
  workSeconds: number;
  restSeconds: number;
  warningSeconds: number;
  prepSeconds: number;
  presetName?: string;
}

export interface TimerSnapshot {
  state: IntervalState;
  currentRound: number;
  totalRounds: number;
  secondsRemainingInInterval: number;
  intervalDuration: number;
  intervalProgress: number; // 0 to 1 (depletion ratio)
  totalElapsedSeconds: number;
  isPaused: boolean;
  activeWorkSeconds: number;
  presetName: string;
}

type Listener = (snapshot: TimerSnapshot) => void;
type DiagnosticListener = (diag: ClockDiagnostic) => void;

class TimerCoordinator {
  private worker: Worker | null = null;
  private state: IntervalState = 'IDLE';
  private currentRound = 1;
  private totalRounds = 8;
  private workSeconds = 180;
  private restSeconds = 30;
  private warningSeconds = 10;
  private prepSeconds = 10;
  private presetName = 'Standard Boxing';

  // Authoritative Millisecond Timestamps
  private intervalStartEpoch = 0;
  private intervalDurationMs = 0;
  private intervalElapsedMs = 0;
  private totalActiveWorkMs = 0;
  private totalElapsedMs = 0;
  private sessionStartEpoch = 0;

  // Drift and Diagnostic Tracking
  private tickCount = 0;
  private lastDriftMs = 0;
  private maxDriftMs = 0;
  private lastFiredWarningRound = -1;
  private lastFiredSecond = -1;
  private listeners: Set<Listener> = new Set();
  private diagListeners: Set<DiagnosticListener> = new Set();

  constructor() {
    this.initWorker();
    if (typeof window !== 'undefined') {
      // Visibility recovery listener
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && (this.state === 'WORK' || this.state === 'REST' || this.state === 'PREPARATION')) {
          this.recalibrateAgainstRealTime();
        }
      });
    }
  }

  private initWorker(): void {
    if (typeof window === 'undefined') return;
    this.worker = createTimerWorker();
    if (this.worker) {
      this.worker.onmessage = (e: MessageEvent) => {
        const { type, elapsedMs, driftMs } = e.data;
        if (type === 'TICK') {
          this.handleTick(elapsedMs, driftMs);
        }
      };
    }
  }

  public configure(config: Partial<TimerConfig>): void {
    if (config.roundsCount !== undefined) this.totalRounds = Math.max(1, config.roundsCount);
    if (config.workSeconds !== undefined) this.workSeconds = Math.max(5, config.workSeconds);
    if (config.restSeconds !== undefined) this.restSeconds = Math.max(0, config.restSeconds);
    if (config.warningSeconds !== undefined) this.warningSeconds = Math.max(0, config.warningSeconds);
    if (config.prepSeconds !== undefined) this.prepSeconds = Math.max(0, config.prepSeconds);
    if (config.presetName) this.presetName = config.presetName;

    this.reset();
  }

  public loadPreset(preset: CustomTrainingPreset): void {
    this.configure({
      roundsCount: preset.roundsCount,
      workSeconds: preset.roundDurationSeconds,
      restSeconds: preset.restDurationSeconds,
      warningSeconds: preset.warningDurationSeconds,
      prepSeconds: preset.prepDurationSeconds,
      presetName: preset.name
    });
  }

  public start(): void {
    soundEngine.init();
    requestWakeLock().catch(() => {});

    this.sessionStartEpoch = performance.now();
    this.currentRound = 1;
    this.totalActiveWorkMs = 0;
    this.totalElapsedMs = 0;
    this.lastFiredWarningRound = -1;
    this.lastFiredSecond = -1;

    if (this.prepSeconds > 0) {
      this.transitionTo('PREPARATION', this.prepSeconds * 1000);
      soundEngine.playSessionStart();
    } else {
      this.startRound(1);
    }

    if (this.worker) {
      this.worker.postMessage({ command: 'START', intervalMs: 50 });
    }
  }

  public pause(): void {
    if (this.state === 'IDLE' || this.state === 'COMPLETE' || this.state === 'PAUSED') return;
    this.state = 'PAUSED';
    if (this.worker) {
      this.worker.postMessage({ command: 'PAUSE' });
    }
    this.broadcast();
  }

  public resume(): void {
    if (this.state !== 'PAUSED') return;
    soundEngine.init();
    requestWakeLock().catch(() => {});

    // Recalculate anchor
    this.intervalStartEpoch = performance.now() - this.intervalElapsedMs;
    // Determine prior active state
    if (this.intervalDurationMs === this.prepSeconds * 1000) {
      this.state = 'PREPARATION';
    } else if (this.intervalDurationMs === this.workSeconds * 1000) {
      this.state = 'WORK';
    } else {
      this.state = 'REST';
    }

    if (this.worker) {
      this.worker.postMessage({ command: 'RESUME' });
    }
    this.broadcast();
  }

  public skip(): void {
    soundEngine.playButtonTap();
    if (this.state === 'PREPARATION') {
      this.startRound(1);
    } else if (this.state === 'WORK' || this.state === 'WARNING') {
      this.endRound();
    } else if (this.state === 'REST') {
      this.startRound(this.currentRound + 1);
    }
  }

  public reset(): void {
    if (this.worker) {
      this.worker.postMessage({ command: 'STOP' });
    }
    releaseWakeLock().catch(() => {});
    this.state = 'IDLE';
    this.currentRound = 1;
    this.intervalStartEpoch = 0;
    this.intervalDurationMs = 0;
    this.intervalElapsedMs = 0;
    this.totalActiveWorkMs = 0;
    this.totalElapsedMs = 0;
    this.lastFiredWarningRound = -1;
    this.lastFiredSecond = -1;
    this.broadcast();
  }

  private startRound(roundNum: number): void {
    this.currentRound = roundNum;
    this.transitionTo('WORK', this.workSeconds * 1000);

    if (this.currentRound === this.totalRounds) {
      soundEngine.playFinalRound();
    } else {
      soundEngine.playRoundStart();
    }
  }

  private endRound(): void {
    soundEngine.playRoundEnd();

    if (this.currentRound >= this.totalRounds) {
      this.completeSession();
    } else {
      if (this.restSeconds > 0) {
        this.transitionTo('REST', this.restSeconds * 1000);
      } else {
        this.startRound(this.currentRound + 1);
      }
    }
  }

  private completeSession(): void {
    this.state = 'COMPLETE';
    if (this.worker) {
      this.worker.postMessage({ command: 'STOP' });
    }
    releaseWakeLock().catch(() => {});
    soundEngine.playSessionComplete();
    this.broadcast();
  }

  private transitionTo(newState: IntervalState, durationMs: number): void {
    this.state = newState;
    this.intervalStartEpoch = performance.now();
    this.intervalDurationMs = durationMs;
    this.intervalElapsedMs = 0;
    this.lastFiredSecond = -1;
    this.broadcast();
  }

  private handleTick(_rawElapsed: number, driftMs: number): void {
    if (this.state === 'IDLE' || this.state === 'PAUSED' || this.state === 'COMPLETE') return;

    const now = performance.now();
    this.intervalElapsedMs = now - this.intervalStartEpoch;
    this.totalElapsedMs = now - this.sessionStartEpoch;

    if (this.state === 'WORK' || this.state === 'WARNING') {
      this.totalActiveWorkMs += 50;
    }

    // Diagnostics
    this.tickCount++;
    this.lastDriftMs = driftMs;
    if (driftMs > this.maxDriftMs) this.maxDriftMs = driftMs;

    const msRemaining = Math.max(0, this.intervalDurationMs - this.intervalElapsedMs);
    const secRemaining = Math.ceil(msRemaining / 1000);

    // Audio Trigger Precision Checks
    if (secRemaining !== this.lastFiredSecond) {
      this.lastFiredSecond = secRemaining;

      // 10s Warning Clapper in WORK interval
      if (this.state === 'WORK' && secRemaining <= this.warningSeconds && this.lastFiredWarningRound !== this.currentRound) {
        this.state = 'WARNING';
        this.lastFiredWarningRound = this.currentRound;
        soundEngine.play10SecondWarning();
      }

      // 5-second countdown pings (5, 4, 3, 2, 1)
      if (secRemaining <= 5 && secRemaining >= 1) {
        soundEngine.playCountdownTick(secRemaining);
      }
    }

    // Interval Expiration Check
    if (this.intervalElapsedMs >= this.intervalDurationMs) {
      if (this.state === 'PREPARATION') {
        this.startRound(1);
      } else if (this.state === 'WORK' || this.state === 'WARNING') {
        this.endRound();
      } else if (this.state === 'REST') {
        this.startRound(this.currentRound + 1);
      }
      return;
    }

    this.broadcast();
    this.broadcastDiagnostics();
  }

  private recalibrateAgainstRealTime(): void {
    if (this.state === 'PAUSED' || this.state === 'IDLE' || this.state === 'COMPLETE') return;
    const now = performance.now();
    this.intervalElapsedMs = now - this.intervalStartEpoch;

    if (this.intervalElapsedMs >= this.intervalDurationMs) {
      this.skip();
    } else {
      this.broadcast();
    }
  }

  public getSnapshot(): TimerSnapshot {
    const msRemaining = Math.max(0, this.intervalDurationMs - this.intervalElapsedMs);
    const secondsRemaining = Math.ceil(msRemaining / 1000);
    const progress = this.intervalDurationMs > 0 
      ? Math.min(1.0, Math.max(0, this.intervalElapsedMs / this.intervalDurationMs))
      : 0;

    return {
      state: this.state,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      secondsRemainingInInterval: secondsRemaining,
      intervalDuration: Math.round(this.intervalDurationMs / 1000),
      intervalProgress: progress,
      totalElapsedSeconds: Math.floor(this.totalElapsedMs / 1000),
      isPaused: this.state === 'PAUSED',
      activeWorkSeconds: Math.floor(this.totalActiveWorkMs / 1000),
      presetName: this.presetName
    };
  }

  public getDiagnostic(): ClockDiagnostic {
    return {
      clockSource: 'PERFORMANCE.NOW (High-Resolution Timestamp)',
      workerStatus: this.worker ? 'ACTIVE' : 'INACTIVE',
      audioContextStatus: soundEngine.getAudioState(),
      lastDriftMs: this.lastDriftMs,
      maxDriftMs: this.maxDriftMs,
      totalTicks: this.tickCount,
      scheduledEvents: this.totalRounds * 2 + 5,
      driftStatus: 'MEASURED'
    };
  }

  public subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.getSnapshot());
    return () => this.listeners.delete(fn);
  }

  public subscribeDiagnostics(fn: DiagnosticListener): () => void {
    this.diagListeners.add(fn);
    fn(this.getDiagnostic());
    return () => this.diagListeners.delete(fn);
  }

  private broadcast(): void {
    const snap = this.getSnapshot();
    this.listeners.forEach((fn) => fn(snap));
  }

  private broadcastDiagnostics(): void {
    if (this.diagListeners.size === 0) return;
    const diag = this.getDiagnostic();
    this.diagListeners.forEach((fn) => fn(diag));
  }
}

export const timerEngine = new TimerCoordinator();
