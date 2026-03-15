// ═══════════════════════════════════════════════════════════════════
// DATA STORE — replaces all App.jsx collection state (users, news,
// ideas, recipes, events, dues, gallery, albums, comments, notifs,
// finances, polls, messages, documents)
// ═══════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import firestore from '@react-native-firebase/firestore';
import type {
  User, NewsItem, Idea, Recipe, Event, Due, GalleryItem,
  Album, Comment, Notification, Finance, Poll, Message, Document,
} from '../types';
import { canSeeDues, SEED_NEWS } from '../utils/helpers';

interface DataState {
  // Collections
  users: User[];
  news: NewsItem[];
  ideas: Idea[];
  recipes: Recipe[];
  events: Event[];
  dues: Due[];
  gallery: GalleryItem[];
  albums: Album[];
  comments: Comment[];
  notifs: Notification[];
  finances: Finance[];
  polls: Poll[];
  messages: Message[];
  documents: Document[];

  // Setters (used by individual services/actions)
  setUsers: (users: User[]) => void;
  setNews: (news: NewsItem[]) => void;
  setIdeas: (ideas: Idea[]) => void;
  setRecipes: (recipes: Recipe[]) => void;
  setEvents: (events: Event[]) => void;
  setDues: (dues: Due[]) => void;
  setGallery: (gallery: GalleryItem[]) => void;
  setAlbums: (albums: Album[]) => void;
  setComments: (comments: Comment[]) => void;
  setNotifs: (notifs: Notification[]) => void;
  setFinances: (finances: Finance[]) => void;
  setPolls: (polls: Poll[]) => void;
  setMessages: (messages: Message[]) => void;
  setDocuments: (documents: Document[]) => void;

  // Updaters (convenience for optimistic updates)
  updateUser: (id: string, data: Partial<User>) => void;
  addNewsItem: (item: NewsItem) => void;
  updateNewsItem: (id: string, data: Partial<NewsItem>) => void;
  removeNewsItem: (id: string) => void;
  addIdeaItem: (item: Idea) => void;
  updateIdeaItem: (id: string, data: Partial<Idea>) => void;
  removeIdeaItem: (id: string) => void;
  addRecipeItem: (item: Recipe) => void;
  updateRecipeItem: (id: string, data: Partial<Recipe>) => void;
  removeRecipeItem: (id: string) => void;
  addEventItem: (item: Event) => void;
  updateEventItem: (id: string, data: Partial<Event>) => void;
  removeEventItem: (id: string) => void;
  addDueItem: (item: Due) => void;
  addDueItems: (items: Due[]) => void;
  updateDueItem: (id: string, data: Partial<Due>) => void;
  removeDueItem: (id: string) => void;
  addGalleryItems: (items: GalleryItem[]) => void;
  removeGalleryItem: (id: string) => void;
  addAlbumItem: (item: Album) => void;
  removeAlbumItem: (id: string) => void;
  addCommentItem: (item: Comment) => void;
  removeCommentItem: (id: string) => void;
  addNotifItem: (item: Notification) => void;
  markNotifsRead: (userId: string) => void;
  addFinanceItem: (item: Finance) => void;
  removeFinanceItem: (id: string) => void;
  addPollItem: (item: Poll) => void;
  updatePollItem: (id: string, data: Partial<Poll>) => void;
  removePollItem: (id: string) => void;
  addMessageItem: (item: Message) => void;
  markMessagesReadLocal: (ids: string[]) => void;
  addDocumentItem: (item: Document) => void;
  removeDocumentItem: (id: string) => void;

  // Bulk data load (called after auth)
  loadAllData: (userId: string, userRole: string) => Promise<void>;
  loadPublicData: () => Promise<void>;
  clearAll: () => void;
}

const fetchCol = async <T extends { id: string }>(colName: string): Promise<T[]> => {
  const snap = await firestore().collection(colName).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
};

export const useDataStore = create<DataState>((set, get) => ({
  // Initial state
  users: [],
  news: [],
  ideas: [],
  recipes: [],
  events: [],
  dues: [],
  gallery: [],
  albums: [],
  comments: [],
  notifs: [],
  finances: [],
  polls: [],
  messages: [],
  documents: [],

  // Simple setters
  setUsers: (users) => set({ users }),
  setNews: (news) => set({ news }),
  setIdeas: (ideas) => set({ ideas }),
  setRecipes: (recipes) => set({ recipes }),
  setEvents: (events) => set({ events }),
  setDues: (dues) => set({ dues }),
  setGallery: (gallery) => set({ gallery }),
  setAlbums: (albums) => set({ albums }),
  setComments: (comments) => set({ comments }),
  setNotifs: (notifs) => set({ notifs }),
  setFinances: (finances) => set({ finances }),
  setPolls: (polls) => set({ polls }),
  setMessages: (messages) => set({ messages }),
  setDocuments: (documents) => set({ documents }),

  // User updater
  updateUser: (id, data) =>
    set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)) })),

  // News updaters
  addNewsItem: (item) => set((s) => ({ news: [item, ...s.news] })),
  updateNewsItem: (id, data) =>
    set((s) => ({ news: s.news.map((n) => (n.id === id ? { ...n, ...data } : n)) })),
  removeNewsItem: (id) => set((s) => ({ news: s.news.filter((n) => n.id !== id) })),

  // Ideas updaters
  addIdeaItem: (item) => set((s) => ({ ideas: [item, ...s.ideas] })),
  updateIdeaItem: (id, data) =>
    set((s) => ({ ideas: s.ideas.map((i) => (i.id === id ? { ...i, ...data } : i)) })),
  removeIdeaItem: (id) => set((s) => ({ ideas: s.ideas.filter((i) => i.id !== id) })),

  // Recipes updaters
  addRecipeItem: (item) => set((s) => ({ recipes: [item, ...s.recipes] })),
  updateRecipeItem: (id, data) =>
    set((s) => ({ recipes: s.recipes.map((r) => (r.id === id ? { ...r, ...data } : r)) })),
  removeRecipeItem: (id) => set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) })),

  // Events updaters
  addEventItem: (item) =>
    set((s) => ({
      events: [...s.events, item].sort((a, b) => a.date.localeCompare(b.date)),
    })),
  updateEventItem: (id, data) =>
    set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...data } : e)) })),
  removeEventItem: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

  // Dues updaters
  addDueItem: (item) => set((s) => ({ dues: [...s.dues, item] })),
  addDueItems: (items) => set((s) => ({ dues: [...s.dues, ...items] })),
  updateDueItem: (id, data) =>
    set((s) => ({ dues: s.dues.map((d) => (d.id === id ? { ...d, ...data } : d)) })),
  removeDueItem: (id) => set((s) => ({ dues: s.dues.filter((d) => d.id !== id) })),

  // Gallery updaters
  addGalleryItems: (items) => set((s) => ({ gallery: [...items, ...s.gallery] })),
  removeGalleryItem: (id) => set((s) => ({ gallery: s.gallery.filter((g) => g.id !== id) })),

  // Albums updaters
  addAlbumItem: (item) => set((s) => ({ albums: [...s.albums, item] })),
  removeAlbumItem: (id) => set((s) => ({ albums: s.albums.filter((a) => a.id !== id) })),

  // Comments updaters
  addCommentItem: (item) => set((s) => ({ comments: [item, ...s.comments] })),
  removeCommentItem: (id) => set((s) => ({ comments: s.comments.filter((c) => c.id !== id) })),

  // Notifications updaters
  addNotifItem: (item) => set((s) => ({ notifs: [item, ...s.notifs] })),
  markNotifsRead: (userId) =>
    set((s) => ({
      notifs: s.notifs.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
    })),

  // Finances updaters
  addFinanceItem: (item) => set((s) => ({ finances: [item, ...s.finances] })),
  removeFinanceItem: (id) => set((s) => ({ finances: s.finances.filter((f) => f.id !== id) })),

  // Polls updaters
  addPollItem: (item) => set((s) => ({ polls: [item, ...s.polls] })),
  updatePollItem: (id, data) =>
    set((s) => ({ polls: s.polls.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
  removePollItem: (id) => set((s) => ({ polls: s.polls.filter((p) => p.id !== id) })),

  // Messages updaters
  addMessageItem: (item) => set((s) => ({ messages: [...s.messages, item] })),
  markMessagesReadLocal: (ids) =>
    set((s) => ({
      messages: s.messages.map((m) => (ids.includes(m.id) ? { ...m, read: true } : m)),
    })),

  // Documents updaters
  addDocumentItem: (item) => set((s) => ({ documents: [item, ...s.documents] })),
  removeDocumentItem: (id) =>
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

  // Bulk load after auth (mirrors App.jsx onAuthStateChanged lines 159-212)
  loadAllData: async (userId, userRole) => {
    const [
      usersData,
      newsData,
      ideasData,
      recipesData,
      eventsData,
      galleryData,
      albumsData,
      commentsData,
      pollsData,
      documentsData,
    ] = await Promise.all([
      fetchCol<User>('users'),
      fetchCol<NewsItem>('news'),
      fetchCol<Idea>('ideas'),
      fetchCol<Recipe>('recipes'),
      fetchCol<Event>('events'),
      fetchCol<GalleryItem>('gallery'),
      fetchCol<Album>('albums'),
      fetchCol<Comment>('comments'),
      fetchCol<Poll>('polls'),
      fetchCol<Document>('documents'),
    ]);

    // Notifications — user-specific
    const notifSnap = await firestore()
      .collection('notifications')
      .where('userId', '==', userId)
      .get();
    const notifsData = notifSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));

    // Messages — sent + received
    const msgsCol = firestore().collection('messages');
    const [sentSnap, recvSnap] = await Promise.all([
      msgsCol.where('from', '==', userId).get(),
      msgsCol.where('to', '==', userId).get(),
    ]);
    const msgMap = new Map<string, Message>();
    [...sentSnap.docs, ...recvSnap.docs].forEach((d) =>
      msgMap.set(d.id, { id: d.id, ...d.data() } as Message)
    );
    const messagesData = [...msgMap.values()];

    // Dues + Finances — role-based access
    const isBoard = ['admin', 'skarbnik', 'zarzad'].includes(userRole);
    let duesData: Due[] = [];
    let financesData: Finance[] = [];

    if (isBoard) {
      duesData = await fetchCol<Due>('dues');
      financesData = await fetchCol<Finance>('finances');
    } else {
      const myDuesSnap = await firestore()
        .collection('dues')
        .where('userId', '==', userId)
        .get();
      duesData = myDuesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Due));
    }

    set({
      users: usersData,
      news: newsData.length > 0 ? newsData : (SEED_NEWS as NewsItem[]),
      ideas: ideasData,
      recipes: recipesData,
      events: eventsData,
      gallery: galleryData,
      albums: albumsData,
      comments: commentsData,
      notifs: notifsData,
      polls: pollsData,
      messages: messagesData,
      documents: documentsData,
      dues: duesData,
      finances: financesData,
    });
  },

  // Load public data for landing page (no auth)
  loadPublicData: async () => {
    try {
      const [newsData, galleryData, eventsData] = await Promise.all([
        fetchCol<NewsItem>('news'),
        fetchCol<GalleryItem>('gallery'),
        fetchCol<Event>('events'),
      ]);
      set({
        news: newsData.length > 0 ? newsData : (SEED_NEWS as NewsItem[]),
        gallery: galleryData,
        events: eventsData,
      });
    } catch {
      // Silent fail for public data
    }
  },

  // Clear on logout
  clearAll: () =>
    set({
      users: [],
      news: [],
      ideas: [],
      recipes: [],
      events: [],
      dues: [],
      gallery: [],
      albums: [],
      comments: [],
      notifs: [],
      finances: [],
      polls: [],
      messages: [],
      documents: [],
    }),
}));
