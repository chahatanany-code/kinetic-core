// KINETIC CORE - Data Export & Import Engine
// Full athlete autonomy: export/import JSON and CSV archives without network locks.

import { dbEngine } from './db';
import { TrainingSession } from '@/types';

export async function exportDataAsJSON(): Promise<void> {
  const data = await dbEngine.exportAllData();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kinetic-core-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportSessionsAsCSV(): Promise<void> {
  const sessions = await dbEngine.getSessions();
  const headers = [
    'Session ID',
    'Date',
    'Time',
    'Training Type',
    'Title',
    'Duration (Seconds)',
    'Rounds Completed',
    'Total Volume (Kg)',
    'Total Sets',
    'Total Reps',
    'Kinetic Load',
    'Origin'
  ];

  const rows = sessions.map((s) => {
    const d = new Date(s.startedAt);
    return [
      `"${s.id}"`,
      `"${d.toISOString().split('T')[0]}"`,
      `"${d.toTimeString().split(' ')[0]}"`,
      `"${s.type}"`,
      `"${(s.title || '').replace(/"/g, '""')}"`,
      s.totalDurationSeconds || 0,
      s.roundsCompleted || 0,
      s.totalVolumeKg || 0,
      s.totalSets || 0,
      s.totalReps || 0,
      s.kineticLoad || 0,
      `"${s.origin}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kinetic-core-sessions-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importDataFromFile(file: File): Promise<{ success: boolean; count: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.sessions || !Array.isArray(parsed.sessions)) {
          throw new Error('Invalid format: sessions payload missing.');
        }
        await dbEngine.importAllData(parsed);
        resolve({ success: true, count: parsed.sessions.length });
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
