// KINETIC CORE - Volume and Tonnage Calculation Engine
// Strictly calculates mechanical volume load from completed sets and reps.
// Origin: CALCULATED

import { ExerciseLog, ExerciseSet } from '@/types';

export interface VolumeMetrics {
  totalSets: number;
  totalReps: number;
  totalVolumeKg: number; // sum(weight * reps)
  averageIntensityKg: number; // totalVolume / totalReps
  muscleVolumeBreakdown: Record<string, number>;
}

export function calculateSetVolume(set: ExerciseSet): number {
  if (!set.completed || set.weight <= 0 || set.reps <= 0) return 0;
  return set.weight * set.reps;
}

export function calculateExerciseVolume(exercise: ExerciseLog): { volumeKg: number; sets: number; reps: number } {
  let volumeKg = 0;
  let sets = 0;
  let reps = 0;

  exercise.sets.forEach((set) => {
    if (set.completed && set.weight > 0 && set.reps > 0) {
      volumeKg += set.weight * set.reps;
      sets += 1;
      reps += set.reps;
    }
  });

  return { volumeKg: Math.round(volumeKg * 10) / 10, sets, reps };
}

export function calculateSessionVolume(exercises: ExerciseLog[]): VolumeMetrics {
  let totalSets = 0;
  let totalReps = 0;
  let totalVolumeKg = 0;
  const muscleVolumeBreakdown: Record<string, number> = {};

  exercises.forEach((ex) => {
    const { volumeKg, sets, reps } = calculateExerciseVolume(ex);
    totalSets += sets;
    totalReps += reps;
    totalVolumeKg += volumeKg;

    // Distribute volume equally among targeted muscle groups
    const muscleCount = Math.max(1, ex.muscleGroups.length);
    const splitVolume = volumeKg / muscleCount;

    ex.muscleGroups.forEach((mg) => {
      muscleVolumeBreakdown[mg] = (muscleVolumeBreakdown[mg] || 0) + splitVolume;
    });
  });

  const averageIntensityKg = totalReps > 0 ? Math.round((totalVolumeKg / totalReps) * 10) / 10 : 0;

  // Round muscle volumes
  Object.keys(muscleVolumeBreakdown).forEach((k) => {
    muscleVolumeBreakdown[k] = Math.round(muscleVolumeBreakdown[k] * 10) / 10;
  });

  return {
    totalSets,
    totalReps,
    totalVolumeKg: Math.round(totalVolumeKg * 10) / 10,
    averageIntensityKg,
    muscleVolumeBreakdown
  };
}
