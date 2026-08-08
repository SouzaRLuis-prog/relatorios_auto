'use client';

import React, { useCallback, useEffect, useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';

const themeListeners = new Set<() => void>();

function getThemeSnapshot(): boolean {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark') return true;
  if (storedTheme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function subscribeToTheme(onStoreChange: () => void) {
  themeListeners.add(onStoreChange);
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    themeListeners.delete(onStoreChange);
    media.removeEventListener('change', onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function notifyThemeListeners() {
  themeListeners.forEach((listener) => listener());
}

export function DarkModeToggle() {
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    const nextIsDark = !getThemeSnapshot();
    document.documentElement.classList.toggle('dark', nextIsDark);
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
    notifyThemeListeners();
  }, []);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:opacity-80 transition-all flex items-center gap-2 text-sm font-medium border border-slate-300 dark:border-slate-700 shadow-sm"
      aria-label="Alternar modo escuro"
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
      <span className="hidden sm:inline">{isDark ? '' : ''}</span>
    </button>
  );
}
