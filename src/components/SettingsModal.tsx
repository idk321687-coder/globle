'use client';

import React from 'react';
import { GameMode, GameSettings } from '@/types';
import { X, Settings, Volume2, VolumeX, RotateCw, Moon, Sun, Globe2, Compass } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  mode: GameMode;
  onToggleMode: (mode: GameMode) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  mode,
  onToggleMode
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Settings</h2>
            <p className="text-xs text-slate-400">Game preferences & options</p>
          </div>
        </div>

        {/* Settings List */}
        <div className="space-y-4 text-sm">
          {/* Distance Unit */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div>
              <div className="font-semibold text-white">Distance Unit</div>
              <div className="text-xs text-slate-400">Kilometers or Miles</div>
            </div>
            <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-700">
              <button
                onClick={() => onUpdateSettings({ unit: 'km' })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  settings.unit === 'km'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                KM
              </button>
              <button
                onClick={() => onUpdateSettings({ unit: 'miles' })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  settings.unit === 'miles'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Miles
              </button>
            </div>
          </div>

          {/* Game Mode */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div>
              <div className="font-semibold text-white">Game Mode</div>
              <div className="text-xs text-slate-400">Daily mystery or practice</div>
            </div>
            <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-700">
              <button
                onClick={() => onToggleMode('daily')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mode === 'daily'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => onToggleMode('practice')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mode === 'practice'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Practice
              </button>
            </div>
          </div>

          {/* Globe Texture */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div>
              <div className="font-semibold text-white">Globe Visual Style</div>
              <div className="text-xs text-slate-400">Earth surface texture</div>
            </div>
            <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-700">
              <button
                onClick={() => onUpdateSettings({ globeTexture: 'satellite' })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  settings.globeTexture === 'satellite'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => onUpdateSettings({ globeTexture: 'dark' })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  settings.globeTexture === 'dark'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dark Minimal
              </button>
            </div>
          </div>

          {/* Auto Rotation */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-900 text-indigo-400">
                <RotateCw className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white">Auto-Rotate Globe</div>
                <div className="text-xs text-slate-400">Slow atmospheric spin</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ autoRotate: !settings.autoRotate })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.autoRotate ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.autoRotate ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-900 text-amber-400">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-semibold text-white">Audio Feedback</div>
                <div className="text-xs text-slate-400">Pitch clues & fanfare</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
