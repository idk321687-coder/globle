'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Country, GameSettings, Guess } from '@/types';
import { getCountryById } from '@/lib/gameEngine';
import { formatDistance } from '@/lib/geo';
import { Compass, RotateCw, ZoomIn, ZoomOut, Eye, Sparkles } from 'lucide-react';

interface GlobeViewProps {
  guesses: Guess[];
  lastGuess: Guess | null;
  targetCountry?: Country;
  isWon: boolean;
  settings: GameSettings;
  onCountrySelect?: (country: Country) => void;
}

interface GeoJsonFeature {
  type: string;
  id: string;
  properties: {
    id: string;
    name: string;
    iso2: string;
    iso3: string;
    continent: string;
    lat: number;
    lng: number;
  };
  geometry: {
    type: string;
    coordinates: unknown[];
  };
}

export default function GlobeView({
  guesses,
  lastGuess,
  targetCountry,
  isWon,
  settings,
  onCountrySelect
}: GlobeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeInstanceRef = useRef<any>(null);
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonFeature[]>([]);
  const [hoveredFeature, setHoveredFeature] = useState<GeoJsonFeature | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(false);

  // Map guessed country IDs to their Guess details
  const guessMap = useMemo(() => {
    const map = new Map<string, Guess>();
    guesses.forEach(g => {
      map.set(g.country.id.toUpperCase(), g);
      map.set(g.country.iso3.toUpperCase(), g);
      if (g.country.iso2) {
        map.set(g.country.iso2.toUpperCase(), g);
      }
    });
    return map;
  }, [guesses]);

  // Load GeoJSON dataset
  useEffect(() => {
    let active = true;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    fetch(`${basePath}/datasets/countries.geojson`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load countries geojson');
        return res.json();
      })
      .then(data => {
        if (active) {
          setGeoJsonData(data.features || []);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('Error loading GeoJSON:', err);
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Initialize Globe
  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    let isMounted = true;
    let globe: any = null;

    import('globe.gl').then(GlobeModule => {
      if (!isMounted || !containerRef.current) return;
      const Globe = GlobeModule.default;

      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      globe = new Globe(container)
        .width(width)
        .height(height)
        .backgroundColor('rgba(0,0,0,0)')
        .showAtmosphere(true)
        .atmosphereColor('#38bdf8')
        .atmosphereAltitude(0.18);

      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      const textureUrl =
        settings.globeTexture === 'satellite'
          ? `${basePath}/textures/earth-blue-marble.jpg`
          : `${basePath}/textures/earth-dark.jpg`;

      globe.globeImageUrl(textureUrl);

      // Controls
      const controls = globe.controls();
      if (controls) {
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.rotateSpeed = 0.6;
        controls.zoomSpeed = 0.8;
        controls.autoRotate = isAutoRotating;
        controls.autoRotateSpeed = 0.45;
        controls.minDistance = 120;
        controls.maxDistance = 600;

        // Auto-pause rotation when user interacts with the globe
        controls.addEventListener('start', () => {
          setIsAutoRotating(false);
          controls.autoRotate = false;
        });
      }

      // Initial point of view
      globe.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 0);

      globeInstanceRef.current = globe;

      // Handle window resizing
      const handleResize = () => {
        if (containerRef.current && globe) {
          globe.width(containerRef.current.clientWidth);
          globe.height(containerRef.current.clientHeight);
        }
      };

      const resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(container);

      // Save resize observer cleanup on globe
      globe._cleanup = () => {
        resizeObserver.disconnect();
      };
    });

    return () => {
      isMounted = false;
      if (globeInstanceRef.current) {
        if (globeInstanceRef.current._cleanup) {
          globeInstanceRef.current._cleanup();
        }
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        globeInstanceRef.current = null;
      }
    };
  }, [settings.globeTexture]);

  // Update autoRotate when setting or state changes
  useEffect(() => {
    if (globeInstanceRef.current) {
      const controls = globeInstanceRef.current.controls();
      if (controls) {
        controls.autoRotate = isAutoRotating;
      }
    }
  }, [isAutoRotating]);

  // Update polygon data and styling when geojson, guesses, or target changes
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe || geoJsonData.length === 0) return;

    globe
      .polygonsData(geoJsonData)
      .polygonCapColor((d: GeoJsonFeature) => {
        const id = (d.id || d.properties.iso3 || '').toUpperCase();
        const guess = guessMap.get(id);

        if (guess) {
          return guess.heat.hex;
        }

        if (isWon && targetCountry && (id === targetCountry.id || id === targetCountry.iso3)) {
          return '#10b981'; // Emerald Green for target win
        }

        // Unvisited countries
        return 'rgba(255, 255, 255, 0.06)';
      })
      .polygonSideColor((d: GeoJsonFeature) => {
        const id = (d.id || d.properties.iso3 || '').toUpperCase();
        const guess = guessMap.get(id);
        if (guess) {
          return `${guess.heat.hex}88`;
        }
        return 'rgba(0, 0, 0, 0.15)';
      })
      .polygonStrokeColor((d: GeoJsonFeature) => {
        const isHovered = hoveredFeature && hoveredFeature.id === d.id;
        if (isHovered) return '#ffffff';
        const id = (d.id || d.properties.iso3 || '').toUpperCase();
        if (guessMap.has(id)) {
          return 'rgba(255, 255, 255, 0.85)';
        }
        return 'rgba(255, 255, 255, 0.2)';
      })
      .polygonAltitude((d: GeoJsonFeature) => {
        const id = (d.id || d.properties.iso3 || '').toUpperCase();
        const isHovered = hoveredFeature && hoveredFeature.id === d.id;
        if (guessMap.has(id) || (isWon && targetCountry && id === targetCountry.id)) {
          return isHovered ? 0.025 : 0.015;
        }
        return isHovered ? 0.01 : 0.003;
      })
      .polygonLabel((d: GeoJsonFeature) => {
        const p = d.properties;
        const id = (d.id || p.iso3 || '').toUpperCase();
        const guess = guessMap.get(id);
        const country = getCountryById(id) || {
          name: p.name,
          flag: '🌐'
        };

        if (guess) {
          return `
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(8px); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); font-family: system-ui, sans-serif; min-width: 160px; color: #fff;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; margin-bottom: 4px;">
                <span style="font-size: 18px;">${country.flag}</span>
                <span>${country.name}</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #94a3b8;">
                <span>Distance:</span>
                <span style="color: ${guess.heat.hex}; font-weight: 700;">
                  ${guess.isTarget ? '🎯 Secret Country!' : formatDistance(guess.distanceKm, settings.unit)}
                </span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.1);">
                <span style="color: ${guess.heat.hex};">${guess.heat.emoji} ${guess.heat.label}</span>
                <span>Guess #${guess.guessNumber}</span>
              </div>
            </div>
          `;
        }

        return `
          <div style="background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); font-family: system-ui, sans-serif; color: #fff; font-size: 13px;">
            <span style="margin-right: 6px;">${country.flag}</span>
            <span style="font-weight: 600;">${country.name}</span>
          </div>
        `;
      })
      .onPolygonHover((feature: GeoJsonFeature | null) => {
        setHoveredFeature(feature);
        if (containerRef.current) {
          containerRef.current.style.cursor = feature ? 'pointer' : 'default';
        }
      })
      .onPolygonClick((feature: GeoJsonFeature) => {
        if (!feature) return;
        setIsAutoRotating(false);
        if (globe.controls()) {
          globe.controls().autoRotate = false;
        }

        const id = (feature.id || feature.properties.iso3 || '').toUpperCase();
        const country = getCountryById(id);
        if (country && onCountrySelect) {
          onCountrySelect(country);
        }
      });
  }, [geoJsonData, guessMap, hoveredFeature, isWon, targetCountry, settings.unit, onCountrySelect]);

  // Fly to country when a new guess occurs and stop rotating there
  useEffect(() => {
    if (!lastGuess || !globeInstanceRef.current) return;
    const { lat, lng } = lastGuess.country;

    // Stop auto-rotation immediately so it stays on the guessed country
    setIsAutoRotating(false);
    const controls = globeInstanceRef.current.controls();
    if (controls) {
      controls.autoRotate = false;
    }

    // Animate camera to country coordinates
    globeInstanceRef.current.pointOfView(
      {
        lat,
        lng,
        altitude: 1.8
      },
      1100
    );
  }, [lastGuess]);

  // Control handlers
  const handleZoomIn = useCallback(() => {
    if (!globeInstanceRef.current) return;
    const current = globeInstanceRef.current.pointOfView();
    globeInstanceRef.current.pointOfView(
      { ...current, altitude: Math.max(1.1, current.altitude - 0.4) },
      400
    );
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!globeInstanceRef.current) return;
    const current = globeInstanceRef.current.pointOfView();
    globeInstanceRef.current.pointOfView(
      { ...current, altitude: Math.min(3.5, current.altitude + 0.4) },
      400
    );
  }, []);

  const handleResetView = useCallback(() => {
    if (!globeInstanceRef.current) return;
    globeInstanceRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 800);
  }, []);

  const toggleAutoRotate = useCallback(() => {
    setIsAutoRotating(prev => !prev);
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden touch-none">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-emerald-500/20 border-b-emerald-400 animate-spin animate-reverse" />
          </div>
          <p className="text-sm font-medium text-slate-200 animate-pulse tracking-wide">
            Rendering 3D Globe & Polygons...
          </p>
        </div>
      )}

      {/* Floating Globe Action Controls */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom In"
          className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/60 shadow-lg backdrop-blur-md transition-all active:scale-95 hover:border-slate-500"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom Out"
          className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/60 shadow-lg backdrop-blur-md transition-all active:scale-95 hover:border-slate-500"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleResetView}
          title="Reset Center"
          aria-label="Reset Center"
          className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/60 shadow-lg backdrop-blur-md transition-all active:scale-95 hover:border-slate-500"
        >
          <Compass className="w-5 h-5" />
        </button>
        <button
          onClick={toggleAutoRotate}
          title={isAutoRotating ? 'Stop Rotation' : 'Auto Rotate'}
          aria-label={isAutoRotating ? 'Stop Rotation' : 'Auto Rotate'}
          className={`p-2.5 rounded-xl border shadow-lg backdrop-blur-md transition-all active:scale-95 ${
            isAutoRotating
              ? 'bg-indigo-600/90 text-white border-indigo-400/50'
              : 'bg-slate-900/85 hover:bg-slate-800 text-slate-300 border-slate-700/60 hover:border-slate-500'
          }`}
        >
          <RotateCw className={`w-5 h-5 ${isAutoRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
        </button>
      </div>

      {/* Target Revealed Badge on Win */}
      {isWon && targetCountry && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 animate-bounce">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/90 backdrop-blur-md text-white font-semibold text-sm shadow-xl border border-emerald-400">
            <Sparkles className="w-4 h-4 text-emerald-100" />
            <span>Target: {targetCountry.flag} {targetCountry.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
