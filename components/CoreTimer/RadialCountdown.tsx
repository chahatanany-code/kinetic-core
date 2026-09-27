'use client';

// KINETIC CORE - Radial Countdown Ring Visualization
// High-FPS SVG ring derived strictly from authoritative timestamp progress.
// Zero reliance on CSS transition duration for clock timing.

import React from 'react';
import { IntervalState } from '@/types';

interface RadialCountdownProps {
  secondsRemaining: number;
  intervalDuration: number;
  intervalProgress: number; // 0 (start) to 1 (depleted)
  state: IntervalState;
  currentRound: number;
  totalRounds: number;
  size?: number; // pixel diameter
  strokeWidth?: number;
  className?: string;
}

export const RadialCountdown: React.FC<RadialCountdownProps> = ({
  secondsRemaining,
  intervalProgress,
  state,
  currentRound,
  totalRounds,
  size = 380,
  strokeWidth = 14,
  className = ''
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Depleting stroke offset: starts full (offset = 0) and empties as progress reaches 1
  const strokeDashoffset = circumference * Math.min(1.0, Math.max(0, intervalProgress));

  // Determine state-specific theme colors
  let color = '#00ff87'; // Kinetic Work Green
  let glowClass = 'glow-work';
  let stateLabel = 'WORK';
  let ringBgColor = 'rgba(0, 255, 135, 0.12)';

  switch (state) {
    case 'PREPARATION':
      color = '#fbbf24'; // Amber
      glowClass = 'text-amber-300';
      stateLabel = 'GET READY';
      ringBgColor = 'rgba(251, 191, 36, 0.1)';
      break;
    case 'WARNING':
      color = '#ff7b25'; // Ember Warning
      glowClass = 'glow-warning';
      stateLabel = 'WARNING';
      ringBgColor = 'rgba(255, 123, 37, 0.15)';
      break;
    case 'REST':
      color = '#38bdf8'; // Electric Blue Rest
      glowClass = 'glow-rest';
      stateLabel = 'REST';
      ringBgColor = 'rgba(56, 189, 248, 0.12)';
      break;
    case 'PAUSED':
      color = '#94a3b8';
      glowClass = 'text-slate-400';
      stateLabel = 'PAUSED';
      ringBgColor = 'rgba(148, 163, 184, 0.1)';
      break;
    case 'COMPLETE':
      color = '#00ff87';
      glowClass = 'glow-work';
      stateLabel = 'SESSION COMPLETED';
      ringBgColor = 'rgba(0, 255, 135, 0.12)';
      break;
    case 'IDLE':
      color = '#475569';
      glowClass = 'text-neutral-500';
      stateLabel = 'READY';
      ringBgColor = 'rgba(255, 255, 255, 0.05)';
      break;
  }

  // Format MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Chronometer peripheral tick marks
  const tickCount = 48;
  const ticks = Array.from({ length: tickCount });

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 origin-center overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <filter id="ring-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dial Peripheral Ticks */}
        {ticks.map((_, i) => {
          const angle = (i * 360) / tickCount;
          const isMajor = i % 4 === 0;
          const tickLen = isMajor ? 10 : 5;
          const rInner = radius + strokeWidth / 2 + 10;
          const rOuter = rInner + tickLen;
          const rad = (angle * Math.PI) / 180;
          const x1 = size / 2 + rInner * Math.cos(rad);
          const y1 = size / 2 + rInner * Math.sin(rad);
          const x2 = size / 2 + rOuter * Math.cos(rad);
          const y2 = size / 2 + rOuter * Math.sin(rad);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isMajor ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}
              strokeWidth={isMajor ? 2 : 1}
            />
          );
        })}

        {/* Depleted Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringBgColor}
          strokeWidth={strokeWidth}
        />

        {/* Active Depleting Ring Path */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          filter="url(#ring-glow)"
          style={{
            transition: 'stroke-dashoffset 0.05s linear, stroke 0.3s ease'
          }}
        />
      </svg>

      {/* Center Readout Console */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
        {/* Status Badge */}
        <div
          className="px-3 py-1 rounded text-xs font-mono-tech tracking-widest uppercase font-bold mb-2 border"
          style={{
            borderColor: `${color}40`,
            backgroundColor: `${color}15`,
            color: color
          }}
        >
          {stateLabel}
        </div>

        {/* Enormous Timer Readout */}
        <div
          className={`font-mono-tech font-extrabold text-6xl sm:text-7xl md:text-8xl tracking-tighter leading-none ${glowClass}`}
          style={{ color: '#ffffff' }}
        >
          {timeFormatted}
        </div>

        {/* Round Counter */}
        <div className="mt-3 flex items-center gap-2 font-mono-tech text-xs sm:text-sm tracking-widest text-neutral-300">
          <span className="text-neutral-400">ROUND</span>
          <span className="text-white font-bold text-base sm:text-lg">
            {String(currentRound).padStart(2, '0')}
          </span>
          <span className="text-neutral-400">/</span>
          <span className="text-neutral-300">
            {String(totalRounds).padStart(2, '0')}
          </span>
        </div>

        {/* Sub-label */}
        <div className="mt-1 text-[11px] font-mono-tech text-neutral-400 tracking-wider">
          {state === 'WORK' && 'ENGAGE COMBAT DRILL'}
          {state === 'REST' && 'RECOVER & BREATHE'}
          {state === 'WARNING' && '10 SECONDS REMAINING'}
          {state === 'PREPARATION' && 'BELL IMMINENT'}
          {state === 'PAUSED' && 'TRAINING CLOCK HALTED'}
          {state === 'COMPLETE' && 'SESSION FINISHED'}
          {state === 'IDLE' && 'CLOCK ARMED'}
        </div>
      </div>
    </div>
  );
};
