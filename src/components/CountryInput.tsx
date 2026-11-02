'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Country } from '@/types';
import { searchCountries } from '@/lib/gameEngine';
import { Search, CornerDownLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CountryInputProps {
  onGuess: (country: Country) => void;
  guessedCountryIds: Set<string>;
  isWon: boolean;
  disabled?: boolean;
}

export default function CountryInput({
  onGuess,
  guessedCountryIds,
  isWon,
  disabled
}: CountryInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Country[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update suggestions when query changes
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setSelectedIndex(-1);
      setIsOpen(false);
      return;
    }

    const matches = searchCountries(query, guessedCountryIds);
    setSuggestions(matches);
    setSelectedIndex(matches.length > 0 ? 0 : -1);
    setIsOpen(matches.length > 0);
    setErrorMessage(null);
  }, [query, guessedCountryIds]);

  // Handle outside click to dismiss dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const submitCountry = useCallback((country: Country) => {
    if (guessedCountryIds.has(country.id)) {
      setErrorMessage(`You already guessed ${country.name}!`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    onGuess(country);
    setQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    setIsOpen(false);
    setErrorMessage(null);
    inputRef.current?.focus();
  }, [guessedCountryIds, onGuess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      submitCountry(suggestions[selectedIndex]);
      return;
    }

    if (suggestions.length > 0) {
      submitCountry(suggestions[0]);
      return;
    }

    // Check if the query is a country that was already guessed
    const exactMatches = searchCountries(query);
    if (exactMatches.length > 0 && guessedCountryIds.has(exactMatches[0].id)) {
      setErrorMessage(`You already guessed ${exactMatches[0].name}!`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setErrorMessage(`"${query}" is not in the country database.`);
    setTimeout(() => setErrorMessage(null), 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            disabled={disabled || isWon}
            placeholder={
              isWon
                ? '🏆 Mystery country found! Check stats or play practice.'
                : 'Enter a country or territory (e.g. France, USA, Japan)...'
            }
            autoComplete="off"
            spellCheck="false"
            className="w-full pl-11 pr-24 py-3.5 bg-slate-900/90 hover:bg-slate-900 text-slate-100 placeholder-slate-500 rounded-2xl border border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xl backdrop-blur-md text-base transition-all outline-none disabled:opacity-75 disabled:cursor-not-allowed"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            <button
              type="submit"
              disabled={disabled || isWon || (!query.trim() && suggestions.length === 0)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-xs shadow-md transition-all active:scale-95 disabled:active:scale-100"
            >
              <span>Guess</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Error / Validation Warning Toast */}
        {errorMessage && (
          <div className="absolute left-0 right-0 -bottom-10 flex items-center justify-center pointer-events-none z-30 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-950/90 border border-rose-700/80 text-rose-200 text-xs font-medium shadow-lg backdrop-blur-md">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && !isWon && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-2 py-1.5 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl z-50 max-h-72 overflow-y-auto divide-y divide-slate-800/60"
        >
          {suggestions.map((country, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={country.id}
                type="button"
                onClick={() => submitCountry(country)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors ${
                  isSelected ? 'bg-emerald-600/20 text-emerald-300' : 'text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none">{country.flag}</span>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <span>{country.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {country.iso3}
                      </span>
                    </div>
                    {country.officialName !== country.name && (
                      <div className="text-xs text-slate-400 line-clamp-1">
                        {country.officialName}
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  {country.continent}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
