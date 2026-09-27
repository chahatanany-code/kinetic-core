'use client';

// KINETIC CORE - Activity Heatmap Matrix
// GitHub-style training frequency grid visualizing authenticated sessions and daily load.

import React, { useState } from 'react';
import { TrainingSession } from '@/types';
import { generateTrainingHeatmap, HeatmapDay } from '@/lib/analytics/heatmapData';
import { Calendar, Flame, Clock, Award } from 'lucide-react';

interface ActivityGridProps {
  sessions: TrainingSession[];
}

export const ActivityGrid: React.FC<ActivityGridProps> = ({ sessions }) => {
  const days = generateTrainingHeatmap(sessions, 18);
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(days[days.length - 1] || null);

  const getCellColor = (intensity: number) => {
    switch (intensity) {
      case 4: return 'bg-[#00ff87] border-[#00ff87] shadow-[0_0_8px_rgba(0,255,135,0.7)]';
      case 3: return 'bg-[#00d270] border-[#00d270]';
      case 2: return 'bg-[#059669] border-[#059669]';
      case 1: return 'bg-[#065f46] border-[#065f46]';
      default: return 'bg-white/5 border-white/5 hover:border-white/20';
    }
  };

  return (
    <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15 space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#00ff87]" />
          <h3 className="font-mono-tech font-bold text-base text-white tracking-wider">
            TRAINING FREQUENCY CALENDAR
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono-tech text-neutral-400">
          <span>LESS</span>
          <span className="w-2.5 h-2.5 rounded bg-white/5" />
          <span className="w-2.5 h-2.5 rounded bg-[#065f46]" />
          <span className="w-2.5 h-2.5 rounded bg-[#059669]" />
          <span className="w-2.5 h-2.5 rounded bg-[#00d270]" />
          <span className="w-2.5 h-2.5 rounded bg-[#00ff87]" />
          <span>MORE</span>
        </div>
      </div>

      {/* Heatmap Grid Matrix */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 p-2 bg-[#090b0f] rounded-lg border border-white/10">
          {days.map((day) => {
            const isSelected = selectedDay?.dateString === day.dateString;
            return (
              <button
                key={day.dateString}
                onClick={() => setSelectedDay(day)}
                title={`${day.dateString}: ${day.sessionCount} sessions (${day.totalDurationMinutes} mins)`}
                className={`w-3.5 h-3.5 rounded-sm border transition-all ${getCellColor(day.intensity)} ${
                  isSelected ? 'ring-2 ring-white scale-125 z-10' : ''
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Selected Day Inspector */}
      {selectedDay && (
        <div className="bg-[#090b0f] p-4 sm:p-5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <span className="font-mono-tech font-bold text-sm text-white">
              {selectedDay.displayDate} // {selectedDay.dateString}
            </span>
            <span className="text-xs font-mono-tech text-[#00ff87]">
              {selectedDay.sessionCount > 0 ? `${selectedDay.sessionCount} SESSION(S)` : 'REST DAY'}
            </span>
          </div>

          {selectedDay.sessionCount > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono-tech text-neutral-400 block">TRAINING TIME</span>
                <span className="font-mono-tech text-lg font-bold text-white">
                  {selectedDay.totalDurationMinutes} MINS
                </span>
              </div>
              <div className="p-3 rounded bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono-tech text-neutral-400 block">COMBAT ROUNDS</span>
                <span className="font-mono-tech text-lg font-bold text-[#38bdf8]">
                  {selectedDay.roundsCount} ROUNDS
                </span>
              </div>
              <div className="p-3 rounded bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono-tech text-neutral-400 block">COMPLETED SETS</span>
                <span className="font-mono-tech text-lg font-bold text-neutral-200">
                  {selectedDay.setsCount} SETS
                </span>
              </div>
              <div className="p-3 rounded bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono-tech text-neutral-400 block">KINETIC LOAD</span>
                <span className="font-mono-tech text-lg font-bold text-amber-400">
                  {selectedDay.kineticLoad}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs font-mono-tech text-neutral-400">
              No active training logged for this calendar day. Physiological rest and recovery.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
