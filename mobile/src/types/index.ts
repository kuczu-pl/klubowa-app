// ═══════════════════════════════════════════════════════════════════
// DATA MODELS — mapped from Firestore document schemas
// ═══════════════════════════════════════════════════════════════════

export type UserRole = 'member' | 'zarzad' | 'skarbnik' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  joined: string;
  onboarded: boolean;
  rating: number;
  theme?: string;
  lastMailSent?: string;
  fcmToken?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: 'aktualność' | 'ogłoszenie' | 'wydarzenie';
  date: string;
  authorId: string;
  pinned: boolean;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  authorId: string;
  date: string;
  votes: number;
  voters: string[];
  status: 'nowy' | 'zaakceptowany' | 'zrealizowany';
}

export interface Recipe {
  id: string;
  title: string;
  category: string;
  ingredients: string;
  instructions: string;
  authorId: string;
  date: string;
  likes: number;
  likers: string[];
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  place: string;
  description: string;
  limit: number;
  cost: number;
  attendees: string[];
  reserve: string[];
  pendingCancellations: string[];
  paid?: string[];
  equipment?: Record<string, string | null>;
  teams?: {
    teamA: string[];
    teamB: string[];
    powerA: number;
    powerB: number;
  };
  tactics?: Record<string, { x: number; y: number }>;
  createdAt?: string;
}

export interface Due {
  id: string;
  userId: string;
  month: string;
  date: string | null;
  amount: number;
  title: string;
  paid: boolean;
  paidDate: string | null;
  eventId?: string;
  createdAt: string;
}

export interface Finance {
  id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  category: string;
  date: string;
  authorId: string;
  eventId?: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: PollOption[];
  multiSelect: boolean;
  deadline: string | null;
  authorId: string;
  date: string;
  closed: boolean;
  totalVoters: string[];
}

export interface PollOption {
  id: string;
  text: string;
  voters: string[];
}

export interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  date: string;
  read: boolean;
}

export interface Comment {
  id: string;
  type: 'news' | 'idea' | 'recipe' | 'event' | 'poll';
  contentId: string;
  authorId: string;
  text: string;
  date: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageData: string;
  storagePath: string;
  authorId: string;
  date: string;
  albumId: string | null;
}

export interface Album {
  id: string;
  name: string;
  description: string;
  authorId: string;
  date: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  url: string;
  fileName: string;
  fileSize: number;
  category: string;
  folder: string;
  storagePath: string;
  authorId: string;
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  msg: string;
  date: string;
  read: boolean;
}

export interface RecipeFields {
  cats: string[];
  ingrLabel: string;
  instrLabel: string;
}

export interface CustomTheme {
  name: string;
  emoji: string;
  primary: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  warm?: string;
  warmLight?: string;
  bg: string;
  cream: string;
  creamDark: string;
  side1: string;
  side2: string;
  border: string;
  text: string;
  textM: string;
  textSide?: string;
  banner: string;
  particle: string;
}

export interface Settings {
  dueAmount: number;
  dueCurrency: string;
  orgName: string;
  orgLocation: string;
  orgGmina: string;
  orgLogoUrl?: string;
  landingTagline: string;
  landingContactAddress: string;
  landingContactPhone: string;
  landingContactEmail: string;
  landingShowFeatures: boolean;
  landingShowNews: boolean;
  landingNewsCount: number;
  landingShowEvents: boolean;
  landingEventsCount: number;
  landingShowGallery: boolean;
  landingGalleryCount: number;
  landingCustomHtml: string;
  docFolders: string[];

  // Module toggles
  modDues?: boolean;
  modIdeas?: boolean;
  modRecipes?: boolean;
  modEvents?: boolean;
  modGallery?: boolean;
  modDocuments?: boolean;
  modFinances?: boolean;
  modMessages?: boolean;
  modPolls?: boolean;
  modMailing?: boolean;

  // Labels
  labelDashboard: string;
  labelNews: string;
  labelNewsSub: string;
  labelMembers: string;
  labelDues: string;
  labelIdeas: string;
  labelPolls: string;
  labelRecipes: string;
  labelEvents: string;
  labelGallery: string;
  labelDocs: string;
  labelMessages: string;
  labelFinances: string;
  labelMailing: string;
  labelAdmin: string;
  labelSettings: string;
  labelProfile: string;
  labelGuide: string;

  // Email templates
  welcomeSubject: string;
  welcomeBody: string;
  duePaidSubject: string;
  duePaidBody: string;
  dueCreatedSubject: string;
  dueCreatedBody: string;

  // Custom themes & recipe fields
  customThemes?: CustomTheme[];
  recipeFields?: RecipeFields;

  setupCompleted?: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// MATCH RESULTS — new collection for monetization (Phase 5)
// ═══════════════════════════════════════════════════════════════════

export interface MatchResult {
  id: string;
  eventId: string;
  date: string;
  teamA: string[];
  teamB: string[];
  scoreA: number;
  scoreB: number;
  goals: { playerId: string; team: 'A' | 'B'; minute?: number }[];
  assists: { playerId: string; team: 'A' | 'B'; minute?: number }[];
}
