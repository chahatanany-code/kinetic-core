'use client';

// KINETIC CORE - Strength Training & Performance System
// Complete module: Set/Rep logging, live mechanical volume, 1RM calculators, progressive overload engine.

import React, { useState } from 'react';
import { Dumbbell, Calculator, TrendingUp } from 'lucide-react';
import { ExerciseLogger } from '@/components/SetTracker/ExerciseLogger';
import { OneRepMaxModal } from '@/components/StrengthCalculator/OneRepMaxModal';
import { ProgressionCalculator } from '@/components/StrengthCalculator/ProgressionCalculator';

type Tab = 'LOGGER' | 'ONEREPMAX' | 'PROGRESSION';

export default function StrengthPage() {
  const [activeTab, setActiveTab] = useState<Tab>('LOGGER');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="equipment-panel rounded-2xl p-6 sm:p-8 border border-white/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono-tech text-[#38bdf8] tracking-widest uppercase font-bold">
                RESISTANCE TELEMETRY
              </span>
              <h1 className="text-2xl sm:text-3xl font-mono-tech font-black text-white">
                STRENGTH OPERATING SYSTEM
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-tech px-2.5 py-1 rounded bg-white/5 border border-white/10 text-neutral-300">
              UNITS: METRIC (KG)
            </span>
            <span className="text-[10px] font-mono-tech px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300">
              ORIGIN: CALCULATED
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 mt-6 gap-2">
          <button
            onClick={() => setActiveTab('LOGGER')}
            className={`px-4 py-2.5 font-mono-tech text-xs font-bold tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'LOGGER'
                ? 'border-[#00ff87] text-[#00ff87]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>EXERCISE LOGGER & VOLUME</span>
          </button>

          <button
            onClick={() => setActiveTab('ONEREPMAX')}
            className={`px-4 py-2.5 font-mono-tech text-xs font-bold tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ONEREPMAX'
                ? 'border-[#38bdf8] text-[#38bdf8]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>1RM CALCULATOR</span>
          </button>

          <button
            onClick={() => setActiveTab('PROGRESSION')}
            className={`px-4 py-2.5 font-mono-tech text-xs font-bold tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'PROGRESSION'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>PROGRESSIVE OVERLOAD</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'LOGGER' && <ExerciseLogger />}
      {activeTab === 'ONEREPMAX' && <OneRepMaxModal />}
      {activeTab === 'PROGRESSION' && <ProgressionCalculator />}
    </div>
  );
}
