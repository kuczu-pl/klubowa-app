// ═══════════════════════════════════════════════════════════════════
// THEME SYSTEM — React Native adaptation of CSS variables
// ═══════════════════════════════════════════════════════════════════

import React, { createContext, useContext } from 'react';
import { SEASONS, getSeason } from './helpers';
import type { CustomTheme, Settings } from '../types';

export interface Theme extends CustomTheme {
  // Additional computed properties for RN
  radius: number;
  radiusSmall: number;
  shadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

/**
 * Resolves the active theme based on user preference and settings.
 * Mirrors App.jsx lines 127-136.
 */
export function resolveTheme(
  userTheme: string | undefined,
  settings: Settings | null
): Theme {
  // Build ALL_THEMES = SEASONS + custom themes
  const allThemes: Record<string, CustomTheme> = { ...SEASONS };
  if (settings?.customThemes) {
    settings.customThemes.forEach(t => {
      const key = t.name.replace(/\s+/g, '').toLowerCase();
      allThemes[key] = t;
    });
  }

  const activeKey = (userTheme && userTheme !== 'auto') ? userTheme : getSeason();
  const base = allThemes[activeKey] || SEASONS[getSeason()];

  return {
    ...base,
    textSide: base.textSide || '#ffffff',
    radius: 12,
    radiusSmall: 8,
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
  };
}

// Context for accessing theme throughout the app
export const ThemeContext = createContext<Theme>(resolveTheme(undefined, null));

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
