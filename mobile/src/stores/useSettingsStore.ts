// ═══════════════════════════════════════════════════════════════════
// SETTINGS STORE — replaces App.jsx settings state
// ═══════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import type { Settings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/helpers';
import {
  saveSettings as saveSvc,
  fetchSettings,
  handleSetupComplete as setupSvc,
  uploadLogo as uploadLogoSvc,
} from '../services/settings.service';

interface SettingsState {
  settings: Settings;
  loaded: boolean;

  // Actions
  load: () => Promise<void>;
  save: (data: Partial<Settings>) => Promise<void>;
  completeSetup: (wizardSettings: Partial<Settings>) => Promise<void>;
  uploadLogo: (file: { uri: string; size: number }) => Promise<string>;
  setSettings: (settings: Settings) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS as Settings,
  loaded: false,

  load: async () => {
    const data = await fetchSettings();
    if (data) {
      set({ settings: { ...DEFAULT_SETTINGS, ...data } as Settings, loaded: true });
    } else {
      set({ loaded: true });
    }
  },

  save: async (data) => {
    await saveSvc(data);
    const { settings } = get();
    set({ settings: { ...settings, ...data } as Settings });
  },

  completeSetup: async (wizardSettings) => {
    const { settings } = get();
    const finalData = await setupSvc(settings, wizardSettings);
    set({ settings: finalData });
  },

  uploadLogo: async (file) => {
    const url = await uploadLogoSvc(file);
    const { settings } = get();
    set({ settings: { ...settings, orgLogoUrl: url } as Settings });
    return url;
  },

  setSettings: (settings) => set({ settings }),
}));
