

export enum EmotionType {
  HAPPY = 'Happy',
  SAD = 'Sad',
  STRESSED = 'Stressed',
  ANXIOUS = 'Anxious',
  ANGRY = 'Angry',
  TIRED = 'Tired',
  NEUTRAL = 'Neutral',
}

export type EntryType = 'daily' | 'monthly' | 'weekly' | 'vent' | 'restart';

export type EntryTag = 'clarity' | 'victory' | 'deep_reflection' | 'important_vent' | 'calm_moment' | 'none';

export type ContextCategory = 'work' | 'relationships' | 'health' | 'finance' | 'self' | 'other';

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  emotion: EmotionType;
  userText: string;
  aiReply: string;
  type?: EntryType; // Defaults to 'daily' if undefined
  monthRef?: string; // e.g., "2023-10" used for monthly reviews
  tags?: EntryTag[]; // Post-reflection tags
  contextTags?: ContextCategory[]; // Input context (Work, Health, etc.)
}

export enum Language {
  EN = 'en',
  PT_PT = 'pt-pt',
  PT_BR = 'pt-br',
  ES = 'es',
}

export type Theme = 'light' | 'dark';

export interface UserSettings {
  isPro: boolean;
  language: Language;
  theme: Theme;
  isOnboarded: boolean;
  dailyUsageCount: number;
  lastUsageDate: string; // YYYY-MM-DD
  installDate: string; // ISO string for 7-day trial calculation
  // Gamification & Notifications
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null; // YYYY-MM-DD of last saved entry
  notificationsEnabled: boolean;
  // Quote of the Day (formerly Magic Question)
  dailyQuoteDate: string; // YYYY-MM-DD
  dailyQuote: string;
  // Features limits
  lastVentDate: string | null; // ISO string to track 30-day limit
}

export interface AppContextType {
  settings: UserSettings;
  entries: JournalEntry[];
  addEntry: (
    emotion: EmotionType, 
    userText: string, 
    aiReply: string, 
    type?: EntryType, 
    monthRef?: string, 
    tags?: EntryTag[],
    contextTags?: ContextCategory[],
    customDate?: string // NEW PARAMETER
  ) => void;
  deleteEntry: (id: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetDailyUsageIfNeeded: () => void;
  incrementUsage: () => void;
  remainingSupports: number;
  restoreSubscription: () => void;
  upgradeToPro: () => void;
  showMonthlyReview: boolean;
  setShowMonthlyReview: (show: boolean) => void;
  previousMonthStats: { monthLabel: string; entries: JournalEntry[] } | null;
  // Debug / Dev tools
  debugInsertEntries: (newEntries: JournalEntry[]) => void;
  debugClearAllEntries: () => void;
}

export type Tab = 'home' | 'journal' | 'stats' | 'settings';