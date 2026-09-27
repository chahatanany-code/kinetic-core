'use client';

// KINETIC CORE - Boxing Combination Lab
// Build, visualize, and practice punch sequences (1=Jab, 2=Cross, 3=Lead Hook, 4=Rear Hook, 5=Lead Uppercut, 6=Rear Uppercut).

import React, { useState, useEffect } from 'react';
import { CombatCombination } from '@/types';
import { dbEngine, DEFAULT_COMBINATIONS } from '@/lib/storage/db';
import { soundEngine } from '@/lib/audio/soundSynthesizer';
import { Shield, Plus, Play, Trash2, CheckCircle2 } from 'lucide-react';

const STANDARD_STRIKES = [
  { code: '1', name: 'Jab (Lead)', type: 'punch' },
  { code: '2', name: 'Cross (Rear)', type: 'punch' },
  { code: '3', name: 'Lead Hook', type: 'punch' },
  { code: '4', name: 'Rear Hook', type: 'punch' },
  { code: '5', name: 'Lead Uppercut', type: 'punch' },
  { code: '6', name: 'Rear Uppercut', type: 'punch' },
  { code: '3B', name: 'Lead Hook (Body)', type: 'body' },
  { code: 'SLIP', name: 'Slip / Roll', type: 'defense' },
  { code: '4K', name: 'Rear Low Kick', type: 'kick' }
];

export const CombinationRecorder: React.FC = () => {
  const [combinations, setCombinations] = useState<CombatCombination[]>(DEFAULT_COMBINATIONS);
  const [activeComboId, setActiveComboId] = useState<string>(DEFAULT_COMBINATIONS[2].id);
  const [sequenceIndex, setSequenceIndex] = useState<number>(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);

  // New combo creation
  const [newComboName, setNewComboName] = useState('');
  const [newSequence, setNewSequence] = useState<string[]>([]);

  useEffect(() => {
    dbEngine.getCombinations().then((res) => {
      if (res && res.length > 0) setCombinations(res);
    });
  }, []);

  const activeCombo = combinations.find((c) => c.id === activeComboId) || combinations[0];

  // Visual cadence sequence player
  useEffect(() => {
    if (!isPlayingSequence || !activeCombo) return;
    const interval = setInterval(() => {
      setSequenceIndex((prev) => {
        soundEngine.playButtonTap();
        if (prev + 1 >= activeCombo.sequence.length) {
          setIsPlayingSequence(false);
          return 0;
        }
        return prev + 1;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isPlayingSequence, activeCombo]);

  const handleStartCadence = () => {
    setSequenceIndex(0);
    setIsPlayingSequence(true);
    soundEngine.playRoundStart();
  };

  const handleAppendStrike = (code: string) => {
    soundEngine.playButtonTap();
    setNewSequence((prev) => [...prev, code]);
  };

  const handleSaveCombo = async () => {
    if (newSequence.length === 0) return;
    const combo: CombatCombination = {
      id: `combo-${Date.now()}`,
      name: newComboName || `Combo: ${newSequence.join(' - ')}`,
      notation: newSequence.join(' - '),
      sequence: newSequence,
      category: 'boxing'
    };

    await dbEngine.saveCombination(combo);
    setCombinations((prev) => [...prev, combo]);
    setActiveComboId(combo.id);
    setNewComboName('');
    setNewSequence([]);
  };

  const handleDeleteCombo = async (id: string) => {
    await dbEngine.deleteCombination(id);
    setCombinations((prev) => prev.filter((c) => c.id !== id));
    if (activeComboId === id && combinations.length > 1) {
      setActiveComboId(combinations[0].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Sequence Visualizer */}
      {activeCombo && (
        <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#00ff87]" />
              <h3 className="font-mono-tech font-bold text-base sm:text-lg text-white">
                {activeCombo.name}
              </h3>
            </div>
            <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400">
              SEQUENCE LAB
            </span>
          </div>

          {/* Sequence Visual Blocks */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 my-6">
            {activeCombo.sequence.map((strike, idx) => {
              const isCurrent = isPlayingSequence && sequenceIndex === idx;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-[#00ff87] text-black border-[#00ff87] scale-110 shadow-[0_0_20px_rgba(0,255,135,0.6)] font-extrabold'
                        : 'bg-[#090b0f] border-white/15 text-white'
                    }`}
                  >
                    <span className="text-[10px] font-mono-tech text-neutral-400">STEP {idx + 1}</span>
                    <span className="text-xl sm:text-2xl font-mono-tech font-bold">{strike}</span>
                  </div>
                  {idx < activeCombo.sequence.length - 1 && (
                    <span className="text-neutral-500 font-mono-tech text-lg">→</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cadence Playback Controller */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleStartCadence}
              disabled={isPlayingSequence}
              className="px-5 py-2.5 rounded-lg bg-[#00ff87] hover:bg-[#00e578] disabled:opacity-50 text-black font-mono-tech font-bold text-xs tracking-wider flex items-center gap-2 shadow-md transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              {isPlayingSequence ? 'PLAYING CADENCE...' : 'TEST CADENCE AUDIO / VISUAL'}
            </button>
          </div>
        </div>
      )}

      {/* Preset Combo Shelf */}
      <div className="equipment-panel rounded-xl p-5 border border-white/15">
        <h4 className="font-mono-tech font-bold text-xs text-neutral-400 tracking-wider mb-3">
          SAVED COMBAT COMBINATIONS
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {combinations.map((c) => {
            const isSelected = activeComboId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => {
                  soundEngine.playButtonTap();
                  setActiveComboId(c.id);
                  setSequenceIndex(0);
                  setIsPlayingSequence(false);
                }}
                className={`p-3.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-[#00ff87] bg-[#00ff87]/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="font-mono-tech font-bold text-xs text-white">{c.name}</div>
                  <div className="font-mono-tech text-[11px] text-[#00ff87] mt-1">{c.notation}</div>
                </div>
                {combinations.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCombo(c.id);
                    }}
                    className="text-neutral-400 hover:text-red-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Combo Builder */}
      <div className="equipment-panel rounded-xl p-5 border border-white/15">
        <h4 className="font-mono-tech font-bold text-xs text-neutral-400 tracking-wider mb-3">
          CREATE CUSTOM SEQUENCE
        </h4>

        {/* Rapid Strike Buttons Pad */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
          {STANDARD_STRIKES.map((s) => (
            <button
              key={s.code}
              onClick={() => handleAppendStrike(s.code)}
              className="p-2.5 rounded bg-white/5 hover:bg-white/10 border border-white/15 text-left transition-all active:scale-95"
            >
              <div className="font-mono-tech font-bold text-sm text-[#00ff87]">{s.code}</div>
              <div className="text-[10px] font-mono-tech text-neutral-300 truncate">{s.name}</div>
            </button>
          ))}
        </div>

        {/* Current Working Sequence Draft */}
        <div className="bg-[#090b0f] p-3.5 rounded-lg border border-white/10 flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[10px] font-mono-tech text-neutral-400">DRAFT:</span>
            {newSequence.length === 0 ? (
              <span className="text-xs font-mono-tech text-neutral-400 italic">Click strikes above to build combo</span>
            ) : (
              newSequence.map((str, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-white/10 border border-white/20 font-mono-tech font-bold text-xs text-white"
                >
                  {str}
                </span>
              ))
            )}
          </div>
          {newSequence.length > 0 && (
            <button
              onClick={() => setNewSequence([])}
              className="text-[11px] font-mono-tech text-neutral-400 hover:text-white"
            >
              CLEAR
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newComboName}
            onChange={(e) => setNewComboName(e.target.value)}
            placeholder="Combination Title (e.g. Counter Right Hand Hook)"
            className="flex-1 bg-white/5 border border-white/15 rounded px-3 py-2 text-xs font-mono-tech text-white focus:border-[#00ff87] outline-none"
          />
          <button
            onClick={handleSaveCombo}
            disabled={newSequence.length === 0}
            className="px-4 py-2 rounded bg-white/10 hover:bg-white/15 border border-white/20 disabled:opacity-40 text-white font-mono-tech text-xs font-bold tracking-wider flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            SAVE COMBINATION
          </button>
        </div>
      </div>
    </div>
  );
};
