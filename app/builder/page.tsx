'use client';

// KINETIC CORE - Training Session Builder Page
// Construct and arrange multi-block custom sessions.

import React from 'react';
import { BlockTimeline } from '@/components/SessionBuilder/BlockTimeline';
import { Layers } from 'lucide-react';

export default function BuilderPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="equipment-panel rounded-2xl p-6 sm:p-8 border border-white/15">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono-tech text-purple-400 tracking-widest uppercase font-bold">
              MODULAR WORKOUT ARCHITECTURE
            </span>
            <h1 className="text-2xl sm:text-3xl font-mono-tech font-black text-white">
              CUSTOM SESSION BUILDER
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm font-mono-tech text-neutral-400 max-w-2xl leading-relaxed">
          Assemble complex workouts from modular blocks: Warmup, Shadow Boxing, Heavy Bag Rounds, Active Rest, and Cooldowns. Saved sessions immediately sync with the training console.
        </p>
      </div>

      <BlockTimeline />
    </div>
  );
}
