'use client';

import React from 'react';
import { X, Globe2, Compass, Flame, HelpCircle } from 'lucide-react';
import HeatLegend from './HeatLegend';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: 'km' | 'miles';
}

export default function HelpModal({ isOpen, onClose, unit }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">How to Play Globle</h2>
            <p className="text-xs text-slate-400">Daily 3D Mystery Geography Game</p>
          </div>
        </div>

        {/* Rules */}
        <div className="space-y-4 text-sm text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              1. Objective
            </h3>
            <p className="leading-relaxed text-slate-300">
              Your goal is to guess the secret mystery country of the day in as few guesses as possible. A new mystery country is chosen deterministically every day at UTC midnight!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              2. Distance & Heat Feedback
            </h3>
            <p className="leading-relaxed text-slate-300 mb-3">
              Each guess highlights the country on the 3D globe. The color indicates how close your guess is to the secret target country:
            </p>
            <HeatLegend unit={unit} />
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
              3. Interactive 3D Globe
            </h3>
            <p className="leading-relaxed text-slate-300">
              Drag to rotate the globe, scroll or pinch to zoom. Tap any country polygon to inspect its name or distance. The compass bearing points in the direction of the target!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
              4. Practice Mode
            </h3>
            <p className="leading-relaxed text-slate-300">
              Toggle to <strong>Practice Mode</strong> at any time to play unlimited randomized rounds and sharpen your geography skills!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-sm shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
          >
            Got it, Let&apos;s Play!
          </button>
        </div>
      </div>
    </div>
  );
}
