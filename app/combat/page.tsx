'use client';

// KINETIC CORE - Combat Lab & Striking Module
// Boxing combination sequence generator & Taekwondo kick symmetry tracker.

import React, { useState } from 'react';
import { Shield, Zap } from 'lucide-react';
import { CombinationRecorder } from '@/components/CombatLab/CombinationRecorder';
import { TaekwondoDrillTracker } from '@/components/CombatLab/TaekwondoDrillTracker';

type CombatTab = 'COMBOS' | 'TAEKWONDO';

export default function CombatPage() {
  const [activeTab, setActiveTab] = useState<CombatTab>('COMBOS');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="equipment-panel rounded-2xl p-6 sm:p-8 border border-white/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00ff87]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono-tech text-[#00ff87] tracking-widest uppercase font-bold">
                COMBAT & STRIKING CADENCE
              </span>
              <h1 className="text-2xl sm:text-3xl font-mono-tech font-black text-white">
                COMBINATION LAB & MARTIAL DRILLS
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-tech px-2.5 py-1 rounded bg-white/5 border border-white/10 text-neutral-300">
              STRIKE SEQUENCER
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-white/10 mt-6 gap-2">
          <button
            onClick={() => setActiveTab('COMBOS')}
            className={`px-4 py-2.5 font-mono-tech text-xs font-bold tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'COMBOS'
                ? 'border-[#00ff87] text-[#00ff87]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>BOXING COMBINATIONS (1-2-3-2)</span>
          </button>

          <button
            onClick={() => setActiveTab('TAEKWONDO')}
            className={`px-4 py-2.5 font-mono-tech text-xs font-bold tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'TAEKWONDO'
                ? 'border-[#38bdf8] text-[#38bdf8]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>TAEKWONDO & BILATERAL KICKS</span>
          </button>
        </div>
      </div>

      {activeTab === 'COMBOS' && <CombinationRecorder />}
      {activeTab === 'TAEKWONDO' && <TaekwondoDrillTracker />}
    </div>
  );
}
