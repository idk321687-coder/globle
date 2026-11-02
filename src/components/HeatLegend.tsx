'use client';

import React from 'react';

interface HeatLegendProps {
  unit: 'km' | 'miles';
  compact?: boolean;
}

export default function HeatLegend({ unit, compact = false }: HeatLegendProps) {
  const tiers = [
    {
      emoji: '🎯',
      label: 'Target Country',
      range: '0 km',
      rangeMiles: '0 mi',
      color: '#10b981',
      bgClass: 'bg-emerald-500'
    },
    {
      emoji: '🔥',
      label: 'Extremely Close',
      range: '< 1,000 km',
      rangeMiles: '< 620 mi',
      color: '#c62828',
      bgClass: 'bg-red-700'
    },
    {
      emoji: '🟠',
      label: 'Very Close',
      range: '1,000 – 2,500 km',
      rangeMiles: '620 – 1,550 mi',
      color: '#e64a19',
      bgClass: 'bg-orange-600'
    },
    {
      emoji: '🟡',
      label: 'Close',
      range: '2,500 – 5,000 km',
      rangeMiles: '1,550 – 3,100 mi',
      color: '#fb8c00',
      bgClass: 'bg-amber-500'
    },
    {
      emoji: '🌾',
      label: 'Moderate',
      range: '5,000 – 8,000 km',
      rangeMiles: '3,100 – 4,970 mi',
      color: '#fbc02d',
      bgClass: 'bg-yellow-400'
    },
    {
      emoji: '❄️',
      label: 'Far Away',
      range: '> 8,000 km',
      rangeMiles: '> 4,970 mi',
      color: '#fef08a',
      bgClass: 'bg-yellow-100 border border-yellow-300'
    }
  ];

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-1 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm text-[11px] overflow-x-auto">
        <span className="text-slate-400 font-semibold px-1">Heat:</span>
        <div className="flex items-center gap-1.5">
          {tiers.map(t => (
            <div
              key={t.label}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/70 border border-slate-700/50"
              title={`${t.label}: ${unit === 'miles' ? t.rangeMiles : t.range}`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: t.color }}
              />
              <span className="font-medium text-slate-300">{t.emoji}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {tiers.map(tier => (
        <div
          key={tier.label}
          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800"
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0 ${tier.bgClass}`}
          >
            <span>{tier.emoji}</span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">
              {tier.label}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {unit === 'miles' ? tier.rangeMiles : tier.range}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
