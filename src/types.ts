export type TabType = 'home' | 'games' | 'lists' | 'profile' | 'settings';

export type PartOfSpeech = 'Noun' | 'Verb' | 'Adj.' | 'Adv.' | 'Phrase' | 'Idiom';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Word {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: PartOfSpeech;
  level: CEFRLevel;
  translation: string;
  definition: string;
  example: string;
  exampleTranslation: string;
  synonyms?: string[];
  isFavorite?: boolean;
  mastery?: number; // 0 - 100
  lastReviewed?: string;
  lists?: string[]; // list ids
}

export interface WordList {
  id: string;
  title: string;
  icon: 'heart' | 'refresh' | 'alert' | 'bus' | 'book' | 'briefcase' | 'plane' | 'star' | 'folder';
  count: number;
  mastery: number; // 0 - 100 percentage
  description?: string;
  color?: string;
  words: Word[];
  isCustom?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  icon: 'calendar' | 'graduation' | 'sun' | 'lock' | 'flame' | 'trophy' | 'target';
  isUnlocked: boolean;
  hasStar?: boolean;
  description: string;
  dateUnlocked?: string;
}

export interface UserProfile {
  name: string;
  role: string;
  avatarUrl: string;
  wordsThisWeek: number;
  weeklyActivity: { day: string; count: number; active: boolean }[];
  wordsLearned: number;
  gamesPlayed: number;
  activeStreak: number;
  overallAccuracy: number;
  badges: Badge[];
}

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  languageDirection: 'EN_TR' | 'TR_EN' | 'EN_ES' | 'EN_DE' | 'EN_FR';
  email: string;
  subscription: 'Free' | 'Pro Member' | 'Lifetime';
  soundEnabled: boolean;
  dailyGoal: number;
  currentDayWordsCount: number;
}

export type GameId = 'guess' | 'crosswords' | 'match' | 'scramble' | 'hangman';
