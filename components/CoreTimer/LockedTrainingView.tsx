'use client';

// KINETIC CORE - Locked Hands-Free Training Console
// Designed for actual combat & strength training: zero friction, boxing-glove friendly.
// Huge tap targets, full keyboard shortcut map, wake lock, and distraction-free visual telemetry.

import React, { useEffect, useState, useCallback } from 'react';
import { Play, Pause, SkipForward, Square, Maximize, Minimize, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { timerEngine, TimerSnapshot } from '@/lib/timing/timerCoordinator';
import { soundEngine } from '@/lib/audio/soundSynthesizer';
import { RadialCountdown } from './RadialCountdown';
import { dbEngine } from '@/lib/storage/db';
import { calculateKineticLoad } from '@/lib/calculations/kineticLoad';

interface LockedTrainingViewProps {
  onExit?: () => void;
  presetTitle?: string;
}

export const LockedTrainingView: React.FC<LockedTrainingViewProps> = ({
  onExit,
  presetTitle = 'Combat Rounds'
}) => {
  const [snapshot, setSnapshot] = useState<TimerSnapshot>(timerEngine.getSnapshot());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.isSoundMuted());
  const [sessionSavedNotice, setSessionSavedNotice] = useState(false);

  // Sync state with authoritative coordinator
  useEffect(() => {
    const unsub = timerEngine.subscribe((snap) => {
      setSnapshot(snap);
      if (snap.state === 'COMPLETE') {
        saveCompletedSession(snap);
      }
    });

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      unsub();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Save session when training completes
  const saveCompletedSession = async (snap: TimerSnapshot) => {
    try {
      const load = calculateKineticLoad({
        roundsCompleted: snap.currentRound,
        activeWorkSeconds: snap.activeWorkSeconds
      });

      await dbEngine.saveSession({
        id: `session-${Date.now()}`,
        startedAt: Date.now() - (snap.totalElapsedSeconds * 1000),
        endedAt: Date.now(),
        type: 'boxing',
        title: snap.presetName || presetTitle,
        totalDurationSeconds: snap.totalElapsedSeconds,
        roundsPlanned: snap.totalRounds,
        roundsCompleted: snap.currentRound,
        kineticLoad: load.totalKineticLoad,
        origin: 'CALCULATED'
      });
      setSessionSavedNotice(true);
    } catch (err) {
      console.warn('Failed to auto-save session:', err);
    }
  };

  // Keyboard shortcut listener: Space, ArrowRight, Escape, R, M, F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSkip();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        handleEnd();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleRestart();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleMuteToggle();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [snapshot]);

  const handlePlayPause = useCallback(() => {
    soundEngine.playButtonTap();
    if (snapshot.state === 'IDLE') {
      timerEngine.start();
    } else if (snapshot.isPaused) {
      timerEngine.resume();
    } else {
      timerEngine.pause();
    }
  }, [snapshot]);

  const handleSkip = useCallback(() => {
    timerEngine.skip();
  }, []);

  const handleRestart = useCallback(() => {
    soundEngine.playButtonTap();
    timerEngine.reset();
    timerEngine.start();
  }, []);

  const handleEnd = useCallback(() => {
    soundEngine.playButtonTap();
    timerEngine.reset();
    if (onExit) onExit();
  }, [onExit]);

  const handleMuteToggle = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  }, [isMuted]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const isRunning = snapshot.state === 'WORK' || snapshot.state === 'REST' || snapshot.state === 'WARNING' || snapshot.state === 'PREPARATION';

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col justify-between p-4 sm:p-6 bg-[#060709] text-white select-none">
      
      {/* Top Console Telemetry Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono-tech tracking-widest text-neutral-400 uppercase">
              TRAINING CONSOLE // LOCKED MODE
            </span>
            <span className="text-sm sm:text-base font-mono-tech font-bold text-neutral-100">
              {snapshot.presetName || presetTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute button */}
          <button
            onClick={handleMuteToggle}
            className="p-3 rounded-lg bg-white/5 border border-white/10 text-neutral-300 hover:text-white glove-button"
            aria-label="Mute Audio"
            title="Press 'M' to mute"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-neutral-300" />}
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-lg bg-white/5 border border-white/10 text-neutral-300 hover:text-white glove-button"
            aria-label="Toggle Fullscreen"
            title="Press 'F' for fullscreen"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          {/* Exit / End button */}
          <button
            onClick={handleEnd}
            className="px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono-tech text-xs font-bold tracking-wider glove-button"
            title="Press 'ESC' to exit"
          >
            EXIT [ESC]
          </button>
        </div>
      </div>

      {/* Main Radial Countdown Visualization */}
      <div className="flex-1 flex flex-col items-center justify-center my-6">
        <RadialCountdown
          secondsRemaining={snapshot.secondsRemainingInInterval}
          intervalDuration={snapshot.intervalDuration}
          intervalProgress={snapshot.intervalProgress}
          state={snapshot.state}
          currentRound={snapshot.currentRound}
          totalRounds={snapshot.totalRounds}
          size={390}
          strokeWidth={14}
        />

        {sessionSavedNotice && (
          <div className="mt-4 px-4 py-2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono-tech text-xs tracking-wider animate-bounce">
            ✓ SESSION PERSISTED TO LOCAL INDEXEDDB
          </div>
        )}
      </div>

      {/* Bottom Large Glove-Friendly Control Pad */}
      <div className="max-w-2xl mx-auto w-full grid grid-cols-3 gap-3 sm:gap-4 pt-2">
        {/* Restart Button */}
        <button
          onClick={handleRestart}
          className="h-20 sm:h-24 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 flex flex-col items-center justify-center gap-1 glove-button text-neutral-300 hover:text-white"
          aria-label="Restart Session"
        >
          <RotateCcw className="w-6 h-6" />
          <span className="font-mono-tech text-xs sm:text-sm font-bold tracking-wider">
            RESTART [R]
          </span>
        </button>

        {/* Huge Primary Play / Pause Button */}
        <button
          onClick={handlePlayPause}
          className={`h-20 sm:h-24 rounded-xl border flex flex-col items-center justify-center gap-1 glove-button shadow-lg transition-transform active:scale-95 ${
            isRunning && !snapshot.isPaused
              ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300'
              : 'bg-[#00ff87] hover:bg-[#00e578] border-[#00ff87] text-black'
          }`}
          aria-label={isRunning && !snapshot.isPaused ? 'Pause Timer' : 'Resume Timer'}
        >
          {isRunning && !snapshot.isPaused ? (
            <>
              <Pause className="w-7 h-7 fill-current" />
              <span className="font-mono-tech text-xs sm:text-sm font-extrabold tracking-wider">
                PAUSE [SPACE]
              </span>
            </>
          ) : (
            <>
              <Play className="w-7 h-7 fill-current" />
              <span className="font-mono-tech text-xs sm:text-sm font-extrabold tracking-wider">
                {snapshot.state === 'IDLE' ? 'START [SPACE]' : 'RESUME [SPACE]'}
              </span>
            </>
          )}
        </button>

        {/* Skip Interval Button */}
        <button
          onClick={handleSkip}
          className="h-20 sm:h-24 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 flex flex-col items-center justify-center gap-1 glove-button text-neutral-300 hover:text-white"
          aria-label="Skip Interval"
        >
          <SkipForward className="w-6 h-6" />
          <span className="font-mono-tech text-xs sm:text-sm font-bold tracking-wider">
            SKIP [→]
          </span>
        </button>
      </div>

      {/* Keyboard Shortcut Footer Guidance */}
      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] font-mono-tech text-neutral-400">
        <span>SPACE: PAUSE/RESUME</span>
        <span>•</span>
        <span>→: SKIP ROUND</span>
        <span>•</span>
        <span>R: RESTART</span>
        <span>•</span>
        <span>M: MUTE</span>
        <span>•</span>
        <span>ESC: EXIT</span>
      </div>
    </div>
  );
};
