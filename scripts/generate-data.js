const fs = require('fs');
const path = require('path');

const rawGeoJsonPath = path.join(__dirname, '../public/datasets/ne_50m_admin_0_countries.geojson');
const outGeoJsonPath = path.join(__dirname, '../public/datasets/countries.geojson');
const outDataJsonPath = path.join(__dirname, '../src/data/countries.json');

const raw = JSON.parse(fs.readFileSync(rawGeoJsonPath, 'utf8'));

// Helper for Flag emoji from ISO2
function getFlagEmoji(iso2) {
  if (!iso2 || iso2.length !== 2) return '🌐';
  const codePoints = iso2.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Special overrides for names, ISOs, and aliases
const overrides = {
  'United States of America': {
    name: 'United States',
    iso2: 'US',
    iso3: 'USA',
    aliases: ['usa', 'us', 'america', 'united states', 'united states of america', 'u.s.a.', 'u.s.']
  },
  'United Kingdom': {
    name: 'United Kingdom',
    iso2: 'GB',
    iso3: 'GBR',
    aliases: ['uk', 'britain', 'great britain', 'england', 'scotland', 'wales', 'northern ireland', 'united kingdom', 'u.k.']
  },
  'France': {
    name: 'France',
    iso2: 'FR',
    iso3: 'FRA',
    aliases: ['france', 'french republic']
  },
  'Norway': {
    name: 'Norway',
    iso2: 'NO',
    iso3: 'NOR',
    aliases: ['norway']
  },
  'Russian Federation': {
    name: 'Russia',
    iso2: 'RU',
    iso3: 'RUS',
    aliases: ['russia', 'russian federation']
  },
  'Dem. Rep. Korea': {
    name: 'North Korea',
    iso2: 'KP',
    iso3: 'PRK',
    aliases: ['north korea', 'dprk', 'korea north', 'democratic people\'s republic of korea']
  },
  'Republic of Korea': {
    name: 'South Korea',
    iso2: 'KR',
    iso3: 'KOR',
    aliases: ['south korea', 'korea south', 'republic of korea', 'rok']
  },
  'Czech Republic': {
    name: 'Czechia',
    iso2: 'CZ',
    iso3: 'CZE',
    aliases: ['czechia', 'czech republic']
  },
  'Bosnia and Herz.': {
    name: 'Bosnia and Herzegovina',
    iso2: 'BA',
    iso3: 'BIH',
    aliases: ['bosnia', 'bosnia and herzegovina', 'bosnia and herz.']
  },
  'Democratic Republic of the Congo': {
    name: 'DR Congo',
    iso2: 'CD',
    iso3: 'COD',
    aliases: ['dr congo', 'drc', 'democratic republic of the congo', 'congo kinshasa', 'zaire']
  },
  'Republic of the Congo': {
    name: 'Republic of the Congo',
    iso2: 'CG',
    iso3: 'COG',
    aliases: ['congo', 'republic of the congo', 'congo brazzaville']
  },
  'Central African Rep.': {
    name: 'Central African Republic',
    iso2: 'CF',
    iso3: 'CAF',
    aliases: ['central african republic', 'car']
  },
  'Dominican Rep.': {
    name: 'Dominican Republic',
    iso2: 'DO',
    iso3: 'DOM',
    aliases: ['dominican republic', 'dom rep']
  },
  'Eq. Guinea': {
    name: 'Equatorial Guinea',
    iso2: 'GQ',
    iso3: 'GNQ',
    aliases: ['equatorial guinea']
  },
  'eSwatini': {
    name: 'Eswatini',
    iso2: 'SZ',
    iso3: 'SWZ',
    aliases: ['eswatini', 'swaziland']
  },
  'Côte d\'Ivoire': {
    name: 'Ivory Coast',
    iso2: 'CI',
    iso3: 'CIV',
    aliases: ['ivory coast', 'cote d\'ivoire', 'cote divoire']
  },
  'Taiwan': {
    name: 'Taiwan',
    iso2: 'TW',
    iso3: 'TWN',
    aliases: ['taiwan', 'republic of china', 'chinese taipei']
  },
  'Kosovo': {
    name: 'Kosovo',
    iso2: 'XK',
    iso3: 'KOS',
    aliases: ['kosovo']
  },
  'Northern Cyprus': {
    name: 'Northern Cyprus',
    iso2: 'CY',
    iso3: 'CYN',
    aliases: ['northern cyprus', 'north cyprus', 'trnc']
  },
  'Somaliland': {
    name: 'Somaliland',
    iso2: 'SO',
    iso3: 'SOL',
    aliases: ['somaliland']
  },
  'Timor-Leste': {
    name: 'East Timor',
    iso2: 'TL',
    iso3: 'TLS',
    aliases: ['east timor', 'timor-leste', 'timor leste']
  },
  'Syria': {
    name: 'Syria',
    iso2: 'SY',
    iso3: 'SYR',
    aliases: ['syria', 'syrian arab republic']
  },
  'Iran': {
    name: 'Iran',
    iso2: 'IR',
    iso3: 'IRN',
    aliases: ['iran', 'islamic republic of iran']
  },
  'Vatican': {
    name: 'Vatican City',
    iso2: 'VA',
    iso3: 'VAT',
    aliases: ['vatican', 'vatican city', 'holy see']
  },
  'Palestine': {
    name: 'Palestine',
    iso2: 'PS',
    iso3: 'PSE',
    aliases: ['palestine', 'state of palestine', 'west bank', 'gaza']
  },
  'Myanmar': {
    name: 'Myanmar',
    iso2: 'MM',
    iso3: 'MMR',
    aliases: ['myanmar', 'burma']
  },
  'United Arab Emirates': {
    name: 'United Arab Emirates',
    iso2: 'AE',
    iso3: 'ARE',
    aliases: ['united arab emirates', 'uae', 'emirates', 'dubai', 'abu dhabi']
  },
  'Papua New Guinea': {
    name: 'Papua New Guinea',
    iso2: 'PG',
    iso3: 'PNG',
    aliases: ['papua new guinea', 'png']
  },
  'New Zealand': {
    name: 'New Zealand',
    iso2: 'NZ',
    iso3: 'NZL',
    aliases: ['new zealand', 'nz', 'aotearoa']
  },
  'South Africa': {
    name: 'South Africa',
    iso2: 'ZA',
    iso3: 'ZAF',
    aliases: ['south africa', 'rsa']
  },
  'North Macedonia': {
    name: 'North Macedonia',
    iso2: 'MK',
    iso3: 'MKD',
    aliases: ['north macedonia', 'macedonia', 'fyrom']
  },
  'Cabo Verde': {
    name: 'Cape Verde',
    iso2: 'CV',
    iso3: 'CPV',
    aliases: ['cape verde', 'cabo verde']
  },
  'São Tomé and Principe': {
    name: 'Sao Tome and Principe',
    iso2: 'ST',
    iso3: 'STP',
    aliases: ['sao tome and principe', 'sao tome', 'são tomé and príncipe']
  },
  'Federated States of Micronesia': {
    name: 'Micronesia',
    iso2: 'FM',
    iso3: 'FSM',
    aliases: ['micronesia', 'federated states of micronesia']
  },
  'St. Vin. and Gren.': {
    name: 'Saint Vincent and the Grenadines',
    iso2: 'VC',
    iso3: 'VCT',
    aliases: ['saint vincent and the grenadines', 'saint vincent', 'st vincent']
  },
  'St. Kitts and Nevis': {
    name: 'Saint Kitts and Nevis',
    iso2: 'KN',
    iso3: 'KNA',
    aliases: ['saint kitts and nevis', 'saint kitts', 'st kitts']
  },
  'Saint Lucia': {
    name: 'Saint Lucia',
    iso2: 'LC',
    iso3: 'LCA',
    aliases: ['saint lucia', 'st lucia']
  },
  'Antigua and Barb.': {
    name: 'Antigua and Barbuda',
    iso2: 'AG',
    iso3: 'ATG',
    aliases: ['antigua and barbuda', 'antigua', 'barbuda']
  },
  'Trinidad and Tobago': {
    name: 'Trinidad and Tobago',
    iso2: 'TT',
    iso3: 'TTO',
    aliases: ['trinidad and tobago', 'trinidad']
  },
  'Solomon Is.': {
    name: 'Solomon Islands',
    iso2: 'SB',
    iso3: 'SLB',
    aliases: ['solomon islands', 'solomons']
  },
  'Marshall Is.': {
    name: 'Marshall Islands',
    iso2: 'MH',
    iso3: 'MHL',
    aliases: ['marshall islands']
  }
};

const unplayable = [
  'Antarctica',
  'Fr. S. Antarctic Lands',
  'Heard I. and McDonald Is.',
  'Heard I. and McDonald Islands',
  'Clipperton I.',
  'Coral Sea Is.',
  'Ashmore and Cartier Is.',
  'Ashmore and Cartier Islands',
  'Bajo Nuevo Bank',
  'Serranilla Bank',
  'Scarborough Reef',
  'Siachen Glacier',
  'Bir Tawil',
  'Indian Ocean Territories',
  'South Georgia and the Islands'
];

function roundCoord(c) {
  if (typeof c === 'number') return Math.round(c * 10000) / 10000;
  return c.map(roundCoord);
}

const countriesMetadata = [];
const seenCodes = new Set();

const cleanedFeatures = raw.features.map(f => {
  const p = f.properties;
  
  let key = p.NAME;
  let override = overrides[p.ADMIN] || overrides[p.NAME] || overrides[p.NAME_LONG];

  let iso3 = override?.iso3 || ((p.ADM0_A3 && p.ADM0_A3 !== '-99') ? p.ADM0_A3 : ((p.ISO_A3 && p.ISO_A3 !== '-99') ? p.ISO_A3 : p.SOV_A3));
  let iso2 = override?.iso2 || ((p.ISO_A2 && p.ISO_A2 !== '-99') ? p.ISO_A2 : (p.POSTAL || p.FIPS_10_ || ''));
  if (iso2 === 'CN-TW') iso2 = 'TW';
  if (iso2.length > 2) iso2 = iso2.slice(0, 2);

  let name = override?.name || p.NAME_LONG || p.NAME || p.ADMIN;
  let officialName = p.FORMAL_EN || p.ADMIN || name;
  let continent = p.CONTINENT;
  let subregion = p.SUBREGION;
  let lat = Math.round(p.LABEL_Y * 10000) / 10000;
  let lng = Math.round(p.LABEL_X * 10000) / 10000;

  // Build alias list
  const baseAliases = [
    name.toLowerCase(),
    (p.ADMIN || '').toLowerCase(),
    (p.NAME || '').toLowerCase(),
    (p.NAME_LONG || '').toLowerCase(),
    iso2.toLowerCase(),
    iso3.toLowerCase()
  ];
  if (override?.aliases) {
    baseAliases.push(...override.aliases);
  }
  // Strip punctuation and accents for search matching
  const aliases = Array.from(new Set(baseAliases.filter(Boolean).map(a => a.trim())));

  const isExcluded = unplayable.includes(p.NAME) || unplayable.includes(p.ADMIN);
  const isTargetable = !isExcluded && (p.POP_EST > 50000 || ['ISL', 'BRN', 'MNE', 'LUX', 'MLT', 'CPV', 'BLZ', 'MDV', 'BHS', 'BRB', 'VUT', 'WSM', 'LCA', 'STP', 'SYC', 'GRD', 'VCT', 'ATG', 'AND', 'DMA', 'KNA', 'MCO', 'LIE', 'SMR', 'PLW', 'TUV', 'NRU'].includes(iso3));

  const countryItem = {
    id: iso3,
    name,
    officialName,
    iso2,
    iso3,
    flag: getFlagEmoji(iso2),
    continent,
    subregion,
    lat,
    lng,
    aliases,
    isTargetable
  };

  if (!seenCodes.has(iso3)) {
    countriesMetadata.push(countryItem);
    seenCodes.add(iso3);
  }

  return {
    type: 'Feature',
    id: iso3,
    properties: {
      id: iso3,
      name,
      iso2,
      iso3,
      continent,
      lat,
      lng
    },
    geometry: {
      type: f.geometry.type,
      coordinates: roundCoord(f.geometry.coordinates)
    }
  };
});

// Sort countries alphabetically by name
countriesMetadata.sort((a, b) => a.name.localeCompare(b.name));

const cleanedGeoJson = {
  type: 'FeatureCollection',
  features: cleanedFeatures
};

// Write files
fs.mkdirSync(path.dirname(outDataJsonPath), { recursive: true });
fs.writeFileSync(outDataJsonPath, JSON.stringify(countriesMetadata, null, 2), 'utf8');
fs.writeFileSync(outGeoJsonPath, JSON.stringify(cleanedGeoJson), 'utf8');

console.log('✅ Generated clean countries.json with', countriesMetadata.length, 'countries');
console.log('Targetable countries count:', countriesMetadata.filter(c => c.isTargetable).length);
console.log('✅ Generated clean countries.geojson with', cleanedFeatures.length, 'features');
