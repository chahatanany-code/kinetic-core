// KINETIC CORE - Lightweight User Preferences
// Stored in LocalStorage for instant hydration before IndexedDB connects.

import { SystemSettings } from '@/types';

const SETTINGS_KEY = 'kinetic_core_settings_v1';

export const DEFAULT_SETTINGS: SystemSettings = {
  soundProfile: 'CLASSIC_BELL',
  volume: 0.85,
  vibrationEnabled: true,
  hapticCountdownEnabled: true,
  warningBellTime: 10,
  prepTimeSeconds: 10,
  wakeLockEnabled: true,
  preferredUnit: 'KG',
  defaultRoundLength: 180, // 3 mins
  defaultRestLength: 30,   // 30 secs
  defaultRoundCount: 8,
  highContrastMode: false,
  reducedMotion: false
};

export function loadSettings(): SystemSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<SystemSettings>): SystemSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const current = loadSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
