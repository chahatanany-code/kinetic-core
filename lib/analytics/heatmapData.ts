// KINETIC CORE - Heatmap Activity Generator
// Generates GitHub-style training frequency matrix based strictly on logged sessions.

import { TrainingSession } from '@/types';

export interface HeatmapDay {
  dateString: string; // YYYY-MM-DD
  displayDate: string; // e.g., "Oct 14"
  dayOfWeek: number; // 0 = Sun, 6 = Sat
  intensity: 0 | 1 | 2 | 3 | 4;
  kineticLoad: number;
  totalDurationMinutes: number;
  roundsCount: number;
  setsCount: number;
  sessionCount: number;
  sessions: TrainingSession[];
}

export function generateTrainingHeatmap(sessions: TrainingSession[], weeksBack: number = 20): HeatmapDay[] {
  const sessionMap = new Map<string, TrainingSession[]>();

  (sessions || []).forEach((s) => {
    const d = new Date(s.startedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const list = sessionMap.get(key) || [];
    list.push(s);
    sessionMap.set(key, list);
  });

  const days: HeatmapDay[] = [];
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const totalDays = weeksBack * 7;
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (totalDays - 1));
  startDate.setHours(0, 0, 0, 0);

  const cur = new Date(startDate);

  while (cur <= today) {
    const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    const matched = sessionMap.get(key) || [];

    let dayLoad = 0;
    let dayDurationSec = 0;
    let dayRounds = 0;
    let daySets = 0;

    matched.forEach((s) => {
      dayLoad += s.kineticLoad || 0;
      dayDurationSec += s.totalDurationSeconds || 0;
      dayRounds += s.roundsCompleted || 0;
      daySets += s.totalSets || 0;
    });

    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (dayLoad > 0 || matched.length > 0) {
      if (dayLoad >= 400 || dayDurationSec >= 3600) intensity = 4;
      else if (dayLoad >= 250 || dayDurationSec >= 2400) intensity = 3;
      else if (dayLoad >= 120 || dayDurationSec >= 1200) intensity = 2;
      else intensity = 1;
    }

    days.push({
      dateString: key,
      displayDate: cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayOfWeek: cur.getDay(),
      intensity,
      kineticLoad: Math.round(dayLoad * 10) / 10,
      totalDurationMinutes: Math.round(dayDurationSec / 60),
      roundsCount: dayRounds,
      setsCount: daySets,
      sessionCount: matched.length,
      sessions: matched
    });

    cur.setDate(cur.getDate() + 1);
  }

  return days;
}
