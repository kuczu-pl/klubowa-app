// ═══════════════════════════════════════════════════════════════════
// AUTH STORE — replaces App.jsx user/booted/showOnboard/showLanding state
// ═══════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import type { User, Settings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/helpers';
import { doRegister, doLogin, doLogout } from '../services/auth.service';
import type { RegisterData, LoginData } from '../services/auth.service';
import { finishOnboarding, quickThemeChange } from '../services/members.service';

interface AuthState {
  booted: boolean;
  user: User | null;
  showOnboard: boolean;

  // Actions
  init: () => () => void; // returns unsubscribe
  register: (data: RegisterData, settings: Settings) => Promise<string | null>;
  login: (data: LoginData) => Promise<string | null>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  completeOnboarding: () => Promise<void>;
  changeTheme: (themeKey: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  booted: false,
  user: null,
  showOnboard: false,

  init: () => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Wait for user document to be created (during first registration)
          let userDoc = await firestore().collection('users').doc(firebaseUser.uid).get();
          let retries = 0;
          while (!userDoc.exists && retries < 5) {
            await new Promise((r) => setTimeout(r, 400));
            userDoc = await firestore().collection('users').doc(firebaseUser.uid).get();
            retries++;
          }

          if (userDoc.exists) {
            const ud = userDoc.data() as Omit<User, 'id'>;
            const user: User = { ...ud, id: firebaseUser.uid };
            set({
              user,
              showOnboard: !ud.onboarded,
              booted: true,
            });
          } else {
            set({ user: null, booted: true });
          }
        } catch (error) {
          console.error('Auth state error:', error);
          set({ user: null, booted: true });
        }
      } else {
        set({ user: null, booted: true });
      }
    });

    return unsubscribe;
  },

  register: async (data, settings) => {
    const result = await doRegister(data, settings);
    if ('error' in result) return result.error;
    set({ user: result.user, showOnboard: true });
    return null;
  },

  login: async (data) => {
    const result = await doLogin(data);
    if ('error' in result) return result.error;
    // User will be set by onAuthStateChanged
    return null;
  },

  logout: async () => {
    await doLogout();
    set({ user: null });
  },

  setUser: (user) => set({ user }),

  completeOnboarding: async () => {
    const { user } = get();
    if (!user || user.onboarded) return;
    await finishOnboarding(user.id);
    set({ user: { ...user, onboarded: true }, showOnboard: false });
  },

  changeTheme: async (themeKey) => {
    const { user } = get();
    if (!user) return;
    await quickThemeChange(user.id, themeKey);
    set({ user: { ...user, theme: themeKey } });
  },
}));
