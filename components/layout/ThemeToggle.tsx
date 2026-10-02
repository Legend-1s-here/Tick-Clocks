'use client';

import { useState, useEffect, useRef } from 'react';
import { Palette, Check } from 'lucide-react';

export type ThemeId = 'slate' | 'warm' | 'sage' | 'dark' | 'midnight';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  category: 'Light' | 'Dark';
  bgPreview: string;
  accentPreview: string;
  borderPreview: string;
  isDark: boolean;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'slate',
    name: 'Slate Minimal',
    category: 'Light',
    bgPreview: '#f8fafc',
    accentPreview: '#4f46e5',
    borderPreview: '#e2e8f0',
    isDark: false,
  },
  {
    id: 'warm',
    name: 'Warm Paper',
    category: 'Light',
    bgPreview: '#fbf9f4',
    accentPreview: '#c2410c',
    borderPreview: '#e7e5e4',
    isDark: false,
  },
  {
    id: 'sage',
    name: 'Nordic Sage',
    category: 'Light',
    bgPreview: '#f2f5f2',
    accentPreview: '#15803d',
    borderPreview: '#dbe4dd',
    isDark: false,
  },
  {
    id: 'dark',
    name: 'Linear Charcoal',
    category: 'Dark',
    bgPreview: '#121215',
    accentPreview: '#6366f1',
    borderPreview: '#27272e',
    isDark: true,
  },
  {
    id: 'midnight',
    name: 'OLED Midnight',
    category: 'Dark',
    bgPreview: '#000000',
    accentPreview: '#818cf8',
    borderPreview: '#1e1e24',
    isDark: true,
  },
];

export function applyTheme(themeId: ThemeId) {
  const selected = THEME_OPTIONS.find((t) => t.id === themeId) || THEME_OPTIONS[0];
  document.documentElement.setAttribute('data-theme', selected.id);

  if (selected.isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  try {
    localStorage.setItem('habitflow-theme', selected.id);
  } catch {
    // LocalStorage fallback
  }
}

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('slate');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem('habitflow-theme') as ThemeId) || 'slate';
    setCurrentTheme(saved);
    applyTheme(saved);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectTheme = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    setIsOpen(false);
  };

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  const activeThemeObj = THEME_OPTIONS.find((t) => t.id === currentTheme) || THEME_OPTIONS[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Theme: ${activeThemeObj.name}`}
        aria-label="Select theme"
        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <Palette className="w-4 h-4" />
        <span
          className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/20 shrink-0"
          style={{ backgroundColor: activeThemeObj.accentPreview }}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 mb-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Choose Theme
          </div>

          <div className="space-y-1">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => selectTheme(theme.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Swatch */}
                    <div
                      className="w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 shadow-2xs"
                      style={{
                        backgroundColor: theme.bgPreview,
                        borderColor: theme.borderPreview,
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: theme.accentPreview }}
                      />
                    </div>
                    <span>{theme.name}</span>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
