// KINETIC CORE - IndexedDB Local Persistence Engine
// 100% offline-first storage. All athlete data remains solely on-device.

import {
  TrainingSession,
  CustomTrainingPreset,
  CombatCombination,
  PersonalRecord,
  ExerciseLog
} from '@/types';

const DB_NAME = 'KineticCoreDB';
const DB_VERSION = 1;

export interface DBStores {
  sessions: TrainingSession;
  presets: CustomTrainingPreset;
  combinations: CombatCombination;
  records: PersonalRecord;
  exercises: ExerciseLog;
}

// Built-in presets for immediate zero-friction training
export const DEFAULT_PRESETS: CustomTrainingPreset[] = [
  {
    id: 'preset-boxing-championship',
    name: 'Boxing — 12 Championship Rounds',
    trainingType: 'boxing',
    roundsCount: 12,
    roundDurationSeconds: 180, // 3:00
    restDurationSeconds: 60,   // 1:00
    warningDurationSeconds: 10,
    prepDurationSeconds: 10,
    createdAt: Date.now()
  },
  {
    id: 'preset-boxing-pro',
    name: 'Boxing — Pro 3:00 / 0:30 (High Intensity)',
    trainingType: 'boxing',
    roundsCount: 8,
    roundDurationSeconds: 180, // 3:00
    restDurationSeconds: 30,   // 0:30
    warningDurationSeconds: 10,
    prepDurationSeconds: 5,
    createdAt: Date.now()
  },
  {
    id: 'preset-mma-intervals',
    name: 'MMA — 5-Minute Championship Rounds',
    trainingType: 'custom',
    roundsCount: 5,
    roundDurationSeconds: 300, // 5:00
    restDurationSeconds: 60,   // 1:00
    warningDurationSeconds: 10,
    prepDurationSeconds: 10,
    createdAt: Date.now()
  },
  {
    id: 'preset-striking-hiit',
    name: 'Muay Thai / Kickboxing — Heavy Bag Blitz',
    trainingType: 'boxing',
    roundsCount: 6,
    roundDurationSeconds: 120, // 2:00
    restDurationSeconds: 45,   // 0:45
    warningDurationSeconds: 10,
    prepDurationSeconds: 5,
    createdAt: Date.now()
  },
  {
    id: 'preset-speed-tabata',
    name: 'Combat Sprint / Tabata Drills',
    trainingType: 'combat_conditioning',
    roundsCount: 8,
    roundDurationSeconds: 20,
    restDurationSeconds: 10,
    warningDurationSeconds: 3,
    prepDurationSeconds: 5,
    createdAt: Date.now()
  }
];

export const DEFAULT_COMBINATIONS: CombatCombination[] = [
  {
    id: 'combo-1',
    name: 'Basic Jab-Cross',
    notation: '1 - 2',
    sequence: ['1', '2'],
    category: 'boxing'
  },
  {
    id: 'combo-2',
    name: 'Classic 1-2-3 (Jab, Cross, Lead Hook)',
    notation: '1 - 2 - 3',
    sequence: ['1', '2', '3'],
    category: 'boxing'
  },
  {
    id: 'combo-3',
    name: 'The Workhorse (Jab, Cross, Lead Hook, Cross)',
    notation: '1 - 2 - 3 - 2',
    sequence: ['1', '2', '3', '2'],
    category: 'boxing'
  },
  {
    id: 'combo-4',
    name: 'Liver Strike Exit (1 - 2 - Lead Hook Body - Rear Low Kick)',
    notation: '1 - 2 - 3B - 4K',
    sequence: ['1', '2', '3B', '4K'],
    category: 'kickboxing'
  },
  {
    id: 'combo-5',
    name: 'Double Jab Cross Slip Cross',
    notation: '1 - 1 - 2 - SLIP - 2',
    sequence: ['1', '1', '2', 'SLIP', '2'],
    category: 'boxing'
  }
];

class StorageEngine {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('IndexedDB not supported in SSR'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
          const db = req.result;

          if (!db.objectStoreNames.contains('sessions')) {
            const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
            sessionStore.createIndex('startedAt', 'startedAt', { unique: false });
            sessionStore.createIndex('type', 'type', { unique: false });
          }

          if (!db.objectStoreNames.contains('presets')) {
            db.createObjectStore('presets', { keyPath: 'id' });
          }

          if (!db.objectStoreNames.contains('combinations')) {
            db.createObjectStore('combinations', { keyPath: 'id' });
          }

          if (!db.objectStoreNames.contains('records')) {
            const recordStore = db.createObjectStore('records', { keyPath: 'id' });
            recordStore.createIndex('category', 'category', { unique: false });
            recordStore.createIndex('metric', 'metric', { unique: false });
          }

          if (!db.objectStoreNames.contains('exercises')) {
            db.createObjectStore('exercises', { keyPath: 'id' });
          }
        };

        req.onsuccess = () => {
          const db = req.result;
          this.seedInitialData(db);
          resolve(db);
        };

        req.onerror = () => {
          reject(req.error);
        };
      });
    }

    return this.dbPromise;
  }

  private seedInitialData(db: IDBDatabase) {
    try {
      const tx = db.transaction(['presets', 'combinations'], 'readwrite');
      const presetStore = tx.objectStore('presets');
      const countReq = presetStore.count();

      countReq.onsuccess = () => {
        if (countReq.result === 0) {
          DEFAULT_PRESETS.forEach((p) => presetStore.put(p));
        }
      };

      const comboStore = tx.objectStore('combinations');
      const comboCount = comboStore.count();
      comboCount.onsuccess = () => {
        if (comboCount.result === 0) {
          DEFAULT_COMBINATIONS.forEach((c) => comboStore.put(c));
        }
      };
    } catch {
      // Transaction or seeding error handled gracefully
    }
  }

  // --- SESSIONS ---
  public async saveSession(session: TrainingSession): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      const req = store.put(session);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getSessions(): Promise<TrainingSession[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sessions', 'readonly');
      const store = tx.objectStore('sessions');
      const req = store.getAll();
      req.onsuccess = () => {
        const sorted = (req.result as TrainingSession[]).sort((a, b) => b.startedAt - a.startedAt);
        resolve(sorted);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async getSessionById(id: string): Promise<TrainingSession | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sessions', 'readonly');
      const store = tx.objectStore('sessions');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteSession(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- PRESETS ---
  public async getPresets(): Promise<CustomTrainingPreset[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('presets', 'readonly');
      const store = tx.objectStore('presets');
      const req = store.getAll();
      req.onsuccess = () => {
        if (!req.result || req.result.length === 0) {
          resolve(DEFAULT_PRESETS);
        } else {
          resolve(req.result);
        }
      };
      req.onerror = () => resolve(DEFAULT_PRESETS);
    });
  }

  public async savePreset(preset: CustomTrainingPreset): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('presets', 'readwrite');
      const store = tx.objectStore('presets');
      const req = store.put(preset);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async deletePreset(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('presets', 'readwrite');
      const store = tx.objectStore('presets');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- COMBINATIONS ---
  public async getCombinations(): Promise<CombatCombination[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('combinations', 'readonly');
      const store = tx.objectStore('combinations');
      const req = store.getAll();
      req.onsuccess = () => {
        if (!req.result || req.result.length === 0) {
          resolve(DEFAULT_COMBINATIONS);
        } else {
          resolve(req.result);
        }
      };
      req.onerror = () => resolve(DEFAULT_COMBINATIONS);
    });
  }

  public async saveCombination(combo: CombatCombination): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('combinations', 'readwrite');
      const store = tx.objectStore('combinations');
      const req = store.put(combo);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteCombination(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('combinations', 'readwrite');
      const store = tx.objectStore('combinations');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- PERSONAL RECORDS ---
  public async getRecords(): Promise<PersonalRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('records', 'readonly');
      const store = tx.objectStore('records');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async saveRecord(record: PersonalRecord): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('records', 'readwrite');
      const store = tx.objectStore('records');
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- DUMP ALL DATA (FOR EXPORT) ---
  public async exportAllData(): Promise<{
    version: number;
    exportedAt: string;
    sessions: TrainingSession[];
    presets: CustomTrainingPreset[];
    combinations: CombatCombination[];
    records: PersonalRecord[];
  }> {
    const [sessions, presets, combinations, records] = await Promise.all([
      this.getSessions(),
      this.getPresets(),
      this.getCombinations(),
      this.getRecords()
    ]);

    return {
      version: DB_VERSION,
      exportedAt: new Date().toISOString(),
      sessions,
      presets,
      combinations,
      records
    };
  }

  public async importAllData(payload: any): Promise<boolean> {
    if (!payload || !payload.sessions) {
      throw new Error('Invalid backup schema: sessions array missing.');
    }
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['sessions', 'presets', 'combinations', 'records'], 'readwrite');
      
      const sStore = tx.objectStore('sessions');
      (payload.sessions || []).forEach((s: TrainingSession) => sStore.put(s));

      const pStore = tx.objectStore('presets');
      (payload.presets || []).forEach((p: CustomTrainingPreset) => pStore.put(p));

      const cStore = tx.objectStore('combinations');
      (payload.combinations || []).forEach((c: CombatCombination) => cStore.put(c));

      const rStore = tx.objectStore('records');
      (payload.records || []).forEach((r: PersonalRecord) => rStore.put(r));

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const dbEngine = new StorageEngine();
