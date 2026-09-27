'use client';

// KINETIC CORE - Progressive Overload Engine Component
// Generates algorithmic progression recommendations based on athlete performance and RPE.

import React, { useState } from 'react';
import { calculateProgressiveOverload } from '@/lib/calculations/progressiveOverload';
import { TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

export const ProgressionCalculator: React.FC = () => {
  const [currentWeight, setCurrentWeight] = useState<number>(100);
  const [currentReps, setCurrentReps] = useState<number>(8);
  const [targetReps, setTargetReps] = useState<number>(8);
  const [targetSets, setTargetSets] = useState<number>(3);
  const [rpe, setRpe] = useState<number>(8);
  const [microload, setMicroload] = useState<number>(2.5);

  const suggestion = calculateProgressiveOverload({
    currentWeight,
    currentReps,
    targetReps,
    targetSets,
    rpe,
    microloadIncrement: microload
  });

  return (
    <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-[#00ff87]" />
          <h3 className="font-mono-tech font-bold text-base sm:text-lg text-white tracking-wider">
            PROGRESSIVE OVERLOAD CALCULATOR
          </h3>
        </div>
        <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
          ALGORITHMIC
        </span>
      </div>

      {/* Grid of Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-[#090b0f] p-3 rounded-lg border border-white/10">
          <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">CURRENT LOAD (KG)</label>
          <input
            type="number"
            value={currentWeight || ''}
            onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 0)}
            className="w-full bg-white/5 border border-white/15 rounded px-2.5 py-1.5 text-base font-mono-tech font-bold text-white focus:border-[#00ff87] outline-none"
          />
        </div>

        <div className="bg-[#090b0f] p-3 rounded-lg border border-white/10">
          <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">REPS COMPLETED</label>
          <input
            type="number"
            value={currentReps || ''}
            onChange={(e) => setCurrentReps(parseInt(e.target.value, 10) || 0)}
            className="w-full bg-white/5 border border-white/15 rounded px-2.5 py-1.5 text-base font-mono-tech font-bold text-white focus:border-[#00ff87] outline-none"
          />
        </div>

        <div className="bg-[#090b0f] p-3 rounded-lg border border-white/10">
          <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">TARGET REPS</label>
          <input
            type="number"
            value={targetReps || ''}
            onChange={(e) => setTargetReps(parseInt(e.target.value, 10) || 0)}
            className="w-full bg-white/5 border border-white/15 rounded px-2.5 py-1.5 text-base font-mono-tech font-bold text-white focus:border-[#00ff87] outline-none"
          />
        </div>

        <div className="bg-[#090b0f] p-3 rounded-lg border border-white/10">
          <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">RATE OF PERCEIVED EXERTION (RPE)</label>
          <select
            value={rpe}
            onChange={(e) => setRpe(parseFloat(e.target.value))}
            className="w-full bg-white/5 border border-white/15 rounded px-2 py-1.5 text-sm font-mono-tech font-bold text-white focus:border-[#00ff87] outline-none"
          >
            {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((v) => (
              <option key={v} value={v} className="bg-neutral-900">
                {v} ({v >= 9.5 ? 'Maximum Exertion' : v >= 8 ? 'Challenging' : 'Moderate'})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#090b0f] p-3 rounded-lg border border-white/10">
          <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">MICROLOAD STEP (KG)</label>
          <select
            value={microload}
            onChange={(e) => setMicroload(parseFloat(e.target.value))}
            className="w-full bg-white/5 border border-white/15 rounded px-2 py-1.5 text-sm font-mono-tech font-bold text-white focus:border-[#00ff87] outline-none"
          >
            <option value={1.25} className="bg-neutral-900">+1.25 kg (Upper Body / Dumbbell)</option>
            <option value={2.5} className="bg-neutral-900">+2.5 kg (Standard Barbell)</option>
            <option value={5.0} className="bg-neutral-900">+5.0 kg (Squat / Deadlift)</option>
          </select>
        </div>

        <div className="bg-[#090b0f] p-3 rounded-lg border border-white/10">
          <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">WORKING SETS</label>
          <input
            type="number"
            value={targetSets}
            onChange={(e) => setTargetSets(parseInt(e.target.value, 10) || 1)}
            className="w-full bg-white/5 border border-white/15 rounded px-2.5 py-1.5 text-base font-mono-tech font-bold text-white focus:border-[#00ff87] outline-none"
          />
        </div>
      </div>

      {/* Suggested Progression Card */}
      <div className={`p-4 sm:p-5 rounded-xl border ${
        suggestion.action === 'INCREASE_LOAD'
          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
          : suggestion.action === 'INCREASE_REPS'
          ? 'bg-blue-950/30 border-blue-500/40 text-blue-100'
          : suggestion.action === 'DELOAD_FATIGUE'
          ? 'bg-amber-950/30 border-amber-500/40 text-amber-100'
          : 'bg-slate-900/50 border-slate-700 text-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {suggestion.action === 'INCREASE_LOAD' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {suggestion.action === 'DELOAD_FATIGUE' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            <span className="font-mono-tech font-bold text-xs tracking-wider uppercase">
              SUGGESTED ACTION: {suggestion.action.replace(/_/g, ' ')}
            </span>
          </div>
          {suggestion.projectedVolumeGainKg > 0 && (
            <span className="text-[11px] font-mono-tech text-emerald-300">
              +{suggestion.projectedVolumeGainKg} kg Projected Volume
            </span>
          )}
        </div>

        {/* Before -> After Visual */}
        <div className="flex items-center justify-around py-3 px-4 rounded bg-black/40 border border-white/10 mb-3 font-mono-tech">
          <div className="text-center">
            <span className="text-[10px] text-neutral-400 block">CURRENT</span>
            <span className="text-base font-bold text-neutral-300">{currentWeight} KG × {currentReps}</span>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-500" />
          <div className="text-center">
            <span className="text-[10px] text-emerald-400 block font-bold">NEXT TARGET</span>
            <span className="text-lg font-extrabold text-white">
              {suggestion.suggestedWeight} KG × {suggestion.suggestedReps}
            </span>
            <span className="text-[10px] text-neutral-400 block">({suggestion.suggestedSets} SETS)</span>
          </div>
        </div>

        <p className="text-xs font-mono-tech text-neutral-300 leading-relaxed mb-2">
          {suggestion.rationale}
        </p>
        <p className="text-[11px] font-mono-tech text-neutral-400 italic">
          {suggestion.fatigueRiskNotice}
        </p>
      </div>
    </div>
  );
};
