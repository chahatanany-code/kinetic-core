'use client';

// KINETIC CORE - Authoritative Clock & Drift Diagnostics Monitor
// Directly measures Web Worker clock ticks against performance.now() to ensure sub-millisecond drift.

import React, { useState, useEffect } from 'react';
import { timerEngine } from '@/lib/timing/timerCoordinator';
import { ClockDiagnostic } from '@/types';
import { Cpu, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export const TimerDriftMonitor: React.FC = () => {
  const [diag, setDiag] = useState<ClockDiagnostic>(timerEngine.getDiagnostic());

  useEffect(() => {
    const unsub = timerEngine.subscribeDiagnostics((d) => {
      setDiag(d);
    });
    return unsub;
  }, []);

  return (
    <div className="equipment-panel rounded-xl p-5 sm:p-6 border border-white/15 space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#38bdf8]" />
          <h3 className="font-mono-tech font-bold text-base text-white tracking-wider">
            AUTHORITATIVE CLOCK & DRIFT DIAGNOSTICS
          </h3>
        </div>
        <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300">
          TELEMETRY // {diag.driftStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#090b0f] p-3.5 rounded-lg border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">CLOCK SOURCE</span>
          <span className="font-mono-tech text-xs font-bold text-white block">
            {diag.clockSource}
          </span>
          <span className="text-[9px] font-mono-tech text-neutral-400">HIGH-RESOLUTION EPOCH</span>
        </div>

        <div className="bg-[#090b0f] p-3.5 rounded-lg border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">WORKER THREAD</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${diag.workerStatus === 'ACTIVE' ? 'bg-[#00ff87]' : 'bg-red-500'}`} />
            <span className="font-mono-tech text-xs font-bold text-white">{diag.workerStatus}</span>
          </div>
          <span className="text-[9px] font-mono-tech text-neutral-400">ISOLATED FROM UI THREAD</span>
        </div>

        <div className="bg-[#090b0f] p-3.5 rounded-lg border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">MEASURED DRIFT</span>
          <span className="font-mono-tech text-base font-bold text-[#00ff87] block">
            {diag.lastDriftMs} ms
          </span>
          <span className="text-[9px] font-mono-tech text-neutral-400">MAX RECORDED: {diag.maxDriftMs} ms</span>
        </div>

        <div className="bg-[#090b0f] p-3.5 rounded-lg border border-white/10">
          <span className="text-[10px] font-mono-tech text-neutral-400 block mb-1">TOTAL CLOCK PULSES</span>
          <span className="font-mono-tech text-base font-bold text-white block">
            {diag.totalTicks.toLocaleString()}
          </span>
          <span className="text-[9px] font-mono-tech text-neutral-400">20 HZ SYNC RESOLUTION</span>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-black/40 border border-white/10 space-y-2 text-xs font-mono-tech text-neutral-300">
        <div className="flex items-center gap-2 text-[#00ff87]">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-bold">ENGINEERING GUARANTEE: DRIFT MITIGATION</span>
        </div>
        <p className="text-neutral-400 leading-relaxed text-[11px]">
          Unlike standard fitness apps that rely on <code className="text-amber-300">setInterval()</code> (which drifts significantly when the phone locks or drops frames), KINETIC CORE synchronizes against monotonic <code className="text-white">performance.now()</code> delta baselines inside an independent Web Worker thread. Even when background tab throttling occurs, the clock automatically recalibrates to authoritative hardware time.
        </p>
      </div>
    </div>
  );
};
