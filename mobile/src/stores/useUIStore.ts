// ═══════════════════════════════════════════════════════════════════
// UI STORE — replaces App.jsx modal/toast/confirm/filter/search state
// ═══════════════════════════════════════════════════════════════════

import { create } from 'zustand';

interface ConfirmState {
  msg: string;
  onOk: () => void;
  btnLabel?: string;
}

interface ModalState {
  type: string;
  [key: string]: any;
}

interface UIState {
  // Modal
  modal: ModalState | null;
  editItem: any | null;
  setModal: (modal: ModalState | null) => void;
  setEditItem: (item: any | null) => void;

  // Toast
  toast: string | null;
  flash: (msg: string) => void;

  // Confirm dialog
  confirm: ConfirmState | null;
  askConfirm: (msg: string, onOk: () => void, btnLabel?: string) => void;
  clearConfirm: () => void;

  // Filters
  newsFilter: string;
  recipeFilter: string;
  ideaFilter: string;
  setNewsFilter: (f: string) => void;
  setRecipeFilter: (f: string) => void;
  setIdeaFilter: (f: string) => void;

  // Search
  searchQ: string;
  searchOpen: boolean;
  setSearchQ: (q: string) => void;
  setSearchOpen: (open: boolean) => void;

  // Gallery
  galleryAlbum: string;
  lightbox: any | null;
  setGalleryAlbum: (album: string) => void;
  setLightbox: (item: any | null) => void;

  // Notifications panel
  notifOpen: boolean;
  setNotifOpen: (open: boolean) => void;

  // Documents
  docFolder: string | null;
  setDocFolder: (folder: string | null) => void;

  // Messages
  chatWith: string | null;
  setChatWith: (userId: string | null) => void;

  // Calendar
  calView: boolean;
  calMonth: { y: number; m: number };
  setCalView: (view: boolean) => void;
  setCalMonth: (month: { y: number; m: number }) => void;

  // Dues alert
  duesAlert: { month: string; count: number } | null;
  setDuesAlert: (alert: { month: string; count: number } | null) => void;

  // Tactics
  tacticsEvent: string | null;
  setTacticsEvent: (eventId: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Modal
  modal: null,
  editItem: null,
  setModal: (modal) => set({ modal }),
  setEditItem: (editItem) => set({ editItem }),

  // Toast
  toast: null,
  flash: (msg) => {
    set({ toast: msg });
    setTimeout(() => set({ toast: null }), 2500);
  },

  // Confirm
  confirm: null,
  askConfirm: (msg, onOk, btnLabel = 'Tak') => set({ confirm: { msg, onOk, btnLabel } }),
  clearConfirm: () => set({ confirm: null }),

  // Filters
  newsFilter: 'all',
  recipeFilter: 'all',
  ideaFilter: 'all',
  setNewsFilter: (newsFilter) => set({ newsFilter }),
  setRecipeFilter: (recipeFilter) => set({ recipeFilter }),
  setIdeaFilter: (ideaFilter) => set({ ideaFilter }),

  // Search
  searchQ: '',
  searchOpen: false,
  setSearchQ: (searchQ) => set({ searchQ }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),

  // Gallery
  galleryAlbum: 'unassigned',
  lightbox: null,
  setGalleryAlbum: (galleryAlbum) => set({ galleryAlbum }),
  setLightbox: (lightbox) => set({ lightbox }),

  // Notifications panel
  notifOpen: false,
  setNotifOpen: (notifOpen) => set({ notifOpen }),

  // Documents
  docFolder: null,
  setDocFolder: (docFolder) => set({ docFolder }),

  // Messages
  chatWith: null,
  setChatWith: (chatWith) => set({ chatWith }),

  // Calendar
  calView: false,
  calMonth: { y: new Date().getFullYear(), m: new Date().getMonth() },
  setCalView: (calView) => set({ calView }),
  setCalMonth: (calMonth) => set({ calMonth }),

  // Dues alert
  duesAlert: null,
  setDuesAlert: (duesAlert) => set({ duesAlert }),

  // Tactics
  tacticsEvent: null,
  setTacticsEvent: (tacticsEvent) => set({ tacticsEvent }),
}));
