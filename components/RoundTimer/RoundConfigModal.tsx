'use client';

// KINETIC CORE - Round Configurator & Interval Preset Selector
// Highly configurable: rounds, work, rest, warning bell, countdown, prep duration.

import React, { useState } from 'react';
import { CustomTrainingPreset } from '@/types';
import { timerEngine } from '@/lib/timing/timerCoordinator';
import { DEFAULT_PRESETS, dbEngine } from '@/lib/storage/db';
import { Sliders, Check, Plus, Trash2 } from 'lucide-react';

interface RoundConfigModalProps {
  onStartWithConfig: (preset: CustomTrainingPreset) => void;
  onClose?: () => void;
}

export const RoundConfigModal: React.FC<RoundConfigModalProps> = ({
  onStartWithConfig,
  onClose
}) => {
  const [presets, setPresets] = useState<CustomTrainingPreset[]>(DEFAULT_PRESETS);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DEFAULT_PRESETS[1].id);

  // Custom configuration states
  const [roundsCount, setRoundsCount] = useState<number>(8);
  const [workSeconds, setWorkSeconds] = useState<number>(180);
  const [restSeconds, setRestSeconds] = useState<number>(30);
  const [warningSeconds, setWarningSeconds] = useState<number>(10);
  const [prepSeconds, setPrepSeconds] = useState<number>(10);
  const [customName, setCustomName] = useState<string>('Custom Interval');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  const handleSelectPreset = (p: CustomTrainingPreset) => {
    setSelectedPresetId(p.id);
    setRoundsCount(p.roundsCount);
    setWorkSeconds(p.roundDurationSeconds);
    setRestSeconds(p.restDurationSeconds);
    setWarningSeconds(p.warningDurationSeconds);
    setPrepSeconds(p.prepDurationSeconds);
  };

  const handleSaveAndStart = async () => {
    const currentPreset: CustomTrainingPreset = {
      id: selectedPresetId.startsWith('custom-') ? selectedPresetId : `custom-${Date.now()}`,
      name: customName || 'Custom Boxing Protocol',
      trainingType: 'boxing',
      roundsCount,
      roundDurationSeconds: workSeconds,
      restDurationSeconds: restSeconds,
      warningDurationSeconds: warningSeconds,
      prepDurationSeconds: prepSeconds,
      createdAt: Date.now()
    };

    if (isCreatingNew) {
      await dbEngine.savePreset(currentPreset);
      setPresets((prev) => [...prev, currentPreset]);
    }

    timerEngine.loadPreset(currentPreset);
    onStartWithConfig(currentPreset);
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="equipment-panel rounded-xl p-5 sm:p-6 max-w-3xl mx-auto w-full border border-white/15">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-[#00ff87]" />
          <h2 className="font-mono-tech text-base sm:text-lg font-bold text-white tracking-wider">
            INTERVAL PROTOCOL CONFIGURATOR
          </h2>
        </div>
        <span className="text-[11px] font-mono-tech px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400">
          COMBAT PRECISION
        </span>
      </div>

      {/* Preset Fast Selector Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono-tech text-neutral-400 tracking-wider">
            AUTHORITATIVE PRESETS
          </label>
          <button
            onClick={() => setIsCreatingNew(!isCreatingNew)}
            className="text-xs font-mono-tech text-[#00ff87] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {isCreatingNew ? 'USE PRESET' : 'NEW CUSTOM'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {presets.map((p) => {
            const isSelected = selectedPresetId === p.id && !isCreatingNew;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setIsCreatingNew(false);
                  handleSelectPreset(p);
                }}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-[#00ff87] bg-[#00ff87]/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech font-bold text-xs text-white line-clamp-1">
                    {p.name}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-[#00ff87]" />}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono-tech text-neutral-400">
                  <span>{p.roundsCount} ROUNDS</span>
                  <span>{formatSecs(p.roundDurationSeconds)} / {formatSecs(p.restDurationSeconds)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Granular Interval Sliders */}
      <div className="space-y-5 bg-[#090b0f] p-4 sm:p-5 rounded-lg border border-white/10 mb-6">
        {isCreatingNew && (
          <div>
            <label className="block text-xs font-mono-tech text-neutral-400 mb-1">
              PROTOCOL NAME
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded px-3 py-2 text-sm font-mono-tech text-white focus:border-[#00ff87] outline-none"
              placeholder="e.g., Heavy Sparring 5x3"
            />
          </div>
        )}

        {/* Number of Rounds */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono-tech mb-1.5">
            <span className="text-neutral-300">TOTAL ROUNDS</span>
            <span className="font-bold text-white text-sm">{roundsCount} ROUNDS</span>
          </div>
          <div className="flex gap-2">
            {[3, 5, 8, 10, 12].map((num) => (
              <button
                key={num}
                onClick={() => setRoundsCount(num)}
                className={`flex-1 py-1.5 rounded font-mono-tech text-xs border ${
                  roundsCount === num ? 'bg-[#00ff87] text-black font-bold border-[#00ff87]' : 'bg-white/5 border-white/10 text-neutral-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Round Length */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono-tech mb-1.5">
            <span className="text-neutral-300">ROUND DURATION (WORK)</span>
            <span className="font-bold text-[#00ff87] text-sm">{formatSecs(workSeconds)}</span>
          </div>
          <div className="flex gap-2">
            {[
              { label: '30s', sec: 30 },
              { label: '1m', sec: 60 },
              { label: '2m', sec: 120 },
              { label: '3m', sec: 180 },
              { label: '5m', sec: 300 }
            ].map(({ label, sec }) => (
              <button
                key={sec}
                onClick={() => setWorkSeconds(sec)}
                className={`flex-1 py-1.5 rounded font-mono-tech text-xs border ${
                  workSeconds === sec ? 'bg-[#00ff87] text-black font-bold border-[#00ff87]' : 'bg-white/5 border-white/10 text-neutral-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Rest Length */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono-tech mb-1.5">
            <span className="text-neutral-300">REST DURATION</span>
            <span className="font-bold text-[#38bdf8] text-sm">{formatSecs(restSeconds)}</span>
          </div>
          <div className="flex gap-2">
            {[
              { label: '0s', sec: 0 },
              { label: '15s', sec: 15 },
              { label: '30s', sec: 30 },
              { label: '45s', sec: 45 },
              { label: '60s', sec: 60 }
            ].map(({ label, sec }) => (
              <button
                key={sec}
                onClick={() => setRestSeconds(sec)}
                className={`flex-1 py-1.5 rounded font-mono-tech text-xs border ${
                  restSeconds === sec ? 'bg-[#38bdf8] text-black font-bold border-[#38bdf8]' : 'bg-white/5 border-white/10 text-neutral-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Warning and Prep */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10 text-xs font-mono-tech">
          <div>
            <span className="text-neutral-400 block mb-1">WARNING CLAPPER</span>
            <div className="flex gap-2">
              {[5, 10, 15].map((w) => (
                <button
                  key={w}
                  onClick={() => setWarningSeconds(w)}
                  className={`flex-1 py-1 rounded border text-[11px] ${
                    warningSeconds === w ? 'bg-amber-400 text-black font-bold border-amber-400' : 'bg-white/5 border-white/10 text-neutral-300'
                  }`}
                >
                  {w}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-neutral-400 block mb-1">START PREP DELAY</span>
            <div className="flex gap-2">
              {[0, 5, 10].map((p) => (
                <button
                  key={p}
                  onClick={() => setPrepSeconds(p)}
                  className={`flex-1 py-1 rounded border text-[11px] ${
                    prepSeconds === p ? 'bg-white text-black font-bold border-white' : 'bg-white/5 border-white/10 text-neutral-300'
                  }`}
                >
                  {p}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation CTA */}
      <div className="flex items-center justify-end gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded font-mono-tech text-xs text-neutral-400 hover:text-white"
          >
            CANCEL
          </button>
        )}
        <button
          onClick={handleSaveAndStart}
          className="px-6 py-3 rounded-lg bg-[#00ff87] hover:bg-[#00e578] text-black font-mono-tech font-bold text-xs tracking-wider transition-transform active:scale-95 shadow-lg"
        >
          ARM & LAUNCH CONSOLE →
        </button>
      </div>
    </div>
  );
};
