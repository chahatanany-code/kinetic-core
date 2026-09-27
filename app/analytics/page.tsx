'use client';

// KINETIC CORE - Long-term Athlete Analytics Dashboard
// Authoritative telemetry: Kinetic Graphs, Kinetic Load, Anatomic Movement Map, Personal Records.

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Award,
  Flame,
  Dumbbell,
  Timer,
  Shield,
  Layers,
  Info
} from 'lucide-react';
import { dbEngine } from '@/lib/storage/db';
import { aggregateAthleteMetrics, extractPersonalRecords, AthleteSummaryMetrics } from '@/lib/analytics/statsAggregator';
import { TrainingSession, PersonalRecord } from '@/types';
import { VolumeOverTimeChart } from '@/components/KineticGraph/VolumeOverTimeChart';
import { SilhouetteMap } from '@/components/BodyMovementMap/SilhouetteMap';

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [metrics, setMetrics] = useState<AthleteSummaryMetrics | null>(null);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dbEngine.getSessions().then((res) => {
      setSessions(res);
      setMetrics(aggregateAthleteMetrics(res));
      setRecords(extractPersonalRecords(res));
      setIsLoading(false);
    });
  }, []);

  // Compute accumulated muscle group loads for Silhouette map
  const zoneLoads: Record<string, number> = {};
  sessions.forEach((s) => {
    if (s.exercises) {
      s.exercises.forEach((ex) => {
        const vol = ex.sets.reduce((acc, set) => acc + (set.completed ? (set.weight || 0) * (set.reps || 0) : 0), 0);
        ex.muscleGroups.forEach((mg) => {
          zoneLoads[mg] = (zoneLoads[mg] || 0) + vol;
        });
      });
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="equipment-panel rounded-2xl p-6 sm:p-8 border border-white/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00ff87]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono-tech text-[#00ff87] tracking-widest uppercase font-bold">
                PERFORMANCE LAB TELEMETRY
              </span>
              <h1 className="text-2xl sm:text-3xl font-mono-tech font-black text-white">
                ATHLETE ANALYTICS
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-tech text-neutral-400">
            <span>DATABASE: LOCAL INDEXEDDB</span>
            <span>•</span>
            <span className="text-[#00ff87]">{sessions.length} SESSIONS</span>
          </div>
        </div>

        {/* Global KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 font-mono-tech">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] text-neutral-400 block mb-0.5">CUMULATIVE LOAD</span>
            <div className="text-xl font-bold text-[#00ff87]">
              {metrics ? metrics.totalKineticLoad.toLocaleString() : 0}
            </div>
            <span className="text-[9px] text-neutral-400">KINETIC STRESS INDEX</span>
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] text-neutral-400 block mb-0.5">TOTAL VOLUME</span>
            <div className="text-xl font-bold text-white">
              {metrics ? `${metrics.totalVolumeKg.toLocaleString()} KG` : '0 KG'}
            </div>
            <span className="text-[9px] text-neutral-400">Σ(WEIGHT × REPS)</span>
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] text-neutral-400 block mb-0.5">TOTAL ROUNDS</span>
            <div className="text-xl font-bold text-[#38bdf8]">
              {metrics ? metrics.roundsCompleted : 0}
            </div>
            <span className="text-[9px] text-neutral-400">COMBAT INTERVALS</span>
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] text-neutral-400 block mb-0.5">BEST STREAK</span>
            <div className="text-xl font-bold text-amber-400">
              {metrics ? `${metrics.longestStreakDays} DAYS` : '0 DAYS'}
            </div>
            <span className="text-[9px] text-neutral-400">HISTORICAL BEST</span>
          </div>
        </div>
      </div>

      {sessions.length === 0 && !isLoading ? (
        <div className="equipment-panel rounded-2xl p-12 text-center border border-white/15 space-y-4">
          <Activity className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="font-mono-tech font-bold text-lg text-white">
            NO TRAINING DATA RECORDED YET
          </h3>
          <p className="font-mono-tech text-xs text-neutral-400 max-w-md mx-auto">
            KINETIC CORE strictly analyzes authentic recorded workouts. Start your first combat interval round or strength workout to generate analytics.
          </p>
          <Link
            href="/train"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00ff87] text-black font-mono-tech font-bold text-xs"
          >
            <Flame className="w-4 h-4 fill-current" />
            <span>START FIRST TRAINING SESSION →</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Kinetic Volume Progression Chart */}
          <VolumeOverTimeChart />

          {/* Anatomic Silhouette Movement Map */}
          <SilhouetteMap zoneLoads={zoneLoads} />

          {/* Personal Records Table */}
          <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-mono-tech font-bold text-base text-white tracking-wider">
                  AUTHENTIC PERSONAL RECORDS
                </h3>
              </div>
              <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                PROVEN BENCHMARKS
              </span>
            </div>

            {records.length === 0 ? (
              <p className="text-xs font-mono-tech text-neutral-400 italic">
                Complete more sessions to establish historical personal bests.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {records.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl bg-[#090b0f] border border-white/10 font-mono-tech">
                    <span className="text-[10px] text-neutral-400 block mb-1 uppercase tracking-wider">
                      {r.category} // {r.metric}
                    </span>
                    <div className="text-xl font-bold text-white mb-1">
                      {r.value} <span className="text-xs text-neutral-400 font-normal">{r.unit}</span>
                    </div>
                    <span className="text-[9px] text-[#00ff87] block">
                      Achieved: {new Date(r.achievedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
