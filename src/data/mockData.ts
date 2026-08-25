import { Word, UserProfile, AppSettings } from '../types';
import {
  VOCABULARY_DATABASE,
  WORDS_A1,
  WORDS_A2,
  WORDS_B1,
  WORDS_B2,
  WORDS_C1_C2,
  getWordsByLevel,
  getWordsByList,
  getWordById,
} from './vocabulary';
import { OTHER_CURATED_LISTS, INITIAL_USER_LISTS, getCleanUserLists } from './curatedLists';
import {
  GUESS_WORDS_POOL,
  CROSSWORD_PUZZLES,
  MATCH_PAIRS_POOL,
  SCRAMBLE_WORDS,
  HANGMAN_WORDS,
} from './gameData';

// Re-export all modular data sets for seamless backward compatibility
export {
  VOCABULARY_DATABASE,
  WORDS_A1,
  WORDS_A2,
  WORDS_B1,
  WORDS_B2,
  WORDS_C1_C2,
  getWordsByLevel,
  getWordsByList,
  getWordById,
  OTHER_CURATED_LISTS,
  INITIAL_USER_LISTS,
  getCleanUserLists,
  GUESS_WORDS_POOL,
  CROSSWORD_PUZZLES,
  MATCH_PAIRS_POOL,
  SCRAMBLE_WORDS,
  HANGMAN_WORDS,
};

// Initial Word of the Day (Luminous)
export const INITIAL_WORD_OF_THE_DAY: Word =
  VOCABULARY_DATABASE.find((w) => w.id === 'w-luminous') || VOCABULARY_DATABASE[0];

// Initial Suggested Words for Home Screen Carousel
export const INITIAL_SUGGESTED_WORDS: Word[] = [
  VOCABULARY_DATABASE.find((w) => w.id === 'w-ethereal')!,
  VOCABULARY_DATABASE.find((w) => w.id === 'w-glimmer')!,
  VOCABULARY_DATABASE.find((w) => w.id === 'w-melody')!,
  VOCABULARY_DATABASE.find((w) => w.id === 'w-serendipity')!,
  VOCABULARY_DATABASE.find((w) => w.id === 'w-resilience')!,
  VOCABULARY_DATABASE.find((w) => w.id === 'w-ephemeral')!,
  VOCABULARY_DATABASE.find((w) => w.id === 'w-ubiquitous')!,
  VOCABULARY_DATABASE.find((w) => w.id === 'w-commute')!,
].filter(Boolean);

// Profil Avatarları
export const AVATAR_OPTIONS = {
  male: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop&q=80',
  female: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
};

// Temiz / Sıfır Kullanıcı Profili Üreteci
export const getCleanUserProfile = (name?: string, role?: string, email?: string, avatarUrl?: string): UserProfile => ({
  name: name || 'Misafir Öğrenci',
  role: role || 'Misafir Hesap',
  avatarUrl: avatarUrl || AVATAR_OPTIONS.male,
  gender: 'male',
  wordsThisWeek: 0,
  weeklyActivity: [
    { day: 'Pzt', count: 0, active: false },
    { day: 'Sal', count: 0, active: false },
    { day: 'Çar', count: 0, active: false },
    { day: 'Per', count: 0, active: false },
    { day: 'Cum', count: 0, active: false },
    { day: 'Cmt', count: 0, active: false },
    { day: 'Paz', count: 0, active: false },
  ],
  wordsLearned: 0,
  gamesPlayed: 0,
  activeStreak: 0,
  overallAccuracy: 100,
  badges: [
    {
      id: 'b-7streak',
      title: '7 Günlük Seri',
      icon: 'calendar',
      isUnlocked: false,
      description: 'Üst üste 7 gün boyunca kelime çalıştınız.',
    },
    {
      id: 'b-wordmaster',
      title: 'Kelime Ustası',
      icon: 'graduation',
      isUnlocked: false,
      hasStar: true,
      description: '%90+ doğruluk oranı ile 1.000 kelimeyi tamamladınız.',
    },
    {
      id: 'b-earlybird',
      title: 'Erken Kalkan',
      icon: 'sun',
      isUnlocked: false,
      description: 'Sabah saat 08:00\'den önce çalışma oturumunu bitirdiniz.',
    },
    {
      id: 'b-polyglot',
      title: 'Büyük Poliglot',
      icon: 'lock',
      isUnlocked: false,
      description: 'Büyük Poliglot rozetini açmak için 30 günlük seriye ulaşın.',
    },
  ],
});

// Başlangıç Kullanıcı Profili
export const INITIAL_USER_PROFILE: UserProfile = getCleanUserProfile();

// Temiz / Sıfır Uygulama Ayarları Üreteci
export const getCleanAppSettings = (email?: string): AppSettings => ({
  darkMode: false,
  notifications: true,
  languageDirection: 'EN_TR',
  email: email || '',
  subscription: 'Free',
  soundEnabled: true,
  dailyGoal: 20,
  currentDayWordsCount: 0,
});

// Başlangıç Uygulama Ayarları
export const INITIAL_APP_SETTINGS: AppSettings = getCleanAppSettings();

// Temiz Başlangıç Kelime Veritabanı (Favoriler ve özel listeler temizlenmiş)
export const getCleanVocabularyDatabase = (): Word[] =>
  VOCABULARY_DATABASE.map((w) => ({
    ...w,
    isFavorite: false,
    lists: (w.lists || []).filter((l) => l !== 'favorites' && l !== 'review' && l !== 'struggle'),
  }));

