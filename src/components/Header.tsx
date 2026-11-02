'use client';

import React from 'react';
import { GameMode } from '@/types';
import { Globe2, HelpCircle, BarChart3, Settings, PlayCircle, RefreshCw } from 'lucide-react';

interface HeaderProps {
  mode: GameMode;
  dayNumber: number;
  onOpenHelp: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onNewPracticeRound?: () => void;
  onToggleMode: (mode: GameMode) => void;
}

export default function Header({
  mode,
  dayNumber,
  onOpenHelp,
  onOpenStats,
  onOpenSettings,
  onNewPracticeRound,
  onToggleMode
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Mode Badge & Quick Switch */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-0.5 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
            <button
              onClick={() => onToggleMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'daily'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daily #{dayNumber}
            </button>
            <button
              onClick={() => onToggleMode('practice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'practice'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Practice
            </button>
          </div>

          {mode === 'practice' && onNewPracticeRound && (
            <button
              onClick={onNewPracticeRound}
              title="Start New Practice Mystery Country"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>New Round</span>
            </button>
          )}
        </div>

        {/* Center: Title & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Globe2 className="w-7 h-7 text-emerald-400 animate-pulse" />
            <div className="absolute inset-0 blur-md bg-emerald-500/30 -z-10" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
            GLOBLE
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenHelp}
            aria-label="How to play"
            title="How to play"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all active:scale-95"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenStats}
            aria-label="Statistics"
            title="Statistics"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all active:scale-95"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Settings"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all active:scale-95"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
