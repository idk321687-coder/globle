export interface Country {
  id: string; // ISO3
  name: string; // Display name, e.g. "United States"
  officialName: string;
  iso2: string; // "US"
  iso3: string; // "USA"
  flag: string; // "🇺🇸"
  continent: string;
  subregion?: string;
  lat: number;
  lng: number;
  aliases: string[];
  isTargetable: boolean;
}

export type HeatLevel = 'target' | 'crimson' | 'redOrange' | 'orange' | 'amber' | 'paleYellow';

export interface HeatDetails {
  level: HeatLevel;
  hex: string;
  label: string;
  emoji: string;
  badgeClass: string;
  textClass: string;
  borderClass: string;
}

export interface Guess {
  country: Country;
  distanceKm: number;
  distanceMiles: number;
  bearing: string; // Compass direction arrow, e.g. "NE", "S"
  bearingDegrees: number;
  proximityPercent: number; // 0 - 100%
  heat: HeatDetails;
  isTarget: boolean;
  timestamp: number;
  guessNumber: number;
}

export type GameMode = 'daily' | 'practice';

export interface GameSettings {
  unit: 'km' | 'miles';
  theme: 'dark' | 'light';
  globeTexture: 'dark' | 'satellite' | 'night';
  autoRotate: boolean;
  soundEnabled: boolean;
}

export interface GameStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  lastWonDate: string | null;
  guessDistribution: Record<number, number>; // 1: count, 2: count, etc.
  practicePlayed: number;
  practiceWon: number;
}

export interface StoredDailyState {
  date: string; // 'YYYY-MM-DD'
  targetId: string;
  guesses: string[]; // country ISO3 array
  isWon: boolean;
  completedAt?: number;
}

export interface StoredPracticeState {
  targetId: string;
  guesses: string[]; // country ISO3 array
  isWon: boolean;
}
