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
import { OTHER_CURATED_LISTS, INITIAL_USER_LISTS } from './curatedLists';
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

// Başlangıç Kullanıcı Profili
export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Misafir Öğrenci',
  role: 'Misafir Hesap',
  avatarUrl: AVATAR_OPTIONS.male,
  gender: 'male',
  wordsThisWeek: 240,
  weeklyActivity: [
    { day: 'Pzt', count: 35, active: true },
    { day: 'Sal', count: 42, active: true },
    { day: 'Çar', count: 50, active: true },
    { day: 'Per', count: 45, active: true },
    { day: 'Cum', count: 38, active: true },
    { day: 'Cmt', count: 18, active: true },
    { day: 'Paz', count: 12, active: false },
  ],
  wordsLearned: 1240,
  gamesPlayed: 85,
  activeStreak: 12,
  overallAccuracy: 94,
  badges: [
    {
      id: 'b-7streak',
      title: '7 Günlük Seri',
      icon: 'calendar',
      isUnlocked: true,
      description: 'Üst üste 7 gün boyunca kelime çalıştınız.',
      dateUnlocked: '4 gün önce',
    },
    {
      id: 'b-wordmaster',
      title: 'Kelime Ustası',
      icon: 'graduation',
      isUnlocked: true,
      hasStar: true,
      description: '%90+ doğruluk oranı ile 1.000 kelimeyi tamamladınız.',
      dateUnlocked: 'Geçen hafta',
    },
    {
      id: 'b-earlybird',
      title: 'Erken Kalkan',
      icon: 'sun',
      isUnlocked: true,
      description: 'Sabah saat 08:00\'den önce çalışma oturumunu bitirdiniz.',
      dateUnlocked: '2 gün önce',
    },
    {
      id: 'b-polyglot',
      title: 'Büyük Poliglot',
      icon: 'lock',
      isUnlocked: false,
      description: 'Büyük Poliglot rozetini açmak için 30 günlük seriye ulaşın.',
    },
  ],
};

// Başlangıç Uygulama Ayarları
export const INITIAL_APP_SETTINGS: AppSettings = {
  darkMode: false,
  notifications: true,
  languageDirection: 'EN_TR',
  email: 'ikray2075@gmail.com',
  subscription: 'Pro Member',
  soundEnabled: true,
  dailyGoal: 20,
  currentDayWordsCount: 15,
};
