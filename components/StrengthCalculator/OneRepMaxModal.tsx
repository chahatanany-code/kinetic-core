'use client';

// KINETIC CORE - 1RM Calculator Console
// Displays Epley, Brzycki, Lombardi, and Mayhew with mathematical transparency.
// Strict labeling: ESTIMATED 1RM (CALCULATED).

import React, { useState } from 'react';
import { calculate1RM, FORMULA_METADATA, compareAllFormulas } from '@/lib/calculations/oneRepMax';
import { OneRepMaxFormula } from '@/types';
import { Calculator, Award, Info } from 'lucide-react';

export const OneRepMaxModal: React.FC = () => {
  const [weight, setWeight] = useState<number>(100);
  const [reps, setReps] = useState<number>(8);
  const [formula, setFormula] = useState<OneRepMaxFormula>('epley');

  const result = calculate1RM(weight, reps, formula);
  const allComparisons = compareAllFormulas(weight, reps);

  return (
    <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <Calculator className="w-5 h-5 text-[#38bdf8]" />
          <h3 className="font-mono-tech font-bold text-base sm:text-lg text-white tracking-wider">
            1-REP MAX (1RM) ESTIMATION ENGINE
          </h3>
        </div>
        <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300">
          CALCULATED
        </span>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#090b0f] p-3.5 rounded-lg border border-white/10">
          <label className="text-[11px] font-mono-tech text-neutral-400 block mb-1">
            WEIGHT LIFTED (KG)
          </label>
          <input
            type="number"
            value={weight || ''}
            onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
            className="w-full bg-white/5 border border-white/15 rounded px-3 py-2 text-xl font-mono-tech font-bold text-white focus:border-[#38bdf8] outline-none"
            min={1}
            max={600}
          />
        </div>

        <div className="bg-[#090b0f] p-3.5 rounded-lg border border-white/10">
          <label className="text-[11px] font-mono-tech text-neutral-400 block mb-1">
            REPETITIONS COMPLETED
          </label>
          <input
            type="number"
            value={reps || ''}
            onChange={(e) => setReps(parseInt(e.target.value, 10) || 1)}
            className="w-full bg-white/5 border border-white/15 rounded px-3 py-2 text-xl font-mono-tech font-bold text-white focus:border-[#38bdf8] outline-none"
            min={1}
            max={36}
          />
        </div>
      </div>

      {/* Formula Selector Tabs */}
      <div className="mb-6">
        <label className="text-[11px] font-mono-tech text-neutral-400 block mb-2">
          SELECT SCIENTIFIC FORMULA
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['epley', 'brzycki', 'lombardi', 'mayhew'] as OneRepMaxFormula[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormula(f)}
              className={`p-2 rounded text-left border transition-all ${
                formula === f
                  ? 'border-[#38bdf8] bg-[#38bdf8]/15 text-white font-bold'
                  : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="font-mono-tech text-xs uppercase">{f}</div>
              <div className="font-mono-tech text-[10px] text-neutral-400 mt-0.5">
                {allComparisons[f]} kg
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Primary 1RM Output Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 to-slate-900/60 p-5 rounded-xl border border-blue-500/30 text-center mb-6">
        <span className="text-[11px] font-mono-tech text-blue-300 tracking-widest uppercase block mb-1">
          ESTIMATED 1RM [{FORMULA_METADATA[formula].name.toUpperCase()}]
        </span>
        <div className="font-mono-tech font-extrabold text-5xl sm:text-6xl text-white tracking-tight">
          {result.estimated1RM} <span className="text-2xl text-blue-400">KG</span>
        </div>
        <div className="mt-2 text-xs font-mono-tech text-neutral-300 flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>Formula: {result.formulaEquation}</span>
        </div>
        <div className="mt-1 text-[11px] font-mono-tech text-neutral-400 italic">
          {result.formulaDescription}
        </div>
      </div>

      {/* Repetition Percentage Breakdown Matrix */}
      <div>
        <h4 className="text-xs font-mono-tech text-neutral-400 tracking-wider mb-2">
          TRAINING LOADS BY 1RM PERCENTAGE
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center font-mono-tech">
          {result.percentageTable.slice(0, 5).map((row) => (
            <div key={row.percentage} className="p-2 rounded bg-white/5 border border-white/10">
              <span className="text-[10px] text-neutral-400 block">{row.percentage}%</span>
              <span className="text-sm font-bold text-white block mt-0.5">{row.weight} kg</span>
              <span className="text-[10px] text-emerald-400 block">~{row.targetRepsEstimate} reps</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
