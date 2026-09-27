'use client';

// KINETIC CORE - Exercise Logger & Live Volume Tracker
// Fast tactile logging of sets, reps, load, and RPE during strength workouts.

import React, { useState } from 'react';
import { ExerciseLog, ExerciseSet, TrainingSession } from '@/types';
import { calculateSessionVolume, calculateSetVolume } from '@/lib/calculations/volume';
import { calculateKineticLoad } from '@/lib/calculations/kineticLoad';
import { dbEngine } from '@/lib/storage/db';
import { Dumbbell, Plus, Trash2, Check, Save } from 'lucide-react';

const COMMON_EXERCISES = [
  { name: 'Barbell Bench Press', muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'] },
  { name: 'Barbell Back Squat', muscleGroups: ['LEGS', 'CORE'] },
  { name: 'Conventional Deadlift', muscleGroups: ['BACK', 'LEGS', 'CORE'] },
  { name: 'Overhead Press', muscleGroups: ['SHOULDERS', 'TRICEPS', 'CORE'] },
  { name: 'Weighted Pull-Up', muscleGroups: ['BACK', 'ARMS', 'CORE'] },
  { name: 'Barbell Bent-Over Row', muscleGroups: ['BACK', 'ARMS'] },
  { name: 'Incline Dumbbell Press', muscleGroups: ['CHEST', 'SHOULDERS'] },
  { name: 'Romanian Deadlift', muscleGroups: ['LEGS', 'BACK'] }
];

export const ExerciseLogger: React.FC = () => {
  const [exercises, setExercises] = useState<ExerciseLog[]>([
    {
      id: 'ex-1',
      exerciseName: 'Barbell Bench Press',
      muscleGroups: ['CHEST', 'TRICEPS'],
      sets: [
        { id: 'set-1', setNumber: 1, weight: 100, reps: 8, rpe: 8, timestamp: Date.now(), origin: 'MANUALLY ENTERED', completed: true },
        { id: 'set-2', setNumber: 2, weight: 105, reps: 6, rpe: 8.5, timestamp: Date.now(), origin: 'MANUALLY ENTERED', completed: true },
        { id: 'set-3', setNumber: 3, weight: 110, reps: 4, rpe: 9, timestamp: Date.now(), origin: 'MANUALLY ENTERED', completed: false }
      ]
    }
  ]);

  const [selectedPresetName, setSelectedPresetName] = useState(COMMON_EXERCISES[0].name);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const metrics = calculateSessionVolume(exercises);
  const kineticLoadData = calculateKineticLoad({
    totalVolumeKg: metrics.totalVolumeKg,
    totalSets: metrics.totalSets
  });

  const handleAddExercise = () => {
    const matched = COMMON_EXERCISES.find((e) => e.name === selectedPresetName);
    const newEx: ExerciseLog = {
      id: `ex-${Date.now()}`,
      exerciseName: selectedPresetName,
      muscleGroups: matched ? matched.muscleGroups : ['FULL_BODY'],
      sets: [
        {
          id: `set-${Date.now()}-1`,
          setNumber: 1,
          weight: 80,
          reps: 8,
          rpe: 8,
          timestamp: Date.now(),
          origin: 'MANUALLY ENTERED',
          completed: false
        }
      ]
    };
    setExercises((prev) => [...prev, newEx]);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== exerciseId));
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const nextSet: ExerciseSet = {
          id: `set-${Date.now()}-${ex.sets.length + 1}`,
          setNumber: ex.sets.length + 1,
          weight: lastSet ? lastSet.weight : 100,
          reps: lastSet ? lastSet.reps : 8,
          rpe: lastSet ? lastSet.rpe : 8,
          timestamp: Date.now(),
          origin: 'MANUALLY ENTERED',
          completed: false
        };
        return { ...ex, sets: [...ex.sets, nextSet] };
      })
    );
  };

  const handleUpdateSet = (exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s))
        };
      })
    );
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const remaining = ex.sets.filter((s) => s.id !== setId);
        return {
          ...ex,
          sets: remaining.map((s, idx) => ({ ...s, setNumber: idx + 1 }))
        };
      })
    );
  };

  const handleSaveWorkout = async () => {
    try {
      const session: TrainingSession = {
        id: `strength-${Date.now()}`,
        startedAt: Date.now() - 3600 * 1000,
        endedAt: Date.now(),
        type: 'strength',
        title: 'Strength Performance Protocol',
        totalDurationSeconds: 3600,
        exercises,
        totalVolumeKg: metrics.totalVolumeKg,
        totalSets: metrics.totalSets,
        totalReps: metrics.totalReps,
        kineticLoad: kineticLoadData.totalKineticLoad,
        origin: 'CALCULATED'
      };

      await dbEngine.saveSession(session);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save strength session:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Volume & Telemetry Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#090b0f] border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">TOTAL VOLUME</span>
          <div className="font-mono-tech text-2xl font-bold text-white">
            {metrics.totalVolumeKg.toLocaleString()} <span className="text-xs text-[#00ff87]">KG</span>
          </div>
          <span className="text-[9px] font-mono-tech text-neutral-400">CALCULATED: Σ(W × R)</span>
        </div>

        <div className="p-4 rounded-xl bg-[#090b0f] border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">COMPLETED SETS</span>
          <div className="font-mono-tech text-2xl font-bold text-[#38bdf8]">
            {metrics.totalSets} <span className="text-xs text-neutral-400">SETS</span>
          </div>
          <span className="text-[9px] font-mono-tech text-neutral-400">{metrics.totalReps} TOTAL REPS</span>
        </div>

        <div className="p-4 rounded-xl bg-[#090b0f] border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">AVG INTENSITY</span>
          <div className="font-mono-tech text-2xl font-bold text-neutral-200">
            {metrics.averageIntensityKg} <span className="text-xs text-neutral-400">KG/REP</span>
          </div>
          <span className="text-[9px] font-mono-tech text-neutral-400">MEAN PER REP</span>
        </div>

        <div className="p-4 rounded-xl bg-[#090b0f] border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">KINETIC LOAD</span>
          <div className="font-mono-tech text-2xl font-bold text-amber-400">
            {kineticLoadData.totalKineticLoad}
          </div>
          <span className="text-[9px] font-mono-tech text-neutral-400">TIER: {kineticLoadData.loadTier}</span>
        </div>
      </div>

      {/* Exercise Logs */}
      <div className="space-y-4">
        {exercises.map((ex) => (
          <div key={ex.id} className="equipment-panel rounded-xl p-4 sm:p-5 border border-white/15">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#00ff87]" />
                <h4 className="font-mono-tech font-bold text-sm sm:text-base text-white">
                  {ex.exerciseName}
                </h4>
                <div className="flex gap-1 ml-2">
                  {ex.muscleGroups.map((mg) => (
                    <span key={mg} className="text-[9px] font-mono-tech px-1.5 py-0.5 rounded bg-white/5 text-neutral-400">
                      {mg}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleRemoveExercise(ex.id)}
                className="text-neutral-400 hover:text-red-400 p-1 transition-colors"
                title="Remove Exercise"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Set Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-mono-tech text-neutral-400 px-2">
                <span className="col-span-1">SET</span>
                <span className="col-span-3">WEIGHT (KG)</span>
                <span className="col-span-3">REPS</span>
                <span className="col-span-2">RPE</span>
                <span className="col-span-2 text-right">VOLUME</span>
                <span className="col-span-1 text-center">DONE</span>
              </div>

              {ex.sets.map((set) => {
                const vol = calculateSetVolume(set);
                return (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg border transition-all ${
                      set.completed
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <span className="col-span-1 font-mono-tech text-xs font-bold text-neutral-400">
                      0{set.setNumber}
                    </span>

                    <div className="col-span-3">
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) =>
                          handleUpdateSet(ex.id, set.id, { weight: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono-tech font-bold text-white focus:border-[#00ff87] outline-none"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) =>
                          handleUpdateSet(ex.id, set.id, { reps: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono-tech font-bold text-white focus:border-[#00ff87] outline-none"
                      />
                    </div>

                    <div className="col-span-2">
                      <select
                        value={set.rpe || 8}
                        onChange={(e) =>
                          handleUpdateSet(ex.id, set.id, { rpe: parseFloat(e.target.value) })
                        }
                        className="w-full bg-black/40 border border-white/10 rounded px-1.5 py-1 text-xs font-mono-tech text-white focus:border-[#00ff87] outline-none"
                      >
                        {[6, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((v) => (
                          <option key={v} value={v} className="bg-neutral-900">{v}</option>
                        ))}
                      </select>
                    </div>

                    <span className="col-span-2 text-right font-mono-tech text-xs font-bold text-neutral-300">
                      {vol} kg
                    </span>

                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => handleUpdateSet(ex.id, set.id, { completed: !set.completed })}
                        className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${
                          set.completed
                            ? 'bg-[#00ff87] border-[#00ff87] text-black'
                            : 'border-white/20 text-transparent hover:border-white/40'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Set Button */}
            <div className="mt-3 flex justify-between items-center pt-2">
              <button
                onClick={() => handleAddSet(ex.id)}
                className="text-xs font-mono-tech text-[#00ff87] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                ADD SET
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Exercise & Persist Workout Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedPresetName}
            onChange={(e) => setSelectedPresetName(e.target.value)}
            className="bg-[#090b0f] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono-tech text-white focus:border-[#00ff87] outline-none"
          >
            {COMMON_EXERCISES.map((c) => (
              <option key={c.name} value={c.name} className="bg-neutral-900">
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddExercise}
            className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-mono-tech text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            ADD EXERCISE
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {saveSuccess && (
            <span className="text-xs font-mono-tech text-[#00ff87] animate-pulse">
              ✓ PERSISTED TO LOCAL INDEXEDDB
            </span>
          )}
          <button
            onClick={handleSaveWorkout}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#00ff87] hover:bg-[#00e578] text-black font-mono-tech font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
          >
            <Save className="w-4 h-4" />
            SAVE STRENGTH SESSION
          </button>
        </div>
      </div>
    </div>
  );
};
