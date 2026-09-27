'use client';

// KINETIC CORE - Combat Timer Suite
// Dedicated combat intervals: Boxing (3m/30s), MMA (5m/1m), Muay Thai, Tabata, Custom intervals.

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoundConfigModal } from '@/components/RoundTimer/RoundConfigModal';
import { TimerDriftMonitor } from '@/components/Diagnostics/TimerDriftMonitor';
import { CustomTrainingPreset } from '@/types';
import { timerEngine } from '@/lib/timing/timerCoordinator';
import { Timer, Zap, Shield, Sliders } from 'lucide-react';

export default function TimerPage() {
  const router = useRouter();

  const handleStartWithConfig = (preset: CustomTrainingPreset) => {
    timerEngine.loadPreset(preset);
    timerEngine.start();
    router.push('/train');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="equipment-panel rounded-2xl p-6 sm:p-8 border border-white/15">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-[#00ff87]/10 border border-[#00ff87]/30 flex items-center justify-center text-[#00ff87]">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono-tech text-[#00ff87] tracking-widest uppercase font-bold">
              COMBAT INTERVAL PROTOCOLS
            </span>
            <h1 className="text-2xl sm:text-3xl font-mono-tech font-black text-white">
              PRECISION INTERVAL TIMER
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm font-mono-tech text-neutral-400 max-w-2xl leading-relaxed">
          Select or customize professional combat intervals. Powered by high-precision Web Worker scheduling with bronze bell and ringside wood clapper audio synthesis.
        </p>
      </div>

      {/* Main Configuration Modal / Card */}
      <RoundConfigModal onStartWithConfig={handleStartWithConfig} />

      {/* Authoritative Clock Diagnostics */}
      <TimerDriftMonitor />
    </div>
  );
}
