'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Country, GameMode, GameSettings, GameStats, Guess } from '@/types';
import {
  evaluateGuess,
  getCountryById,
  getDailyTargetCountry,
  getDayNumber,
  getRandomPracticeCountry,
  getUtcDateString
} from '@/lib/gameEngine';
import {
  defaultSettings,
  defaultStats,
  loadDailyState,
  loadPracticeState,
  loadSettings,
  loadStats,
  recordGameWin,
  saveDailyState,
  savePracticeState,
  saveSettings
} from '@/lib/storage';
import { playGuessSound } from '@/lib/audio';

import Header from '@/components/Header';
import CountryInput from '@/components/CountryInput';
import GuessesDashboard from '@/components/GuessesDashboard';
import HeatLegend from '@/components/HeatLegend';
import HelpModal from '@/components/HelpModal';
import StatsModal from '@/components/StatsModal';
import SettingsModal from '@/components/SettingsModal';
import VictoryModal from '@/components/VictoryModal';
import { Layers, ChevronRight, ChevronLeft, Sparkles, RefreshCw } from 'lucide-react';

// Dynamically import GlobeView with SSR disabled for WebGL safety
const GlobeView = dynamic(() => import('@/components/GlobeView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-300">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-sky-500/20 border-b-sky-400 animate-spin animate-reverse" />
      </div>
      <p className="text-sm font-semibold tracking-wide text-slate-300 animate-pulse">
        Spinning up 3D Globe...
      </p>
    </div>
  )
});

export default function GloblePage() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<GameMode>('daily');
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [stats, setStats] = useState<GameStats>(defaultStats);

  // Modals state
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);

  // Sidebar toggle state for large screens
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Date and daily target (initialized on client)
  const [todayUtc, setTodayUtc] = useState<string>('');
  const [dayNumber, setDayNumber] = useState<number>(1);
  const [dailyTarget, setDailyTarget] = useState<Country | null>(null);

  // Practice target
  const [practiceTarget, setPracticeTarget] = useState<Country | null>(null);

  // Guesses state
  const [dailyGuesses, setDailyGuesses] = useState<Guess[]>([]);
  const [practiceGuesses, setPracticeGuesses] = useState<Guess[]>([]);
  const [isDailyWon, setIsDailyWon] = useState(false);
  const [isPracticeWon, setIsPracticeWon] = useState(false);
  const [lastGuess, setLastGuess] = useState<Guess | null>(null);

  // Active game context based on mode
  const currentTarget = mode === 'daily' ? dailyTarget : practiceTarget;
  const currentGuesses = mode === 'daily' ? dailyGuesses : practiceGuesses;
  const isCurrentWon = mode === 'daily' ? isDailyWon : isPracticeWon;

  // Set of guessed country IDs for the active mode
  const guessedCountryIds = useMemo(() => {
    return new Set(currentGuesses.map(g => g.country.id));
  }, [currentGuesses]);

  // Load saved state on mount
  useEffect(() => {
    const today = getUtcDateString();
    const day = getDayNumber();
    const dTarget = getDailyTargetCountry(today);
    const pTarget = getRandomPracticeCountry(dTarget.id);

    setTodayUtc(today);
    setDayNumber(day);
    setDailyTarget(dTarget);
    setPracticeTarget(pTarget);

    const loadedSettings = loadSettings();
    const loadedStats = loadStats();
    setSettings(loadedSettings);
    setStats(loadedStats);

    // Restore daily state
    const savedDaily = loadDailyState(today);
    if (savedDaily && savedDaily.guesses.length > 0) {
      const reconstructed: Guess[] = [];
      savedDaily.guesses.forEach((id, idx) => {
        const country = getCountryById(id);
        if (country) {
          reconstructed.push(evaluateGuess(country, dTarget, idx + 1));
        }
      });
      setDailyGuesses(reconstructed);
      setIsDailyWon(savedDaily.isWon);
    }

    // Restore practice state
    const savedPractice = loadPracticeState();
    if (savedPractice && savedPractice.targetId) {
      const target = getCountryById(savedPractice.targetId);
      if (target) {
        setPracticeTarget(target);
        const reconstructed: Guess[] = [];
        savedPractice.guesses.forEach((id, idx) => {
          const country = getCountryById(id);
          if (country) {
            reconstructed.push(evaluateGuess(country, target, idx + 1));
          }
        });
        setPracticeGuesses(reconstructed);
        setIsPracticeWon(savedPractice.isWon);
      }
    }

    setMounted(true);
  }, []);

  // Handle a new guess
  const handleGuess = useCallback((country: Country) => {
    if (!currentTarget || isCurrentWon || guessedCountryIds.has(country.id)) return;

    const guessNum = currentGuesses.length + 1;
    const evaluated = evaluateGuess(country, currentTarget, guessNum);
    setLastGuess(evaluated);

    // Audio feedback
    playGuessSound(evaluated.proximityPercent, evaluated.isTarget, settings.soundEnabled);

    if (mode === 'daily' && dailyTarget) {
      const newGuesses = [...dailyGuesses, evaluated];
      const won = evaluated.isTarget;
      setDailyGuesses(newGuesses);

      if (won) {
        setIsDailyWon(true);
        const updatedStats = recordGameWin(newGuesses.length, true, todayUtc);
        setStats(updatedStats);
        setTimeout(() => setIsVictoryOpen(true), 600);
      }

      saveDailyState({
        date: todayUtc,
        targetId: dailyTarget.id,
        guesses: newGuesses.map(g => g.country.id),
        isWon: won
      });
    } else if (practiceTarget) {
      const newGuesses = [...practiceGuesses, evaluated];
      const won = evaluated.isTarget;
      setPracticeGuesses(newGuesses);

      if (won) {
        setIsPracticeWon(true);
        const updatedStats = recordGameWin(newGuesses.length, false);
        setStats(updatedStats);
        setTimeout(() => setIsVictoryOpen(true), 600);
      }

      savePracticeState({
        targetId: practiceTarget.id,
        guesses: newGuesses.map(g => g.country.id),
        isWon: won
      });
    }
  }, [
    currentTarget,
    isCurrentWon,
    guessedCountryIds,
    currentGuesses.length,
    settings.soundEnabled,
    mode,
    dailyTarget,
    dailyGuesses,
    todayUtc,
    practiceTarget,
    practiceGuesses
  ]);

  // Start a new Practice round
  const handleNewPracticeRound = useCallback(() => {
    const nextTarget = getRandomPracticeCountry(practiceTarget?.id);
    setPracticeTarget(nextTarget);
    setPracticeGuesses([]);
    setIsPracticeWon(false);
    setLastGuess(null);
    savePracticeState({
      targetId: nextTarget.id,
      guesses: [],
      isWon: false
    });
  }, [practiceTarget?.id]);

  // Update Settings
  const handleUpdateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Center globe on country clicked in dashboard or globe
  const handleSelectCountry = useCallback((country: Country) => {
    const guess = currentGuesses.find(g => g.country.id === country.id);
    if (guess) {
      setLastGuess(guess);
    }
  }, [currentGuesses]);

  if (!mounted || !currentTarget) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-sky-500/20 border-b-sky-400 animate-spin animate-reverse" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-300 animate-pulse">
          Loading Globle 🌍...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation Header */}
      <Header
        mode={mode}
        dayNumber={dayNumber}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewPracticeRound={handleNewPracticeRound}
        onToggleMode={m => setMode(m)}
      />

      {/* Main Interactive Stage */}
      <div className="relative flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
        {/* Fullscreen 3D Globe */}
        <div className="absolute inset-0 z-0">
          <GlobeView
            guesses={currentGuesses}
            lastGuess={lastGuess}
            targetCountry={isCurrentWon ? currentTarget : undefined}
            isWon={isCurrentWon}
            settings={settings}
            onCountrySelect={handleSelectCountry}
          />
        </div>

        {/* Floating Sidebar / Dashboard Panel */}
        <div
          className={`absolute top-4 left-4 bottom-4 z-20 w-[92vw] max-w-md sm:w-[420px] transition-transform duration-300 ease-out flex flex-col pointer-events-none ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+2rem)]'
          }`}
        >
          <div className="pointer-events-auto flex-1 flex flex-col gap-3 p-4 rounded-3xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 shadow-2xl overflow-hidden">
            {/* Country Autocomplete Search Input */}
            <CountryInput
              onGuess={handleGuess}
              guessedCountryIds={guessedCountryIds}
              isWon={isCurrentWon}
            />

            {/* Compact Heat Legend */}
            <HeatLegend unit={settings.unit} compact />

            {/* Scrollable Guesses Dashboard */}
            <div className="flex-1 overflow-y-auto pr-1">
              <GuessesDashboard
                guesses={currentGuesses}
                settings={settings}
                onSelectCountry={handleSelectCountry}
                isWon={isCurrentWon}
              />
            </div>

            {/* Bottom Victory or Practice Actions */}
            {isCurrentWon && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => setIsVictoryOpen(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>View Victory Summary</span>
                </button>

                {mode === 'practice' && (
                  <button
                    onClick={handleNewPracticeRound}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-indigo-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Next Country</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Toggle Button (Desktop & Mobile) */}
        <button
          onClick={() => setIsSidebarOpen(prev => !prev)}
          title={isSidebarOpen ? 'Hide Panel' : 'Show Panel'}
          aria-label={isSidebarOpen ? 'Hide Panel' : 'Show Panel'}
          className={`absolute top-6 z-20 p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-2xl backdrop-blur-md transition-all active:scale-95 ${
            isSidebarOpen ? 'left-[calc(92vw+1rem)] sm:left-[440px]' : 'left-4'
          }`}
        >
          {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Modals */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        unit={settings.unit}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        isWon={isCurrentWon}
        guesses={currentGuesses}
        dayNumber={dayNumber}
        unit={settings.unit}
        isDaily={mode === 'daily'}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        mode={mode}
        onToggleMode={m => setMode(m)}
      />

      <VictoryModal
        isOpen={isVictoryOpen}
        onClose={() => setIsVictoryOpen(false)}
        targetCountry={currentTarget}
        guesses={currentGuesses}
        dayNumber={dayNumber}
        settings={settings}
        isDaily={mode === 'daily'}
        onStartPractice={() => {
          setMode('practice');
          handleNewPracticeRound();
        }}
      />
    </div>
  );
}
