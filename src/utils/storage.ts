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
  WORDS_LEGACY: '@wordmem_words',
  WORDS_DELTA: '@wordmem_words_delta_v2',
  USER_LISTS: '@wordmem_user_lists',
  OTHER_LISTS_LEGACY: '@wordmem_other_lists',
  OTHER_LISTS_MASTERY: '@wordmem_other_lists_mastery_v2',
  PROFILE: '@wordmem_profile',
  SETTINGS: '@wordmem_settings',
  DATA_CLEAN_VERSION: '@wordmem_data_clean_v3',
  HIGHSCORE_GUESS: '@wordmem_highscore_guess',
  HIGHSCORE_CROSSWORD: '@wordmem_highscore_crossword',
  HIGHSCORE_MATCH: '@wordmem_highscore_match',
  HIGHSCORE_SCRAMBLE: '@wordmem_highscore_scramble',
  HIGHSCORE_HANGMAN: '@wordmem_highscore_hangman',
};

// Hızlı arama için yerleşik kelime haritası
const builtInWordsMap = new Map<string, Word>(
  VOCABULARY_DATABASE.map((w) => [w.id, w])
);

interface WordsStoragePayload {
  customWords: Word[];
  overrides: Record<string, Partial<Word>>;
}

export const StorageService = {
  KEYS,

  // Load words (Hafif delta ve özel kelime formatı ile yükler)
  async getWords(): Promise<Word[]> {
    try {
      // 1. Yeni hafif delta formatını kontrol et
      const deltaData = await AsyncStorage.getItem(KEYS.WORDS_DELTA);
      if (deltaData) {
        const parsed: WordsStoragePayload = JSON.parse(deltaData);
        const customWords = parsed.customWords || [];
        const overrides = parsed.overrides || {};

        const mergedBuiltIn = VOCABULARY_DATABASE.map((w) => {
          const override = overrides[w.id];
          return override ? { ...w, ...override } : w;
        });

        return [...customWords, ...mergedBuiltIn];
      }

      // 2. Eski format varsa (CursorWindow hatası vermeden okunabilirse) yeni formata dönüştür
      const legacyData = await AsyncStorage.getItem(KEYS.WORDS_LEGACY).catch(() => null);
      if (legacyData) {
        const legacyWords = JSON.parse(legacyData);
        if (Array.isArray(legacyWords) && legacyWords.length > 0) {
          // Yeni hafif formata kaydet ve eskiyi sil
          await this.saveWords(legacyWords);
          await AsyncStorage.removeItem(KEYS.WORDS_LEGACY).catch(() => {});
          return legacyWords;
        }
      }
    } catch (e) {
      console.warn('Failed to load words from storage, using default vocabulary database', e);
      // Hatalı/aşırı büyük legacy kaydı temizle
      AsyncStorage.removeItem(KEYS.WORDS_LEGACY).catch(() => {});
    }
    return VOCABULARY_DATABASE;
  },

  // Save words (4600 kelimeyi tekrar yazmak yerine sadece kullanıcının eklediği ve değiştirdiği kısımları kaydeder)
  async saveWords(words: Word[]): Promise<void> {
    try {
      const customWords: Word[] = [];
      const overrides: Record<string, Partial<Word>> = {};

      (words || []).forEach((w) => {
        if (!w || !w.id) return;
        const orig = builtInWordsMap.get(w.id);

        if (!orig) {
          // Kullanıcının kendi eklediği yeni kelime
          customWords.push(w);
        } else {
          // Yerleşik kelimede değişiklik var mı?
          const isFavChanged = w.isFavorite !== orig.isFavorite;
          const isMasteryChanged = w.mastery !== orig.mastery;
          const isReviewedChanged = w.lastReviewed !== orig.lastReviewed;
          const isListsChanged =
            JSON.stringify(w.lists || []) !== JSON.stringify(orig.lists || []);

          if (isFavChanged || isMasteryChanged || isReviewedChanged || isListsChanged) {
            overrides[w.id] = {
              ...(isFavChanged ? { isFavorite: w.isFavorite } : {}),
              ...(isMasteryChanged ? { mastery: w.mastery } : {}),
              ...(isReviewedChanged ? { lastReviewed: w.lastReviewed } : {}),
              ...(isListsChanged ? { lists: w.lists } : {}),
            };
          }
        }
      });

      const payload: WordsStoragePayload = { customWords, overrides };
      await AsyncStorage.setItem(KEYS.WORDS_DELTA, JSON.stringify(payload));

      // Eski 2MB+ devasa JSON anahtarını temizle
      await AsyncStorage.removeItem(KEYS.WORDS_LEGACY).catch(() => {});
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

  // Load other lists (Küratörlü listeler statik olarak bundle içindedir; sadece liste hakimiyet (mastery) oranları yüklenir)
  async getOtherLists(): Promise<WordList[]> {
    try {
      // 1. Android SQLite CursorWindow 2MB sınırını aşan eski 5MB'lık devasa @wordmem_other_lists kaydını temizle
      AsyncStorage.removeItem(KEYS.OTHER_LISTS_LEGACY).catch(() => {});

      // 2. Hafif mastery haritasını oku
      const masteryData = await AsyncStorage.getItem(KEYS.OTHER_LISTS_MASTERY);
      const masteryMap: Record<string, number> = masteryData ? JSON.parse(masteryData) : {};

      // 3. Güncel mastery değerlerini OTHER_CURATED_LISTS üzerine aktar
      return OTHER_CURATED_LISTS.map((list) => ({
        ...list,
        mastery:
          typeof masteryMap[list.id] === 'number'
            ? masteryMap[list.id]
            : (list.mastery || 0),
      }));
    } catch (e) {
      console.warn('Failed to load other lists from storage', e);
      return OTHER_CURATED_LISTS;
    }
  },

  // Save other lists (5MB kelime verisi yerine yalnızca liste ID ve mastery oranlarını kaydeder - <100 byte)
  async saveOtherLists(lists: WordList[]): Promise<void> {
    try {
      const masteryMap: Record<string, number> = {};
      (lists || []).forEach((l) => {
        if (l && l.id) {
          masteryMap[l.id] = typeof l.mastery === 'number' ? l.mastery : 0;
        }
      });
      await AsyncStorage.setItem(KEYS.OTHER_LISTS_MASTERY, JSON.stringify(masteryMap));

      // Eski devasa anahtarı temizle
      await AsyncStorage.removeItem(KEYS.OTHER_LISTS_LEGACY).catch(() => {});
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
        const parsed = JSON.parse(data);
        const { subscription, ...rest } = parsed;
        return { ...INITIAL_APP_SETTINGS, ...rest };
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

      // Clear legacy keys & high scores
      await AsyncStorage.multiRemove([
        KEYS.WORDS_LEGACY,
        KEYS.OTHER_LISTS_LEGACY,
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
