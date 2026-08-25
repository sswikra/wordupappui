import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word, WordList, UserProfile, AppSettings } from '../types';
import {
  VOCABULARY_DATABASE,
  INITIAL_USER_LISTS,
  OTHER_CURATED_LISTS,
  INITIAL_USER_PROFILE,
  INITIAL_APP_SETTINGS,
  getCleanUserLists,
  getCleanUserProfile,
  getCleanAppSettings,
  getCleanVocabularyDatabase,
} from '../data/mockData';

const KEYS = {
  WORDS: '@wordmem_words',
  USER_LISTS: '@wordmem_user_lists',
  OTHER_LISTS: '@wordmem_other_lists',
  PROFILE: '@wordmem_profile',
  SETTINGS: '@wordmem_settings',
  DATA_CLEAN_VERSION: '@wordmem_data_clean_v3',
  HIGHSCORE_GUESS: '@wordmem_highscore_guess',
  HIGHSCORE_CROSSWORD: '@wordmem_highscore_crossword',
  HIGHSCORE_MATCH: '@wordmem_highscore_match',
  HIGHSCORE_SCRAMBLE: '@wordmem_highscore_scramble',
  HIGHSCORE_HANGMAN: '@wordmem_highscore_hangman',
};

export const StorageService = {
  KEYS,

  // Load words
  async getWords(): Promise<Word[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.WORDS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load words from storage', e);
    }
    return VOCABULARY_DATABASE;
  },

  // Save words
  async saveWords(words: Word[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.WORDS, JSON.stringify(words));
    } catch (e) {
      console.warn('Failed to save words to storage', e);
    }
  },

  // Load user lists
  async getUserLists(): Promise<WordList[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_LISTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load user lists', e);
    }
    return INITIAL_USER_LISTS;
  },

  // Save user lists
  async saveUserLists(lists: WordList[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_LISTS, JSON.stringify(lists));
    } catch (e) {
      console.warn('Failed to save user lists', e);
    }
  },

  // Load other lists
  async getOtherLists(): Promise<WordList[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.OTHER_LISTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load other lists from storage', e);
    }
    return OTHER_CURATED_LISTS;
  },

  // Save other lists
  async saveOtherLists(lists: WordList[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.OTHER_LISTS, JSON.stringify(lists));
    } catch (e) {
      console.warn('Failed to save other lists to storage', e);
    }
  },

  // Load profile
  async getProfile(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PROFILE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load profile', e);
    }
    return INITIAL_USER_PROFILE;
  },

  // Save profile
  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile', e);
    }
  },

  // Load settings
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load settings', e);
    }
    return INITIAL_APP_SETTINGS;
  },

  // Save settings
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  },

  // Reset Helpers
  async resetUserLists(): Promise<WordList[]> {
    const cleanLists = getCleanUserLists();
    await this.saveUserLists(cleanLists);
    return cleanLists;
  },

  async resetProfile(name?: string, role?: string, email?: string, avatarUrl?: string): Promise<UserProfile> {
    const cleanProfile = getCleanUserProfile(name, role, email, avatarUrl);
    await this.saveProfile(cleanProfile);
    return cleanProfile;
  },

  async resetAll(): Promise<void> {
    try {
      const cleanLists = getCleanUserLists();
      const cleanProfile = getCleanUserProfile();
      const cleanSettings = getCleanAppSettings();
      const cleanWords = getCleanVocabularyDatabase();
      const cleanOtherLists = OTHER_CURATED_LISTS;

      await this.saveUserLists(cleanLists);
      await this.saveProfile(cleanProfile);
      await this.saveSettings(cleanSettings);
      await this.saveWords(cleanWords);
      await this.saveOtherLists(cleanOtherLists);

      // Clear high scores
      await AsyncStorage.multiRemove([
        KEYS.HIGHSCORE_GUESS,
        KEYS.HIGHSCORE_CROSSWORD,
        KEYS.HIGHSCORE_MATCH,
        KEYS.HIGHSCORE_SCRAMBLE,
        KEYS.HIGHSCORE_HANGMAN,
      ]);
    } catch (e) {
      console.warn('Failed to reset all data in storage', e);
    }
  },

  // High Scores
  async getHighScore(gameId: string): Promise<number> {
    try {
      const key = `@wordmem_highscore_${gameId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? parseInt(data, 10) || 0 : 0;
    } catch {
      return 0;
    }
  },

  async saveHighScore(gameId: string, score: number): Promise<void> {
    try {
      const key = `@wordmem_highscore_${gameId}`;
      await AsyncStorage.setItem(key, score.toString());
    } catch (e) {
      console.warn('Failed to save highscore', e);
    }
  },
};
