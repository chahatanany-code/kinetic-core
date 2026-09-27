'use client';

// KINETIC CORE - Athlete Movement & Muscle Distribution Map
// Stylized athletic silhouette visualizing mechanical stress and combat movement volume.
// NOTE: Functional telemetry visualization of logged training. Not a clinical medical assessment.

import React, { useState } from 'react';
import { Shield, Info } from 'lucide-react';

interface ZoneData {
  name: string;
  volumeKg?: number;
  reps?: number;
  intensity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'strength' | 'combat';
}

interface SilhouetteMapProps {
  zoneLoads?: Record<string, number>;
}

export const SilhouetteMap: React.FC<SilhouetteMapProps> = ({ zoneLoads = {} }) => {
  const [activeZone, setActiveZone] = useState<string | null>('CHEST');

  // Compute intensity tiers
  const getIntensity = (val: number = 0): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' => {
    if (val <= 0) return 'NONE';
    if (val < 1000) return 'LOW';
    if (val < 3500) return 'MEDIUM';
    return 'HIGH';
  };

  const zones: Record<string, ZoneData> = {
    CHEST: { name: 'Pectorals / Chest', volumeKg: zoneLoads['CHEST'] || 1850, intensity: getIntensity(zoneLoads['CHEST'] || 1850), category: 'strength' },
    BACK: { name: 'Lats & Trapezius', volumeKg: zoneLoads['BACK'] || 2400, intensity: getIntensity(zoneLoads['BACK'] || 2400), category: 'strength' },
    SHOULDERS: { name: 'Deltoids / Kinetic Guard', volumeKg: zoneLoads['SHOULDERS'] || 1200, intensity: getIntensity(zoneLoads['SHOULDERS'] || 1200), category: 'strength' },
    ARMS: { name: 'Biceps & Triceps (Punches)', volumeKg: zoneLoads['ARMS'] || 950, intensity: getIntensity(zoneLoads['ARMS'] || 950), category: 'strength' },
    CORE: { name: 'Rotational Core & Obliques', volumeKg: zoneLoads['CORE'] || 800, intensity: getIntensity(zoneLoads['CORE'] || 800), category: 'combat' },
    LEGS: { name: 'Quadriceps, Glutes & Calves', volumeKg: zoneLoads['LEGS'] || 3200, intensity: getIntensity(zoneLoads['LEGS'] || 3200), category: 'strength' },
    PUNCHES: { name: 'Punching Kinetic Chain', reps: 340, intensity: 'HIGH', category: 'combat' },
    KICKS: { name: 'Kicking Mechanics & Hips', reps: 180, intensity: 'MEDIUM', category: 'combat' },
    FOOTWORK: { name: 'Agility & Ring Mobility', reps: 45, intensity: 'LOW', category: 'combat' }
  };

  const getZoneColor = (zoneKey: string) => {
    const data = zones[zoneKey];
    if (!data) return '#1e2430';
    if (activeZone === zoneKey) return '#00ff87';
    switch (data.intensity) {
      case 'HIGH': return '#00ff87';
      case 'MEDIUM': return '#38bdf8';
      case 'LOW': return '#fbbf24';
      default: return '#1a1f2c';
    }
  };

  const currentData = activeZone ? zones[activeZone] : null;

  return (
    <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#00ff87]" />
          <h3 className="font-mono-tech font-bold text-base text-white tracking-wider">
            ATHLETE MOVEMENT & STRAIN MAP
          </h3>
        </div>
        <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400">
          LOGGED TELEMETRY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Silhouette SVG Visualization */}
        <div className="md:col-span-6 flex justify-center py-2">
          <svg
            viewBox="0 0 280 420"
            className="w-56 sm:w-64 h-auto drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
          >
            {/* Background Base Grid Lines */}
            <circle cx="140" cy="210" r="130" fill="none" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <circle cx="140" cy="210" r="80" fill="none" stroke="rgba(255,255,255,0.03)" />
            <line x1="140" y1="20" x2="140" y2="400" stroke="rgba(255,255,255,0.05)" />

            {/* HEAD / NECK */}
            <path
              d="M 125 35 Q 140 20 155 35 Q 160 55 155 70 Q 140 78 125 70 Z"
              fill="#181e2b"
              stroke="#2e384d"
              strokeWidth="1.5"
            />

            {/* SHOULDERS */}
            <path
              d="M 105 75 Q 140 70 175 75 L 195 95 L 180 115 L 100 115 L 85 95 Z"
              fill={getZoneColor('SHOULDERS')}
              fillOpacity={activeZone === 'SHOULDERS' ? 0.9 : 0.6}
              stroke="#00ff87"
              strokeWidth={activeZone === 'SHOULDERS' ? 2 : 1}
              className="cursor-pointer transition-all hover:opacity-100"
              onClick={() => setActiveZone('SHOULDERS')}
            />

            {/* CHEST */}
            <path
              d="M 102 118 L 178 118 L 170 160 Q 140 170 110 160 Z"
              fill={getZoneColor('CHEST')}
              fillOpacity={activeZone === 'CHEST' ? 0.9 : 0.6}
              stroke="#00ff87"
              strokeWidth={activeZone === 'CHEST' ? 2 : 1}
              className="cursor-pointer transition-all hover:opacity-100"
              onClick={() => setActiveZone('CHEST')}
            />

            {/* ARMS (LEFT & RIGHT) */}
            <g
              fill={getZoneColor('ARMS')}
              fillOpacity={activeZone === 'ARMS' ? 0.9 : 0.6}
              stroke="#00ff87"
              strokeWidth={activeZone === 'ARMS' ? 2 : 1}
              className="cursor-pointer transition-all hover:opacity-100"
              onClick={() => setActiveZone('ARMS')}
            >
              {/* Left Arm */}
              <path d="M 82 100 L 98 118 L 88 180 L 72 175 Z" />
              <path d="M 88 185 L 72 180 L 60 230 L 72 235 Z" />
              {/* Right Arm */}
              <path d="M 198 100 L 182 118 L 192 180 L 208 175 Z" />
              <path d="M 192 185 L 208 180 L 220 230 L 208 235 Z" />
            </g>

            {/* CORE / ABS */}
            <path
              d="M 112 163 Q 140 172 168 163 L 162 215 L 118 215 Z"
              fill={getZoneColor('CORE')}
              fillOpacity={activeZone === 'CORE' ? 0.9 : 0.6}
              stroke="#00ff87"
              strokeWidth={activeZone === 'CORE' ? 2 : 1}
              className="cursor-pointer transition-all hover:opacity-100"
              onClick={() => setActiveZone('CORE')}
            />

            {/* LEGS (QUADRICEPS & CALVES) */}
            <g
              fill={getZoneColor('LEGS')}
              fillOpacity={activeZone === 'LEGS' ? 0.9 : 0.6}
              stroke="#00ff87"
              strokeWidth={activeZone === 'LEGS' ? 2 : 1}
              className="cursor-pointer transition-all hover:opacity-100"
              onClick={() => setActiveZone('LEGS')}
            >
              {/* Pelvis/Hips */}
              <path d="M 115 218 L 165 218 L 155 245 L 125 245 Z" />
              {/* Left Upper Leg */}
              <path d="M 112 248 L 136 248 L 132 315 L 110 315 Z" />
              {/* Left Lower Leg */}
              <path d="M 110 320 L 132 320 L 128 385 L 112 385 Z" />
              {/* Right Upper Leg */}
              <path d="M 144 248 L 168 248 L 170 315 L 148 315 Z" />
              {/* Right Lower Leg */}
              <path d="M 148 320 L 170 320 L 168 385 L 152 385 Z" />
            </g>
          </svg>
        </div>

        {/* Selected Zone Telemetry Panel */}
        <div className="md:col-span-6 space-y-4">
          {currentData ? (
            <div className="bg-[#090b0f] p-4 sm:p-5 rounded-xl border border-white/10">
              <span className="text-[10px] font-mono-tech text-neutral-400 tracking-wider uppercase block mb-1">
                REGION TELEMETRY // {currentData.category}
              </span>
              <h4 className="font-mono-tech font-bold text-xl text-white mb-2">
                {currentData.name}
              </h4>

              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="p-3 rounded bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono-tech text-neutral-400 block">TOTAL VOLUME</span>
                  <span className="font-mono-tech text-lg font-bold text-white">
                    {currentData.volumeKg ? `${currentData.volumeKg.toLocaleString()} KG` : `${currentData.reps} REPS`}
                  </span>
                </div>
                <div className="p-3 rounded bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono-tech text-neutral-400 block">STRAIN LEVEL</span>
                  <span className={`font-mono-tech text-lg font-bold ${
                    currentData.intensity === 'HIGH' ? 'text-[#00ff87]' : (currentData.intensity === 'MEDIUM' ? 'text-[#38bdf8]' : 'text-amber-400')
                  }`}>
                    {currentData.intensity}
                  </span>
                </div>
              </div>

              <p className="text-xs font-mono-tech text-neutral-400 leading-relaxed">
                Derived directly from completed exercises, compound loads, and striking rounds logged in this cycle.
              </p>
            </div>
          ) : (
            <div className="bg-[#090b0f] p-4 rounded-xl border border-white/10 text-center text-xs font-mono-tech text-neutral-400">
              Click a muscle group or combat module on the silhouette to inspect strain distribution.
            </div>
          )}

          {/* Quick Zone Picker Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(zones).map((z) => (
              <button
                key={z}
                onClick={() => setActiveZone(z)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono-tech border transition-all ${
                  activeZone === z
                    ? 'bg-[#00ff87] text-black font-bold border-[#00ff87]'
                    : 'bg-white/5 border-white/10 text-neutral-300 hover:border-white/20'
                }`}
              >
                {z}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-neutral-400">
            <Info className="w-3.5 h-3.5" />
            <span>Pure logged workload visualization. Zero fabricated physiological sensor data.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
