'use client';

// KINETIC CORE - Modular Training Session Builder
// Construct customized training timelines: Warmup, Shadow Boxing, Bag Work, Rest, Combos, Cooldown.

import React, { useState } from 'react';
import { TrainingBlock, CustomTrainingPreset } from '@/types';
import { dbEngine } from '@/lib/storage/db';
import { timerEngine } from '@/lib/timing/timerCoordinator';
import { Layers, Plus, Trash2, ArrowUp, ArrowDown, Play, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BLOCK_TYPES = [
  { type: 'WARMUP', label: 'Warmup & Mobility', color: '#fbbf24', defaultSec: 300 },
  { type: 'WORK', label: 'High Intensity Work', color: '#00ff87', defaultSec: 180 },
  { type: 'DRILL', label: 'Technical Drill / Shadow', color: '#38bdf8', defaultSec: 180 },
  { type: 'REST', label: 'Active Rest / Recovery', color: '#64748b', defaultSec: 30 },
  { type: 'COMBINATION', label: 'Heavy Bag Combinations', color: '#f43f5e', defaultSec: 180 },
  { type: 'COOLDOWN', label: 'Cooldown & Stretch', color: '#a855f7', defaultSec: 300 }
];

export const BlockTimeline: React.FC = () => {
  const router = useRouter();
  const [sessionTitle, setSessionTitle] = useState('Boxing — Conditioning Protocol');
  const [blocks, setBlocks] = useState<TrainingBlock[]>([
    { id: 'b1', title: '01 Jump Rope & Joint Prep', type: 'WARMUP', durationSeconds: 300 },
    { id: 'b2', title: '02 Shadow Boxing Cadence', type: 'DRILL', durationSeconds: 180 },
    { id: 'b3', title: '03 Corner Rest', type: 'REST', durationSeconds: 30 },
    { id: 'b4', title: '04 Heavy Bag Power Hooks', type: 'WORK', durationSeconds: 180 },
    { id: 'b5', title: '05 Corner Rest', type: 'REST', durationSeconds: 30 },
    { id: 'b6', title: '06 Combinations 1-2-3-2', type: 'COMBINATION', durationSeconds: 180 },
    { id: 'b7', title: '07 Cooldown & Downregulation', type: 'COOLDOWN', durationSeconds: 300 }
  ]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const totalSeconds = blocks.reduce((acc, b) => acc + b.durationSeconds, 0);
  const totalMins = Math.floor(totalSeconds / 60);

  const handleAddBlock = (typeObj: typeof BLOCK_TYPES[0]) => {
    const newB: TrainingBlock = {
      id: `block-${Date.now()}`,
      title: `${String(blocks.length + 1).padStart(2, '0')} ${typeObj.label}`,
      type: typeObj.type as any,
      durationSeconds: typeObj.defaultSec
    };
    setBlocks((prev) => [...prev, newB]);
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const copy = [...blocks];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setBlocks(copy);
  };

  const handleRemove = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleUpdateDuration = (id: string, deltaSec: number) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        return { ...b, durationSeconds: Math.max(10, b.durationSeconds + deltaSec) };
      })
    );
  };

  const handleSaveAndLaunch = async () => {
    const workBlocks = blocks.filter((b) => b.type !== 'REST');
    const restBlocks = blocks.filter((b) => b.type === 'REST');
    const avgWork = workBlocks.length > 0
      ? Math.round(workBlocks.reduce((a, c) => a + c.durationSeconds, 0) / workBlocks.length)
      : 180;
    const avgRest = restBlocks.length > 0
      ? Math.round(restBlocks.reduce((a, c) => a + c.durationSeconds, 0) / restBlocks.length)
      : 30;

    const preset: CustomTrainingPreset = {
      id: `builder-preset-${Date.now()}`,
      name: sessionTitle,
      trainingType: 'custom',
      roundsCount: Math.max(1, workBlocks.length),
      roundDurationSeconds: avgWork,
      restDurationSeconds: avgRest,
      warningDurationSeconds: 10,
      prepDurationSeconds: 10,
      blocks,
      createdAt: Date.now()
    };

    await dbEngine.savePreset(preset);
    timerEngine.loadPreset(preset);
    setSavedSuccess(true);
    setTimeout(() => {
      router.push('/train');
    }, 400);
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Session Title & Telemetry Header */}
      <div className="equipment-panel rounded-xl p-5 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">
            SESSION PROTOCOL TITLE
          </label>
          <input
            type="text"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/15 rounded px-3 py-2 font-mono-tech font-bold text-base sm:text-lg text-white focus:border-[#00ff87] outline-none"
          />
        </div>

        <div className="flex items-center gap-4 bg-[#090b0f] px-4 py-2.5 rounded-lg border border-white/10">
          <div>
            <span className="text-[10px] font-mono-tech text-neutral-400 block">TOTAL BLOCKS</span>
            <span className="font-mono-tech font-bold text-lg text-white">{blocks.length}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <span className="text-[10px] font-mono-tech text-neutral-400 block">TIMELINE DURATION</span>
            <span className="font-mono-tech font-bold text-lg text-[#00ff87]">{totalMins} MINS</span>
          </div>
        </div>
      </div>

      {/* Block Append Palette */}
      <div className="equipment-panel rounded-xl p-4 sm:p-5 border border-white/15">
        <span className="text-xs font-mono-tech text-neutral-400 block mb-2">
          APPEND NEW BLOCK TO TIMELINE
        </span>
        <div className="flex flex-wrap gap-2">
          {BLOCK_TYPES.map((bt) => (
            <button
              key={bt.type}
              onClick={() => handleAddBlock(bt)}
              className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 font-mono-tech text-xs text-white flex items-center gap-2 transition-all active:scale-95"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bt.color }} />
              <span>{bt.label}</span>
              <span className="text-[10px] text-neutral-400">+{formatSecs(bt.defaultSec)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Blocks List */}
      <div className="space-y-2.5">
        {blocks.map((block, idx) => {
          const typeMeta = BLOCK_TYPES.find((t) => t.type === block.type) || BLOCK_TYPES[1];
          return (
            <div
              key={block.id}
              className="equipment-panel rounded-xl p-3.5 sm:p-4 border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-8 rounded-full" style={{ backgroundColor: typeMeta.color }} />
                <div>
                  <div className="font-mono-tech font-bold text-xs sm:text-sm text-white">
                    {block.title}
                  </div>
                  <div className="text-[10px] font-mono-tech text-neutral-400 flex items-center gap-2 mt-0.5">
                    <span className="uppercase" style={{ color: typeMeta.color }}>{block.type}</span>
                    <span>•</span>
                    <span>{formatSecs(block.durationSeconds)}</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#090b0f] px-2 py-1 rounded border border-white/10 font-mono-tech text-xs">
                  <button
                    onClick={() => handleUpdateDuration(block.id, -15)}
                    className="px-1 text-neutral-400 hover:text-white"
                  >
                    -15s
                  </button>
                  <span className="px-1 text-white font-bold">{formatSecs(block.durationSeconds)}</span>
                  <button
                    onClick={() => handleUpdateDuration(block.id, 15)}
                    className="px-1 text-neutral-400 hover:text-white"
                  >
                    +15s
                  </button>
                </div>

                <div className="flex items-center">
                  <button
                    onClick={() => handleMove(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 1)}
                    disabled={idx === blocks.length - 1}
                    className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(block.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-400"
                    title="Delete Block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
        {savedSuccess && (
          <span className="text-xs font-mono-tech text-[#00ff87]">
            ✓ PROTOCOL LOADED INTO TRAINING CONSOLE
          </span>
        )}
        <button
          onClick={handleSaveAndLaunch}
          className="px-6 py-3 rounded-lg bg-[#00ff87] hover:bg-[#00e578] text-black font-mono-tech font-bold text-xs tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95"
        >
          <Play className="w-4 h-4 fill-current" />
          LAUNCH SESSION IN CONSOLE →
        </button>
      </div>
    </div>
  );
};
