'use client';

// KINETIC CORE - Athlete Command Center & Locked Training Console
// Zero friction: 1-tap start to locked hands-free training mode.

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Timer,
  Dumbbell,
  Shield,
  Layers,
  ChevronRight,
  Play,
  RotateCcw,
  Zap,
  Award,
  Activity,
  Maximize2
} from 'lucide-react';
import { timerEngine, TimerSnapshot } from '@/lib/timing/timerCoordinator';
import { LockedTrainingView } from '@/components/CoreTimer/LockedTrainingView';
import { dbEngine, DEFAULT_PRESETS } from '@/lib/storage/db';
import { aggregateAthleteMetrics, AthleteSummaryMetrics } from '@/lib/analytics/statsAggregator';
import { TrainingSession, CustomTrainingPreset } from '@/types';

export default function TrainPage() {
  const [snapshot, setSnapshot] = useState<TimerSnapshot>(timerEngine.getSnapshot());
  const [isLockedTrainingMode, setIsLockedTrainingMode] = useState<boolean>(false);
  const [presets, setPresets] = useState<CustomTrainingPreset[]>(DEFAULT_PRESETS);
  const [selectedPreset, setSelectedPreset] = useState<CustomTrainingPreset>(DEFAULT_PRESETS[1]);
  const [metrics, setMetrics] = useState<AthleteSummaryMetrics | null>(null);

  useEffect(() => {
    // Subscribe to clock updates
    const unsub = timerEngine.subscribe((snap) => {
      setSnapshot(snap);
      if (snap.state === 'WORK' || snap.state === 'REST' || snap.state === 'PREPARATION' || snap.state === 'WARNING') {
        setIsLockedTrainingMode(true);
      }
    });

    // Load presets and session stats from IndexedDB
    dbEngine.getPresets().then((p) => {
      if (p && p.length > 0) {
        setPresets(p);
        setSelectedPreset(p[0]);
      }
    });

    dbEngine.getSessions().then((s) => {
      setMetrics(aggregateAthleteMetrics(s));
    });

    return unsub;
  }, []);

  const handleSelectPreset = (p: CustomTrainingPreset) => {
    setSelectedPreset(p);
    timerEngine.loadPreset(p);
  };

  const handleInstantStart = () => {
    timerEngine.loadPreset(selectedPreset);
    timerEngine.start();
    setIsLockedTrainingMode(true);
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // If session is active or user requested locked mode, render high-contrast distraction-free training console
  if (isLockedTrainingMode) {
    return (
      <LockedTrainingView
        onExit={() => setIsLockedTrainingMode(false)}
        presetTitle={selectedPreset.name}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Athlete Command Center Header */}
      <div className="equipment-panel rounded-2xl p-6 sm:p-8 border border-white/15 bg-gradient-to-r from-[#0c0e14] via-[#090b0f] to-[#0c0e14]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ff87] shadow-[0_0_10px_rgba(0,255,135,0.8)]" />
              <span className="text-xs font-mono-tech tracking-widest text-[#00ff87] uppercase font-bold">
                ATHLETE COMMAND CENTER // TRAINING STATUS: READY
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-mono-tech tracking-tight text-white">
              COMMAND RIG
            </h1>
            <p className="text-xs sm:text-sm font-mono-tech text-neutral-400">
              Selected Protocol: <span className="text-white font-bold">{selectedPreset.name}</span>
            </p>
          </div>

          {/* Enormous 1-Tap Start Training Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleInstantStart}
              className="px-8 py-4 rounded-xl bg-[#00ff87] hover:bg-[#00e578] text-black font-mono-tech font-extrabold text-base tracking-wider flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(0,255,135,0.4)] transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START TRAINING NOW [SPACE]</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 font-mono-tech">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] text-neutral-400 block mb-0.5">CURRENT STREAK</span>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400 fill-current" />
              <span className="text-xl font-bold text-white">
                {metrics ? `${metrics.currentStreakDays} DAYS` : '0 DAYS'}
              </span>
            </div>
            <span className="text-[9px] text-neutral-400">CONSISTENCY METRIC</span>
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] text-neutral-400 block mb-0.5">TOTAL SESSIONS</span>
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#00ff87]" />
              <span className="text-xl font-bold text-white">
                {metrics ? metrics.totalSessions : 0}
              </span>
            </div>
            <span className="text-[9px] text-neutral-400">ON-DEVICE RECORDED</span>
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] text-neutral-400 block mb-0.5">ROUNDS COMPLETED</span>
            <div className="flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-[#38bdf8]" />
              <span className="text-xl font-bold text-[#38bdf8]">
                {metrics ? metrics.roundsCompleted : 0}
              </span>
            </div>
            <span className="text-[9px] text-neutral-400">COMBAT INTERVALS</span>
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] text-neutral-400 block mb-0.5">TOTAL VOLUME</span>
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-neutral-300" />
              <span className="text-xl font-bold text-neutral-200">
                {metrics ? `${metrics.totalVolumeKg.toLocaleString()} KG` : '0 KG'}
              </span>
            </div>
            <span className="text-[9px] text-neutral-400">MECHANICAL WORKLOAD</span>
          </div>
        </div>
      </div>

      {/* Main Action Hub Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Combat Interval Timer */}
        <Link
          href="/timer"
          className="equipment-panel rounded-xl p-5 border border-white/15 hover:border-[#00ff87]/50 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#00ff87]/10 border border-[#00ff87]/30 flex items-center justify-center text-[#00ff87] mb-3 group-hover:scale-105 transition-transform">
              <Timer className="w-5 h-5" />
            </div>
            <h3 className="font-mono-tech font-bold text-base text-white mb-1">
              COMBAT INTERVAL TIMER
            </h3>
            <p className="text-xs font-mono-tech text-neutral-400 leading-relaxed">
              Drift-free Web Worker clock. Boxing, MMA, and Muay Thai interval protocols with ringside wood clappers and bronze bells.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-mono-tech text-[#00ff87] group-hover:translate-x-1 transition-transform">
            <span>CONFIGURE TIMERS</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        {/* Strength Operating System */}
        <Link
          href="/strength"
          className="equipment-panel rounded-xl p-5 border border-white/15 hover:border-[#38bdf8]/50 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] mb-3 group-hover:scale-105 transition-transform">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h3 className="font-mono-tech font-bold text-base text-white mb-1">
              STRENGTH LOG & 1RM LAB
            </h3>
            <p className="text-xs font-mono-tech text-neutral-400 leading-relaxed">
              Track sets, reps, and RPE. Real-time tonnage calculation, progressive overload suggestions, and 4 scientific 1RM formulas.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-mono-tech text-[#38bdf8] group-hover:translate-x-1 transition-transform">
            <span>LOG STRENGTH SESSION</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        {/* Combination Lab & Combat Drills */}
        <Link
          href="/combat"
          className="equipment-panel rounded-xl p-5 border border-white/15 hover:border-amber-400/50 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-mono-tech font-bold text-base text-white mb-1">
              COMBAT LAB & COMBOS
            </h3>
            <p className="text-xs font-mono-tech text-neutral-400 leading-relaxed">
              Program strike sequences (1-2-3-2), Taekwondo kicking drills with bilateral left/right symmetry tracking.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-mono-tech text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>OPEN COMBAT LAB</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
      </div>

      {/* Preset Quick-Arm Shelf */}
      <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <span className="font-mono-tech font-bold text-xs text-neutral-400 tracking-wider">
            ARM PROTOCOL (1-TAP SELECTION)
          </span>
          <Link href="/timer" className="text-xs font-mono-tech text-[#00ff87] hover:underline">
            VIEW ALL PROTOCOLS →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map((p) => {
            const isSelected = selectedPreset.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-[#00ff87] bg-[#00ff87]/10 shadow-[0_0_15px_rgba(0,255,135,0.15)]'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-tech font-bold text-xs sm:text-sm text-white line-clamp-1">
                    {p.name}
                  </span>
                  {isSelected && (
                    <span className="px-1.5 py-0.5 rounded bg-[#00ff87] text-black font-mono-tech text-[10px] font-bold">
                      ARMED
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-mono-tech text-neutral-400">
                  <span>{p.roundsCount} ROUNDS</span>
                  <span>{formatSecs(p.roundDurationSeconds)} WORK / {formatSecs(p.restDurationSeconds)} REST</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
