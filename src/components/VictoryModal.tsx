'use client';

import React, { useEffect, useState } from 'react';
import { Country, GameSettings, Guess } from '@/types';
import { generateShareText } from '@/lib/gameEngine';
import { X, Trophy, Share2, Check, Sparkles, Clock, RefreshCw, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCountry: Country;
  guesses: Guess[];
  dayNumber: number;
  settings: GameSettings;
  isDaily: boolean;
  onStartPractice: () => void;
}

export default function VictoryModal({
  isOpen,
  onClose,
  targetCountry,
  guesses,
  dayNumber,
  settings,
  isDaily,
  onStartPractice
}: VictoryModalProps) {
  const [copied, setCopied] = useState(false);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState('');

  // Fire celebratory confetti on mount/open
  useEffect(() => {
    if (isOpen) {
      const end = Date.now() + 1500;
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899'];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  // Next UTC Midnight countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextUtcMidnight = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
      );
      const diffMs = nextUtcMidnight.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');
      setTimeUntilMidnight(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const handleShare = async () => {
    const text = generateShareText({
      dayNumber,
      isDaily,
      guesses,
      unit: settings.unit
    });

    if (navigator.share) {
      try {
        await navigator.share({ text });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl text-slate-100 text-center custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Victory Trophy Icon */}
        <div className="relative inline-block mb-4 mt-2">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 mx-auto">
            <Trophy className="w-10 h-10 text-slate-950" />
          </div>
          <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-amber-400 text-slate-950 shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black tracking-tight text-white mb-1">
          {isDaily ? `Globle #${dayNumber} Solved!` : 'Practice Solved!'}
        </h2>
        <p className="text-xs text-emerald-400 font-semibold mb-6 uppercase tracking-wider">
          Found in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}
        </p>

        {/* Target Country Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-850/80 border border-slate-700/80 mb-6 text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl leading-none">{targetCountry.flag}</span>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{targetCountry.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">
                  {targetCountry.iso3}
                </span>
              </h3>
              {targetCountry.officialName !== targetCountry.name && (
                <p className="text-xs text-slate-400">{targetCountry.officialName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-700/50">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{targetCountry.continent}</span>
            </div>
            {targetCountry.subregion && (
              <span className="text-slate-400">• {targetCountry.subregion}</span>
            )}
          </div>
        </div>

        {/* Wordle-style Emoji Visual */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 mb-6">
          <div className="text-xs text-slate-400 mb-2 font-medium">Guess Heat Path</div>
          <div className="flex flex-wrap items-center justify-center gap-1 text-xl">
            {guesses.map(g => (
              <span key={`${g.country.id}-${g.guessNumber}`} title={`${g.country.name}: ${g.heat.label}`}>
                {g.heat.level === 'target' ? '🟩' : g.heat.level === 'crimson' ? '🟥' : g.heat.level === 'redOrange' ? '🟧' : g.heat.level === 'orange' ? '🟨' : g.heat.level === 'amber' ? '🟨' : '⬜'}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 mb-6">
          <button
            onClick={handleShare}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Copied Result to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Score</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onClose();
              onStartPractice();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-700"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            <span>Play Unlimited Practice Mode</span>
          </button>
        </div>

        {/* Daily Countdown */}
        {isDaily && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Next Globle in:</span>
            <span className="font-mono font-bold text-slate-200 text-sm">
              {timeUntilMidnight}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
