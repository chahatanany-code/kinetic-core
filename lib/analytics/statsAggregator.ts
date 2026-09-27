// KINETIC CORE - Athlete Performance Stats Aggregator
// Strictly derives metrics and PRs from authenticated local IndexedDB records.
// Zero manufactured fake stats.

import { TrainingSession, PersonalRecord } from '@/types';

export interface AthleteSummaryMetrics {
  totalSessions: number;
  totalTrainingTimeSeconds: number;
  totalSets: number;
  totalReps: number;
  totalVolumeKg: number;
  roundsCompleted: number;
  currentStreakDays: number;
  longestStreakDays: number;
  averageSessionDurationMinutes: number;
  totalKineticLoad: number;
  mostFrequentTrainingType: string;
}

export function aggregateAthleteMetrics(sessions: TrainingSession[]): AthleteSummaryMetrics {
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      totalTrainingTimeSeconds: 0,
      totalSets: 0,
      totalReps: 0,
      totalVolumeKg: 0,
      roundsCompleted: 0,
      currentStreakDays: 0,
      longestStreakDays: 0,
      averageSessionDurationMinutes: 0,
      totalKineticLoad: 0,
      mostFrequentTrainingType: 'NONE'
    };
  }

  let totalTrainingTimeSeconds = 0;
  let totalSets = 0;
  let totalReps = 0;
  let totalVolumeKg = 0;
  let roundsCompleted = 0;
  let totalKineticLoad = 0;
  const typeCounts: Record<string, number> = {};

  sessions.forEach((s) => {
    totalTrainingTimeSeconds += s.totalDurationSeconds || 0;
    roundsCompleted += s.roundsCompleted || 0;
    totalKineticLoad += s.kineticLoad || 0;
    typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;

    if (s.exercises) {
      s.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          if (set.completed) {
            totalSets += 1;
            totalReps += set.reps || 0;
            totalVolumeKg += (set.weight || 0) * (set.reps || 0);
          }
        });
      });
    }
  });

  const { currentStreak, longestStreak } = calculateStreaks(sessions);

  // Find most frequent type
  let mostFrequentType = 'boxing';
  let maxCount = -1;
  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentType = type.toUpperCase();
    }
  });

  return {
    totalSessions: sessions.length,
    totalTrainingTimeSeconds,
    totalSets,
    totalReps,
    totalVolumeKg: Math.round(totalVolumeKg * 10) / 10,
    roundsCompleted,
    currentStreakDays: currentStreak,
    longestStreakDays: longestStreak,
    averageSessionDurationMinutes: Math.round((totalTrainingTimeSeconds / sessions.length / 60) * 10) / 10,
    totalKineticLoad: Math.round(totalKineticLoad * 10) / 10,
    mostFrequentTrainingType: mostFrequentType
  };
}

export function extractPersonalRecords(sessions: TrainingSession[]): PersonalRecord[] {
  const records: PersonalRecord[] = [];
  if (!sessions || sessions.length === 0) return records;

  let maxRounds = 0;
  let maxRoundsSessionId = '';
  let longestDurationSec = 0;
  let longestDurationSessionId = '';
  let maxVolumeKg = 0;
  let maxVolumeSessionId = '';

  const strengthMaxes: Record<string, { weight: number; reps: number; sessionId: string; date: number }> = {};

  sessions.forEach((s) => {
    // Combat rounds PR
    if ((s.roundsCompleted || 0) > maxRounds) {
      maxRounds = s.roundsCompleted || 0;
      maxRoundsSessionId = s.id;
    }

    // Longest Session PR
    if ((s.totalDurationSeconds || 0) > longestDurationSec) {
      longestDurationSec = s.totalDurationSeconds || 0;
      longestDurationSessionId = s.id;
    }

    // Session Volume PR
    if ((s.totalVolumeKg || 0) > maxVolumeKg) {
      maxVolumeKg = s.totalVolumeKg || 0;
      maxVolumeSessionId = s.id;
    }

    // Strength lifts PR (highest weight for an exercise)
    if (s.exercises) {
      s.exercises.forEach((ex) => {
        const name = ex.exerciseName.trim();
        ex.sets.forEach((set) => {
          if (set.completed && set.weight > 0) {
            const current = strengthMaxes[name];
            if (!current || set.weight > current.weight || (set.weight === current.weight && set.reps > current.reps)) {
              strengthMaxes[name] = {
                weight: set.weight,
                reps: set.reps,
                sessionId: s.id,
                date: s.startedAt
              };
            }
          }
        });
      });
    }
  });

  if (maxRounds > 0) {
    records.push({
      id: 'pr-combat-rounds',
      category: 'COMBAT',
      metric: 'Max Combat Rounds',
      value: maxRounds,
      unit: 'rounds',
      achievedAt: Date.now(),
      sessionId: maxRoundsSessionId,
      origin: 'CALCULATED'
    });
  }

  if (longestDurationSec > 0) {
    records.push({
      id: 'pr-session-duration',
      category: 'DURATION',
      metric: 'Longest Training Session',
      value: Math.round(longestDurationSec / 60),
      unit: 'minutes',
      achievedAt: Date.now(),
      sessionId: longestDurationSessionId,
      origin: 'CALCULATED'
    });
  }

  if (maxVolumeKg > 0) {
    records.push({
      id: 'pr-session-volume',
      category: 'VOLUME',
      metric: 'Max Single-Session Volume',
      value: Math.round(maxVolumeKg),
      unit: 'kg',
      achievedAt: Date.now(),
      sessionId: maxVolumeSessionId,
      origin: 'CALCULATED'
    });
  }

  Object.entries(strengthMaxes).forEach(([exerciseName, data]) => {
    records.push({
      id: `pr-strength-${exerciseName.toLowerCase().replace(/\s+/g, '-')}`,
      category: 'STRENGTH',
      metric: `${exerciseName} Peak Lift`,
      value: data.weight,
      unit: `kg (${data.reps} reps)`,
      achievedAt: data.date,
      sessionId: data.sessionId,
      origin: 'CALCULATED'
    });
  });

  return records;
}

function calculateStreaks(sessions: TrainingSession[]): { currentStreak: number; longestStreak: number } {
  if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Set of unique calendar days formatted YYYY-MM-DD
  const daysSet = new Set<string>();
  sessions.forEach((s) => {
    const d = new Date(s.startedAt);
    const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    daysSet.add(dayStr);
  });

  const sortedDays = Array.from(daysSet).sort().reverse();
  if (sortedDays.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let currentStreak = 0;
  let checkDate = new Date(daysSet.has(todayStr) ? today : (daysSet.has(yesterdayStr) ? yesterday : 0));

  if (checkDate.getTime() > 0) {
    while (true) {
      const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (daysSet.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  const ascendingDays = Array.from(daysSet).sort();

  for (let i = 0; i < ascendingDays.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(ascendingDays[i - 1]);
      const curr = new Date(ascendingDays[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}
