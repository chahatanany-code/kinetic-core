'use client';

// KINETIC CORE - System Configuration & Diagnostics Console
// Audio profiles, Web Worker drift monitoring, keyboard shortcuts map, units, and athlete preferences.

import React, { useState, useEffect } from 'react';
import { AudioDiagnosticsPanel } from '@/components/AudioController/AudioDiagnosticsPanel';
import { TimerDriftMonitor } from '@/components/Diagnostics/TimerDriftMonitor';
import { loadSettings, saveSettings } from '@/lib/storage/preferences';
import { SystemSettings, WeightUnit } from '@/types';
import {
  Settings,
  Keyboard,
  Sliders,
  User,
  Shield,
  Trash2,
  Check,
  Cpu,
  Volume2
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(loadSettings());
  const [athleteName, setAthleteName] = useState<string>('ATHLETE ONE');
  const [saveAlert, setSaveAlert] = useState<boolean>(false);

  useEffect(() => {
    setSettings(loadSettings());
    const name = localStorage.getItem('kinetic_athlete_name');
    if (name) setAthleteName(name);
  }, []);

  const handleUnitToggle = (unit: WeightUnit) => {
    const updated = saveSettings({ preferredUnit: unit });
    setSettings(updated);
    triggerSaved();
  };

  const handleWakeLockToggle = () => {
    const updated = saveSettings({ wakeLockEnabled: !settings.wakeLockEnabled });
    setSettings(updated);
    triggerSaved();
  };

  const handleSaveAthlete = () => {
    localStorage.setItem('kinetic_athlete_name', athleteName);
    triggerSaved();
  };

  const triggerSaved = () => {
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 2000);
  };

  const shortcuts = [
    { key: 'SPACE', action: 'Pause / Resume Clock', desc: 'Primary toggle for hands-free training' },
    { key: '→ (RIGHT)', action: 'Skip Active Interval', desc: 'Advance to rest or next combat round' },
    { key: 'R', action: 'Restart Session', desc: 'Rewinds to round 1 with original prep delay' },
    { key: 'M', action: 'Mute / Unmute Audio', desc: 'Silence bronze bells and synthesized clicks' },
    { key: 'F', action: 'Toggle Fullscreen', desc: 'Enlarges display into dedicated gym kiosk mode' },
    { key: 'ESC', action: 'Exit Training Console', desc: 'Disarms clock and returns to athlete overview' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="equipment-panel rounded-2xl p-6 sm:p-8 border border-white/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono-tech text-[#00ff87] tracking-widest uppercase font-bold">
                SYSTEM CONFIGURATION
              </span>
              <h1 className="text-2xl sm:text-3xl font-mono-tech font-black text-white">
                HARDWARE & ENGINE SETTINGS
              </h1>
            </div>
          </div>

          {saveAlert && (
            <span className="text-xs font-mono-tech text-[#00ff87] animate-pulse">
              ✓ PREFERENCES SAVED
            </span>
          )}
        </div>
      </div>

      {/* Athlete Profile (Lightweight, No Social Nonsense) */}
      <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15 font-mono-tech">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
          <User className="w-4 h-4 text-[#00ff87]" />
          <h3 className="font-bold text-sm text-white tracking-wider">ATHLETE IDENTITY</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="text-[10px] text-neutral-400 block mb-1">CALLSIGN / ATHLETE NAME</label>
            <input
              type="text"
              value={athleteName}
              onChange={(e) => setAthleteName(e.target.value)}
              className="w-full bg-[#090b0f] border border-white/15 rounded px-3 py-2 text-sm font-bold text-white focus:border-[#00ff87] outline-none"
            />
          </div>

          <button
            onClick={handleSaveAthlete}
            className="px-4 py-2 rounded bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-colors"
          >
            UPDATE CALLSIGN
          </button>
        </div>
      </div>

      {/* Units & Hardware Settings */}
      <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15 font-mono-tech">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
          <Sliders className="w-4 h-4 text-[#38bdf8]" />
          <h3 className="font-bold text-sm text-white tracking-wider">UNITS & HARDWARE PREFERENCES</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Preferred Unit */}
          <div className="bg-[#090b0f] p-4 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-400 block">MEASUREMENT SYSTEM</span>
              <span className="text-sm font-bold text-white">PREFERRED WEIGHT UNIT</span>
            </div>
            <div className="flex gap-1.5">
              {(['KG', 'LB'] as WeightUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => handleUnitToggle(u)}
                  className={`px-3 py-1 rounded text-xs border ${
                    settings.preferredUnit === u
                      ? 'bg-[#00ff87] text-black font-bold border-[#00ff87]'
                      : 'bg-white/5 border-white/10 text-neutral-400'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Screen Wake Lock */}
          <div className="bg-[#090b0f] p-4 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-400 block">SCREEN WAKE LOCK API</span>
              <span className="text-sm font-bold text-white">PREVENT DISPLAY SLEEP</span>
            </div>
            <button
              onClick={handleWakeLockToggle}
              className={`px-3 py-1 rounded text-xs border ${
                settings.wakeLockEnabled
                  ? 'bg-[#38bdf8] text-black font-bold border-[#38bdf8]'
                  : 'bg-white/5 border-white/10 text-neutral-400'
              }`}
            >
              {settings.wakeLockEnabled ? 'ACTIVE' : 'DISABLED'}
            </button>
          </div>
        </div>
      </div>

      {/* Audio Engine Configuration Panel */}
      <AudioDiagnosticsPanel />

      {/* Authoritative Clock & Worker Diagnostics */}
      <TimerDriftMonitor />

      {/* Keyboard Shortcuts Reference Guide */}
      <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15 font-mono-tech">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
          <Keyboard className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-sm text-white tracking-wider">TRAINING KEYBOARD SHORTCUTS</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shortcuts.map((sc) => (
            <div key={sc.key} className="p-3 rounded-lg bg-[#090b0f] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">{sc.action}</span>
                <span className="text-[10px] text-neutral-400">{sc.desc}</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-white/10 border border-white/20 text-xs font-bold text-[#00ff87]">
                {sc.key}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
