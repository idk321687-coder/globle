'use client';

import React, { useState, useMemo } from 'react';
import { Country, GameSettings, Guess } from '@/types';
import { formatDistance } from '@/lib/geo';
import { Flame, ArrowUpDown, ChevronUp, ChevronDown, Compass, Target, Sparkles, MapPin } from 'lucide-react';

interface GuessesDashboardProps {
  guesses: Guess[];
  settings: GameSettings;
  onSelectCountry?: (country: Country) => void;
  isWon: boolean;
}

type SortMode = 'closest' | 'chronological';

export default function GuessesDashboard({
  guesses,
  settings,
  onSelectCountry,
  isWon
}: GuessesDashboardProps) {
  const [sortMode, setSortMode] = useState<SortMode>('closest');
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Identify closest guess so far
  const closestGuess = useMemo(() => {
    if (guesses.length === 0) return null;
    return guesses.reduce((closest, curr) =>
      curr.distanceKm < closest.distanceKm ? curr : closest
    );
  }, [guesses]);

  // Sort guesses
  const sortedGuesses = useMemo(() => {
    const list = [...guesses];
    if (sortMode === 'closest') {
      return list.sort((a, b) => a.distanceKm - b.distanceKm);
    }
    // Chronological: newest on top
    return list.sort((a, b) => b.guessNumber - a.guessNumber);
  }, [guesses, sortMode]);

  if (guesses.length === 0) {
    return (
      <div className="w-full text-center py-6 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
        <p className="text-sm text-slate-400 font-medium">
          Make your first guess above! The closer you get, the hotter the color.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Closest Guess So Far Banner */}
      {closestGuess && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-slate-900/80 p-3.5 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {closestGuess.isTarget ? (
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Flame className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400/90">
                  {closestGuess.isTarget ? 'Mystery Country Found!' : 'Closest Guess So Far'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{closestGuess.country.flag}</span>
                  <span className="text-sm font-bold text-slate-100">
                    {closestGuess.country.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-extrabold text-white">
                {closestGuess.isTarget ? (
                  <span className="text-emerald-400">TARGET 🎯</span>
                ) : (
                  formatDistance(closestGuess.distanceKm, settings.unit)
                )}
              </div>
              {!closestGuess.isTarget && (
                <div className="text-[11px] font-semibold flex items-center justify-end gap-1 text-slate-400">
                  <span>Target is:</span>
                  <span className="text-amber-400 font-bold">{closestGuess.bearing}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header with Guess count and Sort Toggle */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Guesses ({guesses.length})
          </span>
          {isWon && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
              Completed
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Sheet Toggle */}
          <button
            onClick={() => setIsMobileExpanded(prev => !prev)}
            className="md:hidden flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
          >
            <span>{isMobileExpanded ? 'Collapse' : 'Expand'}</span>
            {isMobileExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {/* Sort Switch */}
          <button
            onClick={() => setSortMode(prev => (prev === 'closest' ? 'chronological' : 'closest'))}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-all"
          >
            <ArrowUpDown className="w-3 h-3 text-emerald-400" />
            <span>{sortMode === 'closest' ? 'Sort: Closest' : 'Sort: Recent'}</span>
          </button>
        </div>
      </div>

      {/* Guesses List Container */}
      <div
        className={`flex flex-col gap-2 transition-all duration-300 ${
          isMobileExpanded ? 'max-h-[60vh]' : 'max-h-64 sm:max-h-80'
        } overflow-y-auto pr-1 select-none custom-scrollbar`}
      >
        {sortedGuesses.map(guess => {
          const isClosest = closestGuess?.country.id === guess.country.id;

          return (
            <div
              key={`${guess.country.id}-${guess.guessNumber}`}
              onClick={() => onSelectCountry && onSelectCountry(guess.country)}
              className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                guess.isTarget
                  ? 'bg-emerald-950/40 border-emerald-500/50 hover:border-emerald-400 shadow-emerald-900/20 shadow-lg'
                  : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800/80 hover:border-slate-700 shadow-md'
              }`}
            >
              {/* Left: Flag, Name, Guess # */}
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none flex-shrink-0">{guess.country.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors">
                      {guess.country.name}
                    </span>
                    {isClosest && !guess.isTarget && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px] font-semibold border border-amber-500/30">
                        Closest
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Guess #{guess.guessNumber}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {guess.country.continent}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Distance, Heat Badge, Bearing */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-extrabold text-sm text-slate-100">
                    {guess.isTarget ? (
                      <span className="text-emerald-400 font-black">CORRECT!</span>
                    ) : (
                      formatDistance(guess.distanceKm, settings.unit)
                    )}
                  </div>
                  {!guess.isTarget && (
                    <div className="text-[11px] font-bold text-slate-400 flex items-center justify-end gap-1">
                      <span>Direction:</span>
                      <span className="text-indigo-400 font-mono">{guess.bearing}</span>
                    </div>
                  )}
                </div>

                {/* Heat Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold shadow-md flex-shrink-0 transition-transform group-hover:scale-105 ${guess.heat.badgeClass}`}
                  title={`${guess.heat.label} (${formatDistance(guess.distanceKm, settings.unit)})`}
                >
                  {guess.heat.emoji}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
