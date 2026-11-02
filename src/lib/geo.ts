import { HeatDetails, HeatLevel } from '@/types';

const EARTH_RADIUS_KM = 6371;
const KM_TO_MILES = 0.621371;
const MAX_EARTH_DISTANCE_KM = 20015; // Half of Earth circumference

/**
 * Calculates Haversine great-circle distance between two coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;
  
  return Math.round(distance);
}

/**
 * Converts kilometers to miles.
 */
export function kmToMiles(km: number): number {
  return Math.round(km * KM_TO_MILES);
}

/**
 * Computes initial compass bearing from point 1 to point 2.
 */
export function calculateBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): { degrees: number; compass: string; arrow: string } {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lng2 - lng1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  const degrees = Math.round((toDeg(θ) + 360) % 360);

  const directions = [
    { label: 'N', arrow: '↑' },
    { label: 'NE', arrow: '↗' },
    { label: 'E', arrow: '→' },
    { label: 'SE', arrow: '↘' },
    { label: 'S', arrow: '↓' },
    { label: 'SW', arrow: '↙' },
    { label: 'W', arrow: '←' },
    { label: 'NW', arrow: '↖' }
  ];

  const index = Math.round(degrees / 45) % 8;
  const { label, arrow } = directions[index];

  return { degrees, compass: label, arrow };
}

/**
 * Proximity percentage from 0 to 100%.
 */
export function calculateProximityPercent(distanceKm: number): number {
  if (distanceKm <= 0) return 100;
  const ratio = Math.max(0, 1 - distanceKm / MAX_EARTH_DISTANCE_KM);
  return Math.round(ratio * 100);
}

/**
 * Standard Globle Heat Map Palette:
 * - 🎯 Target Found: Bright Emerald Green (#10b981)
 * - 🔥 Extremely Close (< 1,000 km): Deep Ruby / Crimson Red (#c62828)
 * - 🟠 Very Close (1,000 – 2,500 km): Bright Red-Orange (#e64a19)
 * - 🟡 Close (2,500 – 5,000 km): Vibrant Orange (#fb8c00)
 * - 🌾 Moderate (5,000 – 8,000 km): Yellow-Orange / Warm Amber (#fbc02d)
 * - ❄️ Far (> 8,000 km): Pale Yellow or Beige (#fef08a)
 */
export function getHeatDetails(distanceKm: number, isTarget: boolean): HeatDetails {
  if (isTarget || distanceKm === 0) {
    return {
      level: 'target',
      hex: '#10b981',
      label: 'Target Country!',
      emoji: '🎯',
      badgeClass: 'bg-emerald-500 text-white shadow-emerald-500/20',
      textClass: 'text-emerald-500 dark:text-emerald-400',
      borderClass: 'border-emerald-500'
    };
  }

  if (distanceKm < 1000) {
    return {
      level: 'crimson',
      hex: '#c62828',
      label: 'Extremely Close',
      emoji: '🔥',
      badgeClass: 'bg-red-700 text-white shadow-red-700/20',
      textClass: 'text-red-700 dark:text-red-400',
      borderClass: 'border-red-700'
    };
  }

  if (distanceKm < 2500) {
    return {
      level: 'redOrange',
      hex: '#e64a19',
      label: 'Very Close',
      emoji: '🟠',
      badgeClass: 'bg-orange-600 text-white shadow-orange-600/20',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-600'
    };
  }

  if (distanceKm < 5000) {
    return {
      level: 'orange',
      hex: '#fb8c00',
      label: 'Close',
      emoji: '🟡',
      badgeClass: 'bg-amber-500 text-white shadow-amber-500/20',
      textClass: 'text-amber-500 dark:text-amber-400',
      borderClass: 'border-amber-500'
    };
  }

  if (distanceKm < 8000) {
    return {
      level: 'amber',
      hex: '#fbc02d',
      label: 'Moderate',
      emoji: '🌾',
      badgeClass: 'bg-yellow-400 text-stone-900 shadow-yellow-400/20',
      textClass: 'text-yellow-600 dark:text-yellow-400',
      borderClass: 'border-yellow-400'
    };
  }

  return {
    level: 'paleYellow',
    hex: '#fef08a',
    label: 'Far Away',
    emoji: '❄️',
    badgeClass: 'bg-yellow-100 text-stone-800 border border-yellow-300 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800',
    textClass: 'text-yellow-700 dark:text-yellow-300',
    borderClass: 'border-yellow-200'
  };
}

/**
 * Format distance with unit and commas.
 */
export function formatDistance(distanceKm: number, unit: 'km' | 'miles'): string {
  if (unit === 'miles') {
    return `${kmToMiles(distanceKm).toLocaleString()} mi`;
  }
  return `${distanceKm.toLocaleString()} km`;
}
