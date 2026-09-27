'use client';

// KINETIC CORE - Unified Single-Link Operating System
// Runs the entire suite on a single link (http://localhost:3001/) with instant in-place switching:
// Athlete Command Center, Locked Training Console, Interval Timer, Strength OS, Combat Lab,
// Session Builder, Analytics, Calendar History, and 3D Showcase.

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, AppView } from '@/lib/store/useAppStore';
import { timerEngine, TimerSnapshot } from '@/lib/timing/timerCoordinator';
import { dbEngine, DEFAULT_PRESETS } from '@/lib/storage/db';
import { aggregateAthleteMetrics, AthleteSummaryMetrics, extractPersonalRecords } from '@/lib/analytics/statsAggregator';
import { TrainingSession, CustomTrainingPreset, PersonalRecord } from '@/types';

// Components
import { LockedTrainingView } from '@/components/CoreTimer/LockedTrainingView';
import { RoundConfigModal } from '@/components/RoundTimer/RoundConfigModal';
import { ExerciseLogger } from '@/components/SetTracker/ExerciseLogger';
import { OneRepMaxModal } from '@/components/StrengthCalculator/OneRepMaxModal';
import { ProgressionCalculator } from '@/components/StrengthCalculator/ProgressionCalculator';
import { CombinationRecorder } from '@/components/CombatLab/CombinationRecorder';
import { TaekwondoDrillTracker } from '@/components/CombatLab/TaekwondoDrillTracker';
import { BlockTimeline } from '@/components/SessionBuilder/BlockTimeline';
import { VolumeOverTimeChart } from '@/components/KineticGraph/VolumeOverTimeChart';
import { SilhouetteMap } from '@/components/BodyMovementMap/SilhouetteMap';
import { ActivityGrid } from '@/components/TrainingHeatmap/ActivityGrid';
import { AudioDiagnosticsPanel } from '@/components/AudioController/AudioDiagnosticsPanel';
import { TimerDriftMonitor } from '@/components/Diagnostics/TimerDriftMonitor';
import { KineticParticleField } from '@/components/ThreeBackground/KineticParticleField';
import { exportDataAsJSON, exportSessionsAsCSV, importDataFromFile } from '@/lib/storage/exportImport';
import { saveSettings, loadSettings } from '@/lib/storage/preferences';

// Icons
import {
  Flame,
  Timer,
  Dumbbell,
  Shield,
  Layers,
  Activity,
  History,
  Settings,
  Sparkles,
  Play,
  Award,
  Download,
  Upload,
  Trash2,
  Lock,
  ChevronDown,
  ChevronUp,
  User,
  Sliders,
  Keyboard,
  Zap,
  Check
} from 'lucide-react';

export default function UnifiedSingleLinkApp() {
  const { currentView, setCurrentView, isLockedTraining, setIsLockedTraining } = useAppStore();
  
  // Authoritative clock state
  const [snapshot, setSnapshot] = useState<TimerSnapshot>(timerEngine.getSnapshot());
  const [presets, setPresets] = useState<CustomTrainingPreset[]>(DEFAULT_PRESETS);
  const [selectedPreset, setSelectedPreset] = useState<CustomTrainingPreset>(DEFAULT_PRESETS[1]);
  
  // Data state
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [metrics, setMetrics] = useState<AthleteSummaryMetrics | null>(null);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  
  // History view state
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [historyStatus, setHistoryStatus] = useState<string | null>(null);

  // Strength subtab
  const [strengthSubTab, setStrengthSubTab] = useState<'LOGGER' | 'ONEREPMAX' | 'PROGRESSION'>('LOGGER');

  // Combat subtab
  const [combatSubTab, setCombatSubTab] = useState<'COMBOS' | 'TAEKWONDO'>('COMBOS');

  // Load and subscribe
  useEffect(() => {
    const unsub = timerEngine.subscribe((snap) => {
      setSnapshot(snap);
      if (snap.state === 'WORK' || snap.state === 'REST' || snap.state === 'PREPARATION' || snap.state === 'WARNING') {
        setIsLockedTraining(true);
      }
    });

    loadAllData();
    return unsub;
  }, []);

  const loadAllData = async () => {
    try {
      const p = await dbEngine.getPresets();
      if (p && p.length > 0) {
        setPresets(p);
        setSelectedPreset(p[0]);
      }
      const s = await dbEngine.getSessions();
      setSessions(s);
      setMetrics(aggregateAthleteMetrics(s));
      setRecords(extractPersonalRecords(s));
    } catch (e) {
      console.warn('Init data load error:', e);
    }
  };

  const handleStartPreset = (p: CustomTrainingPreset) => {
    setSelectedPreset(p);
    timerEngine.loadPreset(p);
    timerEngine.start();
    setIsLockedTraining(true);
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // If in locked training mode, render the giant distraction-free training console
  if (isLockedTraining) {
    return (
      <LockedTrainingView
        onExit={() => setIsLockedTraining(false)}
        presetTitle={selectedPreset.name}
      />
    );
  }

  // Zone loads for silhouette
  const zoneLoads: Record<string, number> = {};
  sessions.forEach((s) => {
    if (s.exercises) {
      s.exercises.forEach((ex) => {
        const vol = ex.sets.reduce((acc, set) => acc + (set.completed ? (set.weight || 0) * (set.reps || 0) : 0), 0);
        ex.muscleGroups.forEach((mg) => {
          zoneLoads[mg] = (zoneLoads[mg] || 0) + vol;
        });
      });
    }
  });

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-[#07080a] text-neutral-100 pb-16">
      
      {/* Background kinetic particle field */}
      <KineticParticleField activityLevel="WORK" density={300} className="opacity-40" />

      {/* Unified Fast Console Navigation Bar */}
      <div className="sticky top-14 z-40 bg-[#090b0f]/95 border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          {[
            { id: 'TRAIN', label: 'COMMAND RIG', icon: Flame },
            { id: 'TIMER', label: 'COMBAT TIMER', icon: Timer },
            { id: 'STRENGTH', label: 'STRENGTH OS', icon: Dumbbell },
            { id: 'COMBAT', label: 'COMBAT LAB', icon: Shield },
            { id: 'BUILDER', label: 'SESSION BUILDER', icon: Layers },
            { id: 'ANALYTICS', label: 'ANALYTICS', icon: Activity },
            { id: 'HISTORY', label: 'ARCHIVE & CALENDAR', icon: History },
            { id: 'SETTINGS', label: 'CONFIG & DRIFT', icon: Settings },
            { id: 'SHOWCASE', label: 'SYSTEM SHOWCASE', icon: Sparkles }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as AppView)}
                className={`px-3 py-1.5 rounded-lg font-mono-tech text-xs tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00ff87] text-black font-extrabold shadow-[0_0_15px_rgba(0,255,135,0.3)]'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-[#00ff87]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 relative z-10">

        {/* VIEW 1: ATHLETE COMMAND RIG & FAST LAUNCHER */}
        {currentView === 'TRAIN' && (
          <div className="space-y-6">
            {/* Header Rig */}
            <div className="equipment-panel rounded-2xl p-6 sm:p-8 border border-white/15 bg-gradient-to-r from-[#0c0e14] via-[#090b0f] to-[#0c0e14]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00ff87] shadow-[0_0_10px_rgba(0,255,135,0.8)]" />
                    <span className="text-xs font-mono-tech tracking-widest text-[#00ff87] uppercase font-bold">
                      ATHLETE COMMAND RIG // STATUS: READY
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black font-mono-tech tracking-tight text-white">
                    UNIFIED CONSOLE
                  </h1>
                  <p className="text-xs sm:text-sm font-mono-tech text-neutral-400">
                    Active Protocol: <span className="text-white font-bold">{selectedPreset.name}</span>
                  </p>
                </div>

                {/* 1-Tap Arm & Start Action */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleStartPreset(selectedPreset)}
                    className="px-8 py-4 rounded-xl bg-[#00ff87] hover:bg-[#00e578] text-black font-mono-tech font-extrabold text-base tracking-wider flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(0,255,135,0.4)] transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>START TRAINING NOW [SPACE]</span>
                  </button>
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 font-mono-tech">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-[10px] text-neutral-400 block mb-0.5">CURRENT STREAK</span>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="text-xl font-bold text-white">{metrics ? `${metrics.currentStreakDays} DAYS` : '0 DAYS'}</span>
                  </div>
                  <span className="text-[9px] text-neutral-400">CONSISTENCY</span>
                </div>

                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-[10px] text-neutral-400 block mb-0.5">RECORDED SESSIONS</span>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#00ff87]" />
                    <span className="text-xl font-bold text-white">{metrics ? metrics.totalSessions : 0}</span>
                  </div>
                  <span className="text-[9px] text-neutral-400">LOCAL INDEXEDDB</span>
                </div>

                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-[10px] text-neutral-400 block mb-0.5">ROUNDS COMPLETED</span>
                  <div className="flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-[#38bdf8]" />
                    <span className="text-xl font-bold text-[#38bdf8]">{metrics ? metrics.roundsCompleted : 0}</span>
                  </div>
                  <span className="text-[9px] text-neutral-400">COMBAT INTERVALS</span>
                </div>

                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-[10px] text-neutral-400 block mb-0.5">TOTAL VOLUME</span>
                  <div className="flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4 text-neutral-300" />
                    <span className="text-xl font-bold text-neutral-200">{metrics ? `${metrics.totalVolumeKg.toLocaleString()} KG` : '0 KG'}</span>
                  </div>
                  <span className="text-[9px] text-neutral-400">Σ(W × R)</span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setCurrentView('TIMER')}
                className="equipment-panel rounded-xl p-5 border border-white/15 hover:border-[#00ff87]/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#00ff87]/10 border border-[#00ff87]/30 flex items-center justify-center text-[#00ff87] mb-3 group-hover:scale-105 transition-transform">
                    <Timer className="w-5 h-5" />
                  </div>
                  <h3 className="font-mono-tech font-bold text-base text-white mb-1">COMBAT INTERVAL TIMER</h3>
                  <p className="text-xs font-mono-tech text-neutral-400 leading-relaxed">
                    Drift-free Web Worker clock. Boxing, MMA, and Muay Thai protocols with bronze bells and clappers.
                  </p>
                </div>
                <div className="mt-4 text-xs font-mono-tech text-[#00ff87] font-bold">OPEN TIMER SUITE →</div>
              </div>

              <div
                onClick={() => setCurrentView('STRENGTH')}
                className="equipment-panel rounded-xl p-5 border border-white/15 hover:border-[#38bdf8]/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] mb-3 group-hover:scale-105 transition-transform">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <h3 className="font-mono-tech font-bold text-base text-white mb-1">STRENGTH LOG & 1RM LAB</h3>
                  <p className="text-xs font-mono-tech text-neutral-400 leading-relaxed">
                    Log sets, reps, and RPE. Real-time tonnage, progressive overload suggestions, and 4 scientific 1RM formulas.
                  </p>
                </div>
                <div className="mt-4 text-xs font-mono-tech text-[#38bdf8] font-bold">OPEN STRENGTH OS →</div>
              </div>

              <div
                onClick={() => setCurrentView('COMBAT')}
                className="equipment-panel rounded-xl p-5 border border-white/15 hover:border-amber-400/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="font-mono-tech font-bold text-base text-white mb-1">COMBAT LAB & COMBOS</h3>
                  <p className="text-xs font-mono-tech text-neutral-400 leading-relaxed">
                    Boxing strike combinations (1-2-3-2), Taekwondo kicking drills with bilateral symmetry tracking.
                  </p>
                </div>
                <div className="mt-4 text-xs font-mono-tech text-amber-400 font-bold">OPEN COMBAT LAB →</div>
              </div>
            </div>

            {/* Presets Shelf */}
            <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <span className="font-mono-tech font-bold text-xs text-neutral-400 tracking-wider">
                  QUICK PROTOCOLS (1-TAP ARMING)
                </span>
                <button
                  onClick={() => setCurrentView('TIMER')}
                  className="text-xs font-mono-tech text-[#00ff87] hover:underline cursor-pointer"
                >
                  CUSTOMIZE PROTOCOLS →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {presets.map((p) => {
                  const isSelected = selectedPreset.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPreset(p);
                        timerEngine.loadPreset(p);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-[#00ff87] bg-[#00ff87]/10 shadow-[0_0_15px_rgba(0,255,135,0.15)]'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono-tech font-bold text-xs sm:text-sm text-white line-clamp-1">{p.name}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 rounded bg-[#00ff87] text-black font-mono-tech text-[10px] font-bold">
                            ARMED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono-tech text-neutral-400">
                        <span>{p.roundsCount} ROUNDS</span>
                        <span>{formatSecs(p.roundDurationSeconds)} / {formatSecs(p.restDurationSeconds)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: COMBAT INTERVAL TIMER */}
        {currentView === 'TIMER' && (
          <div className="space-y-6">
            <RoundConfigModal onStartWithConfig={(p) => handleStartPreset(p)} />
            <TimerDriftMonitor />
          </div>
        )}

        {/* VIEW 3: STRENGTH OS */}
        {currentView === 'STRENGTH' && (
          <div className="space-y-6">
            <div className="equipment-panel rounded-xl p-4 border border-white/15 flex flex-wrap gap-2">
              <button
                onClick={() => setStrengthSubTab('LOGGER')}
                className={`px-4 py-2 rounded font-mono-tech text-xs font-bold transition-all cursor-pointer ${
                  strengthSubTab === 'LOGGER' ? 'bg-[#00ff87] text-black' : 'bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                EXERCISE LOGGER & VOLUME
              </button>
              <button
                onClick={() => setStrengthSubTab('ONEREPMAX')}
                className={`px-4 py-2 rounded font-mono-tech text-xs font-bold transition-all cursor-pointer ${
                  strengthSubTab === 'ONEREPMAX' ? 'bg-[#38bdf8] text-black' : 'bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                1RM SCIENTIFIC CALCULATOR
              </button>
              <button
                onClick={() => setStrengthSubTab('PROGRESSION')}
                className={`px-4 py-2 rounded font-mono-tech text-xs font-bold transition-all cursor-pointer ${
                  strengthSubTab === 'PROGRESSION' ? 'bg-amber-400 text-black' : 'bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                PROGRESSIVE OVERLOAD ENGINE
              </button>
            </div>

            {strengthSubTab === 'LOGGER' && <ExerciseLogger />}
            {strengthSubTab === 'ONEREPMAX' && <OneRepMaxModal />}
            {strengthSubTab === 'PROGRESSION' && <ProgressionCalculator />}
          </div>
        )}

        {/* VIEW 4: COMBAT LAB */}
        {currentView === 'COMBAT' && (
          <div className="space-y-6">
            <div className="equipment-panel rounded-xl p-4 border border-white/15 flex gap-2">
              <button
                onClick={() => setCombatSubTab('COMBOS')}
                className={`px-4 py-2 rounded font-mono-tech text-xs font-bold transition-all cursor-pointer ${
                  combatSubTab === 'COMBOS' ? 'bg-[#00ff87] text-black' : 'bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                BOXING COMBINATIONS (1-2-3-2)
              </button>
              <button
                onClick={() => setCombatSubTab('TAEKWONDO')}
                className={`px-4 py-2 rounded font-mono-tech text-xs font-bold transition-all cursor-pointer ${
                  combatSubTab === 'TAEKWONDO' ? 'bg-[#38bdf8] text-black' : 'bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                TAEKWONDO & KICK DRILLS
              </button>
            </div>

            {combatSubTab === 'COMBOS' && <CombinationRecorder />}
            {combatSubTab === 'TAEKWONDO' && <TaekwondoDrillTracker />}
          </div>
        )}

        {/* VIEW 5: SESSION BUILDER */}
        {currentView === 'BUILDER' && (
          <div className="space-y-6">
            <BlockTimeline />
          </div>
        )}

        {/* VIEW 6: ANALYTICS & MOVEMENT MAP */}
        {currentView === 'ANALYTICS' && (
          <div className="space-y-6">
            <VolumeOverTimeChart />
            <SilhouetteMap zoneLoads={zoneLoads} />

            {/* Personal Records */}
            <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="font-mono-tech font-bold text-base text-white tracking-wider">
                    PERSONAL RECORDS
                  </h3>
                </div>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  PROVEN BENCHMARKS
                </span>
              </div>

              {records.length === 0 ? (
                <p className="text-xs font-mono-tech text-neutral-400 italic">
                  Complete more sessions to establish historical personal records.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {records.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl bg-[#090b0f] border border-white/10 font-mono-tech">
                      <span className="text-[10px] text-neutral-400 block mb-1 uppercase tracking-wider">
                        {r.category} // {r.metric}
                      </span>
                      <div className="text-xl font-bold text-white mb-1">
                        {r.value} <span className="text-xs text-neutral-400 font-normal">{r.unit}</span>
                      </div>
                      <span className="text-[9px] text-[#00ff87] block">
                        Achieved: {new Date(r.achievedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 7: ARCHIVE & CALENDAR HEATMAP */}
        {currentView === 'HISTORY' && (
          <div className="space-y-6">
            <div className="equipment-panel rounded-2xl p-6 border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-mono-tech font-black text-white">TRAINING ARCHIVE & CALENDAR</h2>
                <p className="text-xs font-mono-tech text-neutral-400 mt-1">
                  100% on-device IndexedDB storage. Export or restore anytime.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono-tech text-xs">
                <button
                  onClick={() => exportDataAsJSON()}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#00ff87]" />
                  <span>EXPORT JSON</span>
                </button>
                <button
                  onClick={() => exportSessionsAsCSV()}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>EXPORT CSV</span>
                </button>
                <label className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>RESTORE</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        const r = await importDataFromFile(f);
                        setHistoryStatus(`Restored ${r.count} sessions.`);
                        loadAllData();
                      } catch (err: any) {
                        alert(`Restore failed: ${err.message}`);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {historyStatus && (
              <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono-tech text-xs">
                ✓ {historyStatus}
              </div>
            )}

            <ActivityGrid sessions={sessions} />

            {/* Sessions Table */}
            <div className="space-y-2">
              <h3 className="font-mono-tech font-bold text-xs text-neutral-400 tracking-wider">
                RECORDED WORKOUTS ({sessions.length})
              </h3>
              {sessions.map((s) => (
                <div key={s.id} className="equipment-panel rounded-xl p-4 border border-white/10 font-mono-tech text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm block">{s.title}</span>
                      <span className="text-neutral-400 text-[11px]">
                        {new Date(s.startedAt).toLocaleDateString()} • {Math.floor(s.totalDurationSeconds / 60)} mins • Type: {s.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#00ff87] font-bold">LOAD: {s.kineticLoad}</span>
                      <button
                        onClick={async () => {
                          if (confirm('Delete session?')) {
                            await dbEngine.deleteSession(s.id);
                            loadAllData();
                          }
                        }}
                        className="text-neutral-500 hover:text-red-400 cursor-pointer p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 8: CONFIG & DRIFT */}
        {currentView === 'SETTINGS' && (
          <div className="space-y-6">
            <AudioDiagnosticsPanel />
            <TimerDriftMonitor />

            {/* Keyboard Shortcuts */}
            <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15 font-mono-tech">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <Keyboard className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white tracking-wider">TRAINING KEYBOARD SHORTCUTS</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'SPACE', action: 'Pause / Resume Clock', desc: 'Primary toggle for hands-free training' },
                  { key: '→ (RIGHT)', action: 'Skip Active Interval', desc: 'Advance to rest or next combat round' },
                  { key: 'R', action: 'Restart Session', desc: 'Rewinds to round 1 with original prep delay' },
                  { key: 'M', action: 'Mute / Unmute Audio', desc: 'Silence bronze bells and synthesized clicks' },
                  { key: 'F', action: 'Toggle Fullscreen', desc: 'Enlarges display into dedicated gym kiosk mode' },
                  { key: 'ESC', action: 'Exit Training Console', desc: 'Disarms clock and returns to athlete overview' }
                ].map((sc) => (
                  <div key={sc.key} className="p-3 rounded-lg bg-[#090b0f] border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{sc.action}</span>
                      <span className="text-[10px] text-neutral-400">{sc.desc}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-white/10 border border-white/20 text-xs font-bold text-[#00ff87]">
                      {sc.key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 9: 3D PRODUCT SHOWCASE & PHILOSOPHY */}
        {currentView === 'SHOWCASE' && (
          <div className="space-y-12 py-6 text-center max-w-4xl mx-auto font-mono-tech">
            <div className="space-y-4">
              <span className="text-xs text-[#00ff87] tracking-widest uppercase">
                COMBAT TRAINING × STRENGTH PERFORMANCE × PRECISION TIMING
              </span>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                KINETIC CORE
              </h1>
              <p className="text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                A precision training operating system designed around the realities of combat and strength training.
                No social media feeds, zero fabricated biometric data, offline-first sovereignty.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => setCurrentView('TRAIN')}
                  className="px-6 py-3 rounded-xl bg-[#00ff87] text-black font-extrabold text-xs tracking-wider cursor-pointer"
                >
                  ENTER ATHLETE COMMAND RIG →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              {[
                { title: '01 SPEED', desc: '1-tap start. Zero setup latency.' },
                { title: '02 PRECISION', desc: 'Sub-ms Web Worker clock.' },
                { title: '03 OFFLINE FIRST', desc: '100% on-device IndexedDB storage.' },
                { title: '04 ZERO FRICTION', desc: 'Glove-safe 80px touchpads & hotkeys.' }
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[#00ff87] font-bold text-xs block mb-1">{item.title}</span>
                  <span className="text-xs text-neutral-300">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
