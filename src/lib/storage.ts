import { GameSettings, GameStats, StoredDailyState, StoredPracticeState } from '@/types';
import { getUtcDateString } from './gameEngine';

const DAILY_KEY = 'globle_daily_state_v1';
const PRACTICE_KEY = 'globle_practice_state_v1';
const STATS_KEY = 'globle_stats_v1';
const SETTINGS_KEY = 'globle_settings_v1';

export const defaultSettings: GameSettings = {
  unit: 'km',
  theme: 'dark',
  globeTexture: 'satellite',
  autoRotate: false,
  soundEnabled: true
};

export const defaultStats: GameStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastWonDate: null,
  guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
  practicePlayed: 0,
  practiceWon: 0
};

export function loadSettings(): GameSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function loadStats(): GameStats {
  if (typeof window === 'undefined') return defaultStats;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw);
    return {
      ...defaultStats,
      ...parsed,
      guessDistribution: {
        ...defaultStats.guessDistribution,
        ...(parsed.guessDistribution || {})
      }
    };
  } catch {
    return defaultStats;
  }
}

export function saveStats(stats: GameStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats to localStorage', e);
  }
}

export function recordGameWin(guessCount: number, isDaily: boolean, dateStr: string = getUtcDateString()): GameStats {
  const stats = loadStats();
  if (isDaily) {
    stats.played += 1;
    stats.won += 1;

    // Check streak
    if (stats.lastWonDate) {
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const yesterdayStr = getUtcDateString(yesterday);
      if (stats.lastWonDate === yesterdayStr) {
        stats.currentStreak += 1;
      } else if (stats.lastWonDate === dateStr) {
        // Already recorded today, no streak change
      } else {
        stats.currentStreak = 1;
      }
    } else {
      stats.currentStreak = 1;
    }

    if (stats.currentStreak > stats.maxStreak) {
      stats.maxStreak = stats.currentStreak;
    }
    stats.lastWonDate = dateStr;

    // Distribution: bucket 7+ into 7
    const bucket = Math.min(Math.max(guessCount, 1), 7);
    stats.guessDistribution[bucket] = (stats.guessDistribution[bucket] || 0) + 1;
  } else {
    stats.practicePlayed += 1;
    stats.practiceWon += 1;
  }

  saveStats(stats);
  return stats;
}

export function loadDailyState(currentUtcDate: string): StoredDailyState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return null;
    const data: StoredDailyState = JSON.parse(raw);
    if (data.date === currentUtcDate) {
      return data;
    }
    return null; // Expired date, start fresh for new day
  } catch {
    return null;
  }
}

export function saveDailyState(state: StoredDailyState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save daily state to localStorage', e);
  }
}

export function loadPracticeState(): StoredPracticeState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PRACTICE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePracticeState(state: StoredPracticeState | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!state) {
      localStorage.removeItem(PRACTICE_KEY);
    } else {
      localStorage.setItem(PRACTICE_KEY, JSON.stringify(state));
    }
  } catch (e) {
    console.error('Failed to save practice state to localStorage', e);
  }
}
