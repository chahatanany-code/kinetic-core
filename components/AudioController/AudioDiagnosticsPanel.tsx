'use client';

// KINETIC CORE - Audio Engine Diagnostics & Control Panel
// Algorithmic sound selection, live audio playback test triggers, and vibration toggles.

import React, { useState, useEffect } from 'react';
import { soundEngine } from '@/lib/audio/soundSynthesizer';
import { SoundProfile } from '@/types';
import { Volume2, Bell, Vibrate, Check, Play, Activity } from 'lucide-react';
import { saveSettings, loadSettings } from '@/lib/storage/preferences';

export const AudioDiagnosticsPanel: React.FC = () => {
  const [profile, setProfile] = useState<SoundProfile>(soundEngine.getSoundProfile());
  const [volume, setVolume] = useState<number>(soundEngine.getVolume());
  const [vibration, setVibration] = useState<boolean>(true);
  const [audioState, setAudioState] = useState<string>('SUSPENDED');

  useEffect(() => {
    const s = loadSettings();
    setProfile(s.soundProfile);
    setVolume(s.volume);
    setVibration(s.vibrationEnabled);

    const updateStatus = () => {
      setAudioState(soundEngine.getAudioState());
    };
    updateStatus();
    const interval = setInterval(updateStatus, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleProfileChange = (p: SoundProfile) => {
    setProfile(p);
    soundEngine.setSoundProfile(p);
    saveSettings({ soundProfile: p });
    // Play demonstration
    soundEngine.playRoundStart();
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    soundEngine.setVolume(v);
    saveSettings({ volume: v });
  };

  const handleVibrationToggle = () => {
    const next = !vibration;
    setVibration(next);
    soundEngine.setVibrationEnabled(next);
    saveSettings({ vibrationEnabled: next });
  };

  return (
    <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15 space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-[#00ff87]" />
          <h3 className="font-mono-tech font-bold text-base text-white tracking-wider">
            AUDIO ENGINE & ACOUSTIC TELEMETRY
          </h3>
        </div>
        <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
          WEB AUDIO SYNTHESIS
        </span>
      </div>

      {/* Engine Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#090b0f] p-3 rounded-lg border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">SYNTH ENGINE</span>
          <span className="font-mono-tech text-xs font-bold text-white block">ALGORITHMIC SINE/NOISE</span>
          <span className="text-[9px] font-mono-tech text-emerald-400">ZERO MP3 DRIFT</span>
        </div>

        <div className="bg-[#090b0f] p-3 rounded-lg border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">AUDIOCONTEXT STATE</span>
          <span className="font-mono-tech text-xs font-bold text-[#38bdf8] block uppercase">
            {audioState}
          </span>
          <span className="text-[9px] font-mono-tech text-neutral-400">HARDWARE CLOCK LINK</span>
        </div>

        <div className="bg-[#090b0f] p-3 rounded-lg border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">LATENCY ESTIMATE</span>
          <span className="font-mono-tech text-xs font-bold text-neutral-200 block">&lt; 5 MS</span>
          <span className="text-[9px] font-mono-tech text-neutral-400">HARDWARE INTERLEAVE</span>
        </div>

        <div className="bg-[#090b0f] p-3 rounded-lg border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">HAPTIC MOTOR</span>
          <span className="font-mono-tech text-xs font-bold text-white block">
            {vibration ? 'ENABLED' : 'DISABLED'}
          </span>
          <span className="text-[9px] font-mono-tech text-neutral-400">NAVIGATOR.VIBRATE</span>
        </div>
      </div>

      {/* Sound Profile Selector */}
      <div>
        <label className="text-xs font-mono-tech text-neutral-400 block mb-2">
          ACOUSTIC PROFILE
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'CLASSIC_BELL', name: 'Classic Bronze Bell', desc: 'Resonant multi-harmonic metallic strike' },
            { id: 'DIGITAL_BEEP', name: 'Digital Chirp', desc: 'Punchy square wave frequency chirp' },
            { id: 'TACTICAL', name: 'Tactical Sub Pulse', desc: 'Low-frequency sawtooth percussive hit' },
            { id: 'MINIMAL', name: 'Minimal Pings', desc: 'Low intrusion audible prompts' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleProfileChange(item.id as SoundProfile)}
              className={`p-3 rounded-lg border text-left transition-all ${
                profile === item.id
                  ? 'border-[#00ff87] bg-[#00ff87]/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between font-mono-tech text-xs font-bold text-white mb-1">
                <span>{item.name}</span>
                {profile === item.id && <Check className="w-3.5 h-3.5 text-[#00ff87]" />}
              </div>
              <p className="text-[10px] font-mono-tech text-neutral-400 leading-tight">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Volume Slider & Haptics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#090b0f] p-4 rounded-xl border border-white/10">
        <div>
          <div className="flex justify-between text-xs font-mono-tech mb-1.5">
            <span className="text-neutral-300">MASTER SYNTHESIS GAIN</span>
            <span className="text-[#00ff87] font-bold">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-[#00ff87]"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs font-mono-tech text-neutral-300">HAPTIC VIBRATION</span>
          <button
            onClick={handleVibrationToggle}
            className={`px-3 py-1.5 rounded font-mono-tech text-xs border ${
              vibration
                ? 'bg-[#00ff87] text-black font-bold border-[#00ff87]'
                : 'bg-white/5 border-white/10 text-neutral-400'
            }`}
          >
            {vibration ? 'ACTIVE' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Real-time Audio Preview Triggers */}
      <div>
        <label className="text-xs font-mono-tech text-neutral-400 block mb-2">
          AUDITION INDIVIDUAL AUDIO CUES
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => soundEngine.playRoundStart()}
            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 font-mono-tech text-xs text-white flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-current text-[#00ff87]" />
            ROUND START BELL
          </button>
          <button
            onClick={() => soundEngine.play10SecondWarning()}
            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 font-mono-tech text-xs text-white flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-current text-amber-400" />
            10s WOOD CLAPPER
          </button>
          <button
            onClick={() => soundEngine.playCountdownTick(3)}
            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 font-mono-tech text-xs text-white flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-current text-blue-400" />
            5s COUNTDOWN PING
          </button>
          <button
            onClick={() => soundEngine.playRoundEnd()}
            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 font-mono-tech text-xs text-white flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-current text-rose-400" />
            ROUND END (DOUBLE BELL)
          </button>
          <button
            onClick={() => soundEngine.playSessionComplete()}
            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 font-mono-tech text-xs text-white flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-current text-[#00ff87]" />
            SESSION FINISH FANFARE
          </button>
        </div>
      </div>
    </div>
  );
};
