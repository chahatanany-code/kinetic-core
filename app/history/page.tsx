'use client';

// KINETIC CORE - Training History, Heatmap, & Sovereign Data Management
// Complete chronological session log, interactive calendar heatmap, and JSON/CSV backup utilities.

import React, { useState, useEffect } from 'react';
import { dbEngine } from '@/lib/storage/db';
import { TrainingSession } from '@/types';
import { ActivityGrid } from '@/components/TrainingHeatmap/ActivityGrid';
import { exportDataAsJSON, exportSessionsAsCSV, importDataFromFile } from '@/lib/storage/exportImport';
import {
  History,
  Download,
  Upload,
  Trash2,
  Calendar,
  Flame,
  Dumbbell,
  Timer,
  Shield,
  Layers,
  Check,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadSessions = () => {
    dbEngine.getSessions().then((res) => {
      setSessions(res);
    });
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDeleteSession = async (id: string) => {
    if (confirm('Permanently delete this session record from local IndexedDB?')) {
      await dbEngine.deleteSession(id);
      loadSessions();
      setStatusMsg('Session removed.');
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await importDataFromFile(file);
      setStatusMsg(`Successfully imported ${res.count} sessions.`);
      loadSessions();
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="equipment-panel rounded-2xl p-6 sm:p-8 border border-white/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center text-[#00ff87]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono-tech text-[#00ff87] tracking-widest uppercase font-bold">
                AUDITED LOGS
              </span>
              <h1 className="text-2xl sm:text-3xl font-mono-tech font-black text-white">
                TRAINING ARCHIVE & CALENDAR
              </h1>
            </div>
          </div>

          {/* Sovereign Export / Import Toolbar */}
          <div className="flex flex-wrap items-center gap-2 font-mono-tech text-xs">
            <button
              onClick={() => exportDataAsJSON()}
              className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#00ff87]" />
              <span>EXPORT JSON</span>
            </button>

            <button
              onClick={() => exportSessionsAsCSV()}
              className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>EXPORT CSV</span>
            </button>

            <label className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>RESTORE BACKUP</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Sovereign Privacy Banner */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-mono-tech text-neutral-400">
          <Lock className="w-4 h-4 text-[#00ff87]" />
          <span>YOUR TRAINING DATA STAYS ON THIS DEVICE // 100% OFFLINE PERSISTENCE IN LOCAL INDEXEDDB</span>
          {statusMsg && <span className="text-[#00ff87] ml-auto font-bold">{statusMsg}</span>}
        </div>
      </div>

      {/* Training Frequency Heatmap Calendar */}
      <ActivityGrid sessions={sessions} />

      {/* Chronological Session History List */}
      <div className="space-y-3">
        <h3 className="font-mono-tech font-bold text-xs text-neutral-400 tracking-wider">
          CHRONOLOGICAL LOGGED SESSIONS ({sessions.length})
        </h3>

        {sessions.length === 0 ? (
          <div className="equipment-panel rounded-xl p-8 text-center border border-white/10 font-mono-tech text-xs text-neutral-400">
            No training sessions recorded. Sessions completed in the training console automatically archive here.
          </div>
        ) : (
          sessions.map((s) => {
            const isExpanded = expandedSessionId === s.id;
            const dateObj = new Date(s.startedAt);

            return (
              <div
                key={s.id}
                className="equipment-panel rounded-xl p-4 sm:p-5 border border-white/10 hover:border-white/20 transition-all font-mono-tech"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedSessionId(isExpanded ? null : s.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white">
                      {s.type === 'boxing' && <Timer className="w-4 h-4 text-[#00ff87]" />}
                      {s.type === 'strength' && <Dumbbell className="w-4 h-4 text-[#38bdf8]" />}
                      {s.type === 'taekwondo' && <Shield className="w-4 h-4 text-amber-400" />}
                      {s.type === 'custom' && <Layers className="w-4 h-4 text-purple-400" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{s.title}</h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 uppercase text-neutral-400">
                          {s.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        {dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-neutral-400 block">KINETIC LOAD</span>
                      <span className="text-sm font-bold text-[#00ff87]">{s.kineticLoad}</span>
                    </div>

                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-neutral-400 block">DURATION</span>
                      <span className="text-sm font-bold text-white">
                        {Math.floor(s.totalDurationSeconds / 60)}m {s.totalDurationSeconds % 60}s
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(s.id);
                      }}
                      className="text-neutral-500 hover:text-red-400 p-1.5 transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                  </div>
                </div>

                {/* Expanded Session Detail Breakdown */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#090b0f] p-3 rounded-lg border border-white/10">
                      <div>
                        <span className="text-[10px] text-neutral-400 block">ROUNDS</span>
                        <span className="text-white font-bold">{s.roundsCompleted || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block">TOTAL VOLUME</span>
                        <span className="text-white font-bold">{s.totalVolumeKg ? `${s.totalVolumeKg} kg` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block">SETS / REPS</span>
                        <span className="text-white font-bold">{s.totalSets ? `${s.totalSets} sets (${s.totalReps} reps)` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block">INTEGRITY ORIGIN</span>
                        <span className="text-emerald-400 font-bold">{s.origin}</span>
                      </div>
                    </div>

                    {/* Exercise Drill details */}
                    {s.exercises && s.exercises.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider">EXERCISE BREAKDOWN</span>
                        {s.exercises.map((ex) => (
                          <div key={ex.id} className="p-2 rounded bg-white/5 flex items-center justify-between text-[11px]">
                            <span className="text-white font-bold">{ex.exerciseName}</span>
                            <span className="text-neutral-400">
                              {ex.sets.filter((st) => st.completed).map((st) => `${st.weight}kg×${st.reps}`).join(', ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Technique Drill details */}
                    {s.techniques && s.techniques.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider">STRIKING REPS</span>
                        {s.techniques.map((tk, idx) => (
                          <div key={idx} className="p-2 rounded bg-white/5 flex items-center justify-between text-[11px]">
                            <span className="text-white">{tk.technique}</span>
                            <span className="text-[#00ff87]">
                              L: {tk.leftCount} | R: {tk.rightCount} ({tk.leftCount + tk.rightCount} Total)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
