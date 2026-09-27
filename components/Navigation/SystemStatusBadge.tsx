'use client';

// KINETIC CORE - Persistent System Telemetry Badge
// Shows live network status, audio readiness, and active training states.

import React, { useEffect, useState } from 'react';
import { timerEngine, TimerSnapshot } from '@/lib/timing/timerCoordinator';
import { soundEngine } from '@/lib/audio/soundSynthesizer';

export const SystemStatusBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [timerState, setTimerState] = useState<TimerSnapshot | null>(null);
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubTimer = timerEngine.subscribe((snap) => {
      setTimerState(snap);
    });

    const checkAudio = () => {
      setAudioReady(soundEngine.getAudioState() === 'running');
    };
    checkAudio();
    const interval = setInterval(checkAudio, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubTimer();
      clearInterval(interval);
    };
  }, []);

  // Determine priority status
  let label = 'CORE ONLINE';
  let dotColor = 'bg-emerald-400';
  let glowColor = 'shadow-[0_0_8px_rgba(52,211,153,0.8)]';

  if (timerState && (timerState.state === 'WORK' || timerState.state === 'REST' || timerState.state === 'WARNING' || timerState.state === 'PREPARATION')) {
    label = 'TRAINING ACTIVE';
    dotColor = timerState.state === 'WORK' ? 'bg-[#00ff87]' : (timerState.state === 'REST' ? 'bg-[#38bdf8]' : 'bg-[#ff7b25]');
    glowColor = 'shadow-[0_0_12px_rgba(0,255,135,0.9)] animate-pulse';
  } else if (!isOnline) {
    label = 'LOCAL MODE (OFFLINE)';
    dotColor = 'bg-amber-400';
    glowColor = 'shadow-[0_0_8px_rgba(251,191,36,0.8)]';
  } else if (audioReady) {
    label = 'CORE ONLINE';
  }

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0b0d12] border border-white/10 text-[11px] font-mono-tech tracking-wider text-neutral-300">
      <span className={`w-2 h-2 rounded-full ${dotColor} ${glowColor}`} />
      <span>{label}</span>
      <span className="text-white/20">|</span>
      <span className="text-[10px] text-neutral-400">
        {audioReady ? 'AUDIO: SYNC' : 'AUDIO: STANDBY'}
      </span>
    </div>
  );
};
