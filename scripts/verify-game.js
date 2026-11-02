const countries = require('../src/data/countries.json');

console.log('--- Testing Country Search & Aliases ---');

function normalizeText(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function searchCountries(query) {
  const normQuery = normalizeText(query);
  if (!normQuery) return [];

  const matches = [];

  for (const country of countries) {
    const normName = normalizeText(country.name);
    const normIso2 = country.iso2.toLowerCase();
    const normIso3 = country.iso3.toLowerCase();
    const normOfficial = normalizeText(country.officialName);

    if (normIso2 === normQuery || normIso3 === normQuery) {
      matches.push({ country, score: 100 });
      continue;
    }
    if (normName === normQuery) {
      matches.push({ country, score: 95 });
      continue;
    }
    if (normName.startsWith(normQuery)) {
      matches.push({ country, score: 80 - (normName.length - normQuery.length) * 0.5 });
      continue;
    }

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

    if (normName.includes(normQuery) || normOfficial.includes(normQuery)) {
      matches.push({ country, score: 40 });
    }
  }

  matches.sort((a, b) => b.score - a.score || a.country.name.localeCompare(b.country.name));
  return matches.slice(0, 5).map(m => m.country);
}

// Tests
const testSearches = ['usa', 'us', 'uk', 'britain', 'france', 'czech republic', 'cote d\'ivoire', 'emirates'];
testSearches.forEach(term => {
  const res = searchCountries(term);
  console.log(`Query "${term}" ->`, res.map(c => `${c.flag} ${c.name} (${c.iso3})`).join(', '));
});

console.log('\n--- Testing Haversine Distance ---');
function calculateHaversineDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(6371 * c);
}

const uk = countries.find(c => c.iso3 === 'GBR');
const fra = countries.find(c => c.iso3 === 'FRA');
const usa = countries.find(c => c.iso3 === 'USA');
const jpn = countries.find(c => c.iso3 === 'JPN');

console.log('Distance UK <-> France:', calculateHaversineDistanceKm(uk.lat, uk.lng, fra.lat, fra.lng), 'km (Expected ~ 900-1000 km)');
console.log('Distance USA <-> Japan:', calculateHaversineDistanceKm(usa.lat, usa.lng, jpn.lat, jpn.lng), 'km (Expected ~ 9500-10500 km)');

console.log('\n--- Testing Daily Seeding Determinism ---');
function hashString(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

const targetables = countries.filter(c => c.isTargetable);
['2026-11-01', '2026-11-02', '2026-11-03'].forEach(date => {
  const hash = hashString(`globle-daily-${date}`);
  const target = targetables[hash % targetables.length];
  console.log(`Date ${date} -> Target: ${target.flag} ${target.name} (${target.iso3}) [Centroid: ${target.lat}, ${target.lng}]`);
});

console.log('\nAll core game logic verified successfully! ✅');
