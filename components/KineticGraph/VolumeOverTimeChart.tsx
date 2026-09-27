'use client';

// KINETIC CORE - Kinetic Graph & Volume Progression Chart
// Smooth mathematical SVG curves with dynamic telemetry axes and animated trend vectors.

import React, { useState } from 'react';
import { Activity } from 'lucide-react';

interface DataPoint {
  date: string;
  volumeKg: number;
  label: string;
}

interface VolumeOverTimeChartProps {
  data?: DataPoint[];
  title?: string;
}

export const VolumeOverTimeChart: React.FC<VolumeOverTimeChartProps> = ({
  data = [
    { date: 'W01', volumeKg: 4200, label: 'Week 01' },
    { date: 'W02', volumeKg: 5100, label: 'Week 02' },
    { date: 'W03', volumeKg: 4800, label: 'Week 03' },
    { date: 'W04', volumeKg: 6200, label: 'Week 04' },
    { date: 'W05', volumeKg: 6900, label: 'Week 05' },
    { date: 'W06', volumeKg: 7400, label: 'Week 06' },
    { date: 'W07', volumeKg: 8420, label: 'Week 07' }
  ],
  title = 'MECHANICAL VOLUME OVER TIME'
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 640;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 55 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVolume = Math.max(...data.map((d) => d.volumeKg), 1000);
  const minVolume = 0;

  // Generate SVG coordinates
  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(1, data.length - 1)) * chartW;
    const y = padding.top + chartH - ((d.volumeKg - minVolume) / (maxVolume - minVolume)) * chartH;
    return { x, y, ...d };
  });

  // Construct smooth SVG path
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
  }

  // Gradient area path
  const areaD = pathD
    ? `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`
    : '';

  return (
    <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#00ff87]" />
          <h3 className="font-mono-tech font-bold text-sm sm:text-base text-white tracking-wider">
            {title}
          </h3>
        </div>
        <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
          Σ(WEIGHT × REPS)
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff87" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00ff87" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartH * (1 - ratio);
            const val = Math.round(minVolume + ratio * (maxVolume - minVolume));
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="2 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] font-mono-tech fill-neutral-400"
                >
                  {val.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaD && <path d={areaD} fill="url(#volumeGrad)" />}

          {/* Curved Trend Vector */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#00ff87"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Data Points */}
          {points.map((pt, i) => {
            const isHovered = hoverIndex === i;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#ffffff' : '#00ff87'}
                  stroke="#07080a"
                  strokeWidth="2"
                  className="transition-all"
                />
                {/* X-axis Label */}
                <text
                  x={pt.x}
                  y={padding.top + chartH + 18}
                  textAnchor="middle"
                  className="text-[10px] font-mono-tech fill-neutral-400"
                >
                  {pt.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="absolute p-2 rounded bg-black/90 border border-[#00ff87]/50 font-mono-tech text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(points[hoverIndex].x / width) * 100}%`,
              top: `${(points[hoverIndex].y / height) * 100}%`
            }}
          >
            <div className="text-neutral-400 text-[10px]">{points[hoverIndex].label}</div>
            <div className="text-white font-bold">{points[hoverIndex].volumeKg.toLocaleString()} KG</div>
          </div>
        )}
      </div>
    </div>
  );
};
