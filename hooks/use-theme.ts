'use client';

import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/storage';
import { ConfiguracoesApp } from '@/types';

export type ThemePreference = 'claro' | 'escuro' | 'sistema';

export function useTheme() {
  const [themePreference, setThemePreference] = useState<ThemePreference>('escuro');
  const [isDark, setIsDark] = useState<boolean>(true);

  // Apply theme to document element
  const applyTheme = useCallback((pref: ThemePreference) => {
    if (typeof window === 'undefined') return;

    let darkActive = false;
    if (pref === 'escuro') {
      darkActive = true;
    } else if (pref === 'claro') {
      darkActive = false;
    } else {
      // Sistema: check OS preference
      darkActive = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    setIsDark(darkActive);
    const root = document.documentElement;

    if (darkActive) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }

    // Dynamically update mobile browser status bar and address bar color
    try {
      const targetColor = darkActive ? '#0b1015' : '#f1f5f9';
      const metaTags = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
      metaTags.forEach((meta) => {
        meta.setAttribute('content', targetColor);
      });
      const appleStatusMeta = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (appleStatusMeta) {
        appleStatusMeta.setAttribute('content', darkActive ? 'black-translucent' : 'default');
      }
    } catch {}
  }, []);

  // Initialize and listen to storage and system changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const config = storage.getConfiguracoes();
    const currentPref = config.tema || 'escuro';
    setThemePreference(currentPref);
    applyTheme(currentPref);

    // Listen to storage update events (when changed in settings or header)
    const handleStorageUpdate = () => {
      const updatedConfig = storage.getConfiguracoes();
      const newPref = updatedConfig.tema || 'escuro';
      setThemePreference(newPref);
      applyTheme(newPref);
    };

    // Listen to OS system color scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      const activeConfig = storage.getConfiguracoes();
      if (activeConfig.tema === 'sistema') {
        applyTheme('sistema');
      }
    };

    window.addEventListener('praxis_storage_updated', handleStorageUpdate);
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('praxis_storage_updated', handleStorageUpdate);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [applyTheme]);

  const setTheme = (newPref: ThemePreference) => {
    const config = storage.getConfiguracoes();
    const updated: ConfiguracoesApp = { ...config, tema: newPref };
    storage.saveConfiguracoes(updated);
    setThemePreference(newPref);
    applyTheme(newPref);
  };

  const cycleTheme = () => {
    if (themePreference === 'claro') setTheme('escuro');
    else if (themePreference === 'escuro') setTheme('sistema');
    else setTheme('claro');
  };

  return {
    themePreference,
    isDark,
    setTheme,
    cycleTheme,
  };
}
