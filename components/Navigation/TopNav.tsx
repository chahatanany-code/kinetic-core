'use client';

// KINETIC CORE - Top Navigation Bar
// Supports seamless Single-Link (SPA) in-place view switching as well as multi-route navigation.

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Flame,
  Dumbbell,
  Timer as TimerIcon,
  Activity,
  History,
  Settings,
  Shield,
  Menu,
  X,
  Volume2,
  VolumeX,
  Layers,
  Sparkles
} from 'lucide-react';
import { SystemStatusBadge } from './SystemStatusBadge';
import { soundEngine } from '@/lib/audio/soundSynthesizer';
import { useAppStore, AppView } from '@/lib/store/useAppStore';

export const TopNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const { currentView, setCurrentView, openTrainingConsole } = useAppStore();

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const navLinks: Array<{ view: AppView; label: string; icon: any; badge?: string }> = [
    { view: 'TRAIN', label: 'TRAIN', icon: Flame, badge: 'ACTIVE' },
    { view: 'TIMER', label: 'TIMER', icon: TimerIcon },
    { view: 'STRENGTH', label: 'STRENGTH', icon: Dumbbell },
    { view: 'COMBAT', label: 'COMBAT LAB', icon: Shield },
    { view: 'BUILDER', label: 'BUILDER', icon: Layers },
    { view: 'ANALYTICS', label: 'ANALYTICS', icon: Activity },
    { view: 'HISTORY', label: 'HISTORY', icon: History },
    { view: 'SETTINGS', label: 'CONFIG', icon: Settings },
    { view: 'SHOWCASE', label: 'SHOWCASE', icon: Sparkles }
  ];

  const handleNavClick = (view: AppView) => {
    soundEngine.playButtonTap();
    setCurrentView(view);
    setMobileMenuOpen(false);
    if (pathname !== '/') {
      router.push(`/?view=${view.toLowerCase()}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#07080a]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('TRAIN')}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded bg-white/5 border border-white/20 flex items-center justify-center text-[#00ff87] group-hover:border-[#00ff87] transition-colors">
              <span className="font-mono-tech font-bold text-xs tracking-tighter">KC</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech font-bold text-sm tracking-widest text-neutral-100 flex items-center gap-1.5">
                KINETIC<span className="text-[#00ff87]">CORE</span>
              </span>
              <span className="text-[9px] font-mono-tech text-neutral-400 tracking-wider hidden sm:inline">
                COMBAT & STRENGTH OS
              </span>
            </div>
          </button>
        </div>

        {/* Single-Link Interactive Nav Bar */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.view;
            return (
              <button
                key={link.view}
                onClick={() => handleNavClick(link.view)}
                className={`relative px-3 py-1.5 rounded text-xs font-mono-tech tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'text-white bg-white/10 border border-white/20 font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00ff87]' : 'text-neutral-400'}`} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff87] animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Telemetry & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <SystemStatusBadge />

          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 rounded bg-white/5 border border-white/10 hover:border-white/30 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-neutral-300" />}
          </button>

          <button
            onClick={() => openTrainingConsole()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-[#00ff87] hover:bg-[#00e578] text-black font-mono-tech text-xs font-bold tracking-wider transition-transform active:scale-95 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>START</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 rounded bg-white/5 border border-white/10 text-neutral-200 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-white/10 bg-[#090b0f] px-4 pt-3 pb-5 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.view;
            return (
              <button
                key={link.view}
                onClick={() => handleNavClick(link.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded font-mono-tech text-xs tracking-wider transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'text-white bg-white/10 border border-white/20 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00ff87]' : 'text-neutral-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
