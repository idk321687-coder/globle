'use client';

import React, { useState } from 'react';
import { GameStats, Guess } from '@/types';
import { generateShareText } from '@/lib/gameEngine';
import { X, BarChart3, Trophy, Flame, Share2, Check, Sparkles } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  isWon: boolean;
  guesses: Guess[];
  dayNumber: number;
  unit: 'km' | 'miles';
  isDaily: boolean;
}

export default function StatsModal({
  isOpen,
  onClose,
  stats,
  isWon,
  guesses,
  dayNumber,
  unit,
  isDaily
}: StatsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const winPercentage = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxDistributionCount = Math.max(1, ...Object.values(stats.guessDistribution));

  const handleShare = async () => {
    const text = generateShareText({
      dayNumber,
      isDaily,
      guesses,
      unit
    });

    if (navigator.share) {
      try {
        await navigator.share({
          text
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Game Statistics</h2>
            <p className="text-xs text-slate-400">Your Globle performance record</p>
          </div>
        </div>

        {/* Core Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-2xl font-black text-white">{stats.played}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 text-center">
              Played
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-2xl font-black text-emerald-400">{winPercentage}%</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 text-center">
              Win Rate
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-2xl font-black text-amber-400 flex items-center gap-0.5">
              {stats.currentStreak}
              <Flame className="w-4 h-4 fill-amber-400/20" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 text-center">
              Streak
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-2xl font-black text-indigo-400 flex items-center gap-0.5">
              {stats.maxStreak}
              <Trophy className="w-4 h-4" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 text-center">
              Max
            </span>
          </div>
        </div>

        {/* Guess Distribution Chart */}
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">
            Guess Distribution
          </h3>
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map(guessCount => {
              const count = stats.guessDistribution[guessCount] || 0;
              const percent = Math.max(8, (count / maxDistributionCount) * 100);
              const isCurrentGuessCount = isWon && (guessCount === 7 ? guesses.length >= 7 : guesses.length === guessCount);

              return (
                <div key={guessCount} className="flex items-center gap-2 text-xs">
                  <span className="w-4 font-mono font-bold text-slate-400 text-right">
                    {guessCount === 7 ? '7+' : guessCount}
                  </span>
                  <div className="flex-1 bg-slate-800/50 rounded-lg overflow-hidden h-6 flex items-center">
                    <div
                      className={`h-full flex items-center justify-end px-2.5 font-bold transition-all duration-500 ${
                        isCurrentGuessCount
                          ? 'bg-emerald-500 text-white shadow-md'
                          : count > 0
                          ? 'bg-slate-700 text-slate-200'
                          : 'bg-transparent text-slate-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Practice Stats Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 mb-6 flex items-center justify-between text-xs text-slate-400">
          <span>Practice Rounds Completed:</span>
          <span className="font-bold text-slate-200 font-mono">
            {stats.practiceWon} / {stats.practicePlayed}
          </span>
        </div>

        {/* Share Button (if won) */}
        {isWon && (
          <button
            onClick={handleShare}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Result</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
