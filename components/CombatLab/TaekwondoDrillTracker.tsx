'use client';

// KINETIC CORE - Taekwondo & Striking Drill Tracker
// Dedicated rep and bilateral symmetry tracking for martial artists.
// Distinct LEFT vs RIGHT rep counts. Origin: MANUALLY ENTERED.

import React, { useState } from 'react';
import { CombatTechniqueLog, TrainingSession } from '@/types';
import { dbEngine } from '@/lib/storage/db';
import { calculateKineticLoad } from '@/lib/calculations/kineticLoad';
import { Shield, Plus, Minus, RotateCcw, Save, Check } from 'lucide-react';
import { soundEngine } from '@/lib/audio/soundSynthesizer';

const TAEKWONDO_TECHNIQUES = [
  'ROUNDHOUSE KICK (Dollyo Chagi)',
  'FRONT SNAP KICK (Ap Chagi)',
  'SIDE PIERCING KICK (Yop Chagi)',
  'BACK SPINNING KICK (Dwi Chagi)',
  'AXE KICK (Naeryeo Chagi)',
  'TORNADO KICK (360 Roundhouse)',
  'CUT KICK / PUSH KICK',
  'FOOTWORK & BLITZ IN-AND-OUT',
  'SHADOW SPARRING CADENCE'
];

export const TaekwondoDrillTracker: React.FC = () => {
  const [logs, setLogs] = useState<CombatTechniqueLog[]>([
    {
      technique: 'ROUNDHOUSE KICK (Dollyo Chagi)',
      category: 'kick',
      leftCount: 45,
      rightCount: 45,
      origin: 'MANUALLY ENTERED'
    },
    {
      technique: 'SIDE PIERCING KICK (Yop Chagi)',
      category: 'kick',
      leftCount: 30,
      rightCount: 32,
      origin: 'MANUALLY ENTERED'
    }
  ]);

  const [selectedTech, setSelectedTech] = useState(TAEKWONDO_TECHNIQUES[0]);
  const [savedNotice, setSavedNotice] = useState(false);

  const totalLeft = logs.reduce((acc, curr) => acc + curr.leftCount, 0);
  const totalRight = logs.reduce((acc, curr) => acc + curr.rightCount, 0);
  const totalKicks = totalLeft + totalRight;
  const symmetryRatio = totalKicks > 0 ? Math.round((Math.min(totalLeft, totalRight) / Math.max(totalLeft, totalRight)) * 100) : 100;

  const handleIncrement = (index: number, side: 'left' | 'right', delta: number) => {
    soundEngine.playButtonTap();
    setLogs((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const current = side === 'left' ? item.leftCount : item.rightCount;
        const nextVal = Math.max(0, current + delta);
        return {
          ...item,
          [side === 'left' ? 'leftCount' : 'rightCount']: nextVal
        };
      })
    );
  };

  const handleAddTechnique = () => {
    setLogs((prev) => [
      ...prev,
      {
        technique: selectedTech,
        category: 'kick',
        leftCount: 25,
        rightCount: 25,
        origin: 'MANUALLY ENTERED'
      }
    ]);
  };

  const handleRemove = (index: number) => {
    setLogs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSession = async () => {
    try {
      const load = calculateKineticLoad({
        roundsCompleted: logs.length * 2,
        activeWorkSeconds: logs.length * 300
      });

      const session: TrainingSession = {
        id: `tkd-${Date.now()}`,
        startedAt: Date.now() - logs.length * 300 * 1000,
        endedAt: Date.now(),
        type: 'taekwondo',
        title: 'Martial Arts Kicking Protocol',
        totalDurationSeconds: logs.length * 300,
        techniques: logs,
        kineticLoad: load.totalKineticLoad,
        origin: 'MANUALLY ENTERED'
      };

      await dbEngine.saveSession(session);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.error('Failed to save TKD session:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bilateral Balance & Volume Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#090b0f] border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">TOTAL STRIKES</span>
          <div className="font-mono-tech text-2xl font-bold text-white">
            {totalKicks} <span className="text-xs text-[#00ff87]">REPS</span>
          </div>
          <span className="text-[9px] font-mono-tech text-neutral-400">MANUALLY ENTERED</span>
        </div>

        <div className="p-4 rounded-xl bg-[#090b0f] border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">LEFT SIDE (LEAD)</span>
          <div className="font-mono-tech text-2xl font-bold text-[#38bdf8]">
            {totalLeft} <span className="text-xs text-neutral-400">REPS</span>
          </div>
          <span className="text-[9px] font-mono-tech text-neutral-400">STANCE A</span>
        </div>

        <div className="p-4 rounded-xl bg-[#090b0f] border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">RIGHT SIDE (REAR)</span>
          <div className="font-mono-tech text-2xl font-bold text-amber-400">
            {totalRight} <span className="text-xs text-neutral-400">REPS</span>
          </div>
          <span className="text-[9px] font-mono-tech text-neutral-400">STANCE B</span>
        </div>

        <div className="p-4 rounded-xl bg-[#090b0f] border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">BILATERAL SYMMETRY</span>
          <div className="font-mono-tech text-2xl font-bold text-white">
            {symmetryRatio}%
          </div>
          <span className="text-[9px] font-mono-tech text-neutral-400">
            {symmetryRatio >= 90 ? 'BALANCED' : 'IMBALANCE DETECTED'}
          </span>
        </div>
      </div>

      {/* Technique Log Rows */}
      <div className="space-y-3">
        {logs.map((item, idx) => (
          <div key={idx} className="equipment-panel rounded-xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00ff87]" />
                <h4 className="font-mono-tech font-bold text-sm sm:text-base text-white">
                  {item.technique}
                </h4>
              </div>
              <button
                onClick={() => handleRemove(idx)}
                className="text-neutral-400 hover:text-red-400 text-xs font-mono-tech"
              >
                REMOVE
              </button>
            </div>

            {/* Bilateral Rep Counters with Big Tap Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Side */}
              <div className="bg-[#090b0f] p-3.5 rounded-lg border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono-tech text-neutral-400 block">LEFT SIDE</span>
                  <span className="font-mono-tech text-2xl font-bold text-white">{item.leftCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleIncrement(idx, 'left', -5)}
                    className="w-10 h-10 rounded bg-white/5 hover:bg-white/10 border border-white/15 font-mono-tech text-xs text-neutral-300 flex items-center justify-center glove-button"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => handleIncrement(idx, 'left', 1)}
                    className="w-10 h-10 rounded bg-white/5 hover:bg-white/10 border border-white/15 font-mono-tech text-base font-bold text-white flex items-center justify-center glove-button"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleIncrement(idx, 'left', 5)}
                    className="w-10 h-10 rounded bg-[#38bdf8]/20 hover:bg-[#38bdf8]/30 border border-[#38bdf8]/40 font-mono-tech text-xs font-bold text-[#38bdf8] flex items-center justify-center glove-button"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Right Side */}
              <div className="bg-[#090b0f] p-3.5 rounded-lg border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono-tech text-neutral-400 block">RIGHT SIDE</span>
                  <span className="font-mono-tech text-2xl font-bold text-white">{item.rightCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleIncrement(idx, 'right', -5)}
                    className="w-10 h-10 rounded bg-white/5 hover:bg-white/10 border border-white/15 font-mono-tech text-xs text-neutral-300 flex items-center justify-center glove-button"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => handleIncrement(idx, 'right', 1)}
                    className="w-10 h-10 rounded bg-white/5 hover:bg-white/10 border border-white/15 font-mono-tech text-base font-bold text-white flex items-center justify-center glove-button"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleIncrement(idx, 'right', 5)}
                    className="w-10 h-10 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 font-mono-tech text-xs font-bold text-amber-300 flex items-center justify-center glove-button"
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add & Save Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="bg-[#090b0f] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono-tech text-white focus:border-[#00ff87] outline-none"
          >
            {TAEKWONDO_TECHNIQUES.map((t) => (
              <option key={t} value={t} className="bg-neutral-900">{t}</option>
            ))}
          </select>
          <button
            onClick={handleAddTechnique}
            className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-mono-tech text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            ADD DRILL
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {savedNotice && (
            <span className="text-xs font-mono-tech text-[#00ff87]">
              ✓ PERSISTED TO LOCAL STORAGE
            </span>
          )}
          <button
            onClick={handleSaveSession}
            className="px-5 py-2.5 rounded-lg bg-[#00ff87] hover:bg-[#00e578] text-black font-mono-tech font-bold text-xs tracking-wider flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            SAVE COMBAT DRILL
          </button>
        </div>
      </div>
    </div>
  );
};
