import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word, WordList, UserProfile, AppSettings } from '../types';
import {
  VOCABULARY_DATABASE,
  INITIAL_USER_LISTS,
  INITIAL_USER_PROFILE,
  INITIAL_APP_SETTINGS,
} from '../data/mockData';

const KEYS = {
  WORDS: '@wordmem_words',
  USER_LISTS: '@wordmem_user_lists',
  OTHER_LISTS: '@wordmem_other_lists',
  PROFILE: '@wordmem_profile',
  SETTINGS: '@wordmem_settings',
  HIGHSCORE_GUESS: '@wordmem_highscore_guess',
  HIGHSCORE_CROSSWORD: '@wordmem_highscore_crossword',
  HIGHSCORE_MATCH: '@wordmem_highscore_match',
  HIGHSCORE_SCRAMBLE: '@wordmem_highscore_scramble',
  HIGHSCORE_HANGMAN: '@wordmem_highscore_hangman',
};

export const StorageService = {
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
