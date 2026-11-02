import rawCountries from '@/data/countries.json';
import { Country, Guess, HeatDetails } from '@/types';
import { calculateBearing, calculateHaversineDistanceKm, calculateProximityPercent, formatDistance, getHeatDetails, kmToMiles } from './geo';

export const allCountries: Country[] = rawCountries as Country[];

export const targetableCountries: Country[] = allCountries.filter(c => c.isTargetable);

const countryMap = new Map<string, Country>();
allCountries.forEach(c => {
  countryMap.set(c.id.toUpperCase(), c);
  countryMap.set(c.iso2.toUpperCase(), c);
});

export function getCountryById(id: string): Country | undefined {
  if (!id) return undefined;
  return countryMap.get(id.toUpperCase());
}

/**
 * Normalizes text for search (removes diacritics and lowercases).
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Searches countries with autocomplete suggestions, ranked by relevance.
 */
export function searchCountries(query: string, excludeIds: Set<string> = new Set()): Country[] {
  const normQuery = normalizeText(query);
  if (!normQuery) return [];

  const matches: { country: Country; score: number }[] = [];

  for (const country of allCountries) {
    if (excludeIds.has(country.id)) continue;

    const normName = normalizeText(country.name);
    const normIso2 = country.iso2.toLowerCase();
    const normIso3 = country.iso3.toLowerCase();
    const normOfficial = normalizeText(country.officialName);

    // Exact matches
    if (normIso2 === normQuery || normIso3 === normQuery) {
      matches.push({ country, score: 100 });
      continue;
    }
    if (normName === normQuery) {
      matches.push({ country, score: 95 });
      continue;
    }

    // Prefix matches
    if (normName.startsWith(normQuery)) {
      matches.push({ country, score: 80 - (normName.length - normQuery.length) * 0.5 });
      continue;
    }

    // Alias matches
    let aliasScore = 0;
    for (const alias of country.aliases) {
      const normAlias = normalizeText(alias);
      if (normAlias === normQuery) {
        aliasScore = Math.max(aliasScore, 90);
      } else if (normAlias.startsWith(normQuery)) {
        aliasScore = Math.max(aliasScore, 70);
      } else if (normAlias.includes(normQuery)) {
        aliasScore = Math.max(aliasScore, 50);
      }
    }

    if (aliasScore > 0) {
      matches.push({ country, score: aliasScore });
      continue;
    }

    // Substring in official name or name
    if (normName.includes(normQuery) || normOfficial.includes(normQuery)) {
      matches.push({ country, score: 40 });
    }
  }

  matches.sort((a, b) => b.score - a.score || a.country.name.localeCompare(b.country.name));

  return matches.slice(0, 8).map(m => m.country);
}

/**
 * Hash function for deterministic seed (Murmur-like 32-bit hash).
 */
function hashString(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Returns UTC Date string 'YYYY-MM-DD'.
 */
export function getUtcDateString(d: Date = new Date()): string {
  return d.toISOString().split('T')[0];
}

const GLOBLE_EPOCH = new Date('2022-01-01T00:00:00Z').getTime();

/**
 * Returns the day number since Globle epoch.
 */
export function getDayNumber(d: Date = new Date()): number {
  const utcMidnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.max(1, Math.floor((utcMidnight - GLOBLE_EPOCH) / (1000 * 60 * 60 * 24)));
}

/**
 * Deterministically picks today's daily target country based on UTC date string.
 */
export function getDailyTargetCountry(dateString: string = getUtcDateString()): Country {
  const hash = hashString(`globle-daily-${dateString}`);
  const index = hash % targetableCountries.length;
  return targetableCountries[index];
}

/**
 * Picks a random target country for Practice mode.
 */
export function getRandomPracticeCountry(excludeId?: string): Country {
  const available = excludeId ? targetableCountries.filter(c => c.id !== excludeId) : targetableCountries;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

/**
 * Evaluates a guess against the target country.
 */
export function evaluateGuess(
  guessedCountry: Country,
  targetCountry: Country,
  guessNumber: number
): Guess {
  const isTarget = guessedCountry.id === targetCountry.id;
  const distanceKm = isTarget
    ? 0
    : calculateHaversineDistanceKm(
        guessedCountry.lat,
        guessedCountry.lng,
        targetCountry.lat,
        targetCountry.lng
      );
  const distanceMiles = kmToMiles(distanceKm);
  const { compass, arrow, degrees } = isTarget
    ? { compass: '🎯', arrow: '🎯', degrees: 0 }
    : calculateBearing(
        guessedCountry.lat,
        guessedCountry.lng,
        targetCountry.lat,
        targetCountry.lng
      );
  const proximityPercent = calculateProximityPercent(distanceKm);
  const heat = getHeatDetails(distanceKm, isTarget);

  return {
    country: guessedCountry,
    distanceKm,
    distanceMiles,
    bearing: `${arrow} ${compass}`,
    bearingDegrees: degrees,
    proximityPercent,
    heat,
    isTarget,
    timestamp: Date.now(),
    guessNumber
  };
}

/**
 * Generates copyable Wordle-style emoji grid for sharing.
 */
export function generateShareText({
  dayNumber,
  isDaily,
  guesses,
  unit
}: {
  dayNumber: number;
  isDaily: boolean;
  guesses: Guess[];
  unit: 'km' | 'miles';
}): string {
  const title = isDaily ? `Globle #${dayNumber} 🌍` : `Globle Practice Round 🌍`;
  const count = guesses.length;
  const won = guesses.some(g => g.isTarget);
  
  // Find closest guess (excluding target itself if other guesses exist, or target)
  const nonTargetGuesses = guesses.filter(g => !g.isTarget);
  let closestGuess = nonTargetGuesses.length > 0
    ? nonTargetGuesses.reduce((min, g) => g.distanceKm < min.distanceKm ? g : min)
    : guesses[0];

  const closestText = closestGuess && !closestGuess.isTarget
    ? `Closest: ${formatDistance(closestGuess.distanceKm, unit)} ${closestGuess.heat.emoji}`
    : 'Solved on first try! 🎯';

  const emojiMap: Record<HeatDetails['level'], string> = {
    target: '🟩',
    crimson: '🟥',
    redOrange: '🟧',
    orange: '🟨',
    amber: '🟨',
    paleYellow: '⬜'
  };

  const emojiRow = guesses.map(g => emojiMap[g.heat.level]).join('');

  return [
    title,
    `Guesses: ${count} ${won ? '🏆' : ''}`,
    closestText,
    emojiRow,
    'Play at: globle-earth.vercel.app'
  ].join('\n');
}
