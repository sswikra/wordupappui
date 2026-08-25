// src/services/firebaseService.ts
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
  query,
  limit,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Word, WordList, UserProfile, AppSettings } from '../types';

// Firestore undefined değerleri kabul etmediği için objeyi temizler
const sanitize = <T>(data: T): T => JSON.parse(JSON.stringify(data));

// Seviye isimleri ve meta bilgileri
const LEVEL_METADATA: Record<string, { name: string; description: string }> = {
  A1: { name: 'A1 - Beginner', description: 'Temel günlük kelimeler ve ifadeler' },
  A2: { name: 'A2 - Elementary', description: 'Günlük yaşam ve temel diyalog kelimeleri' },
  B1: { name: 'B1 - Intermediate', description: 'Orta seviye akıcı konuşma ve metin kelimeleri' },
  B2: { name: 'B2 - Upper Intermediate', description: 'İleri orta seviye akademik ve profesyonel kelimeler' },
  C1: { name: 'C1 - Advanced', description: 'İleri seviye yetkinlik ve zengin kelime haznesi' },
  C2: { name: 'C2 - Mastery', description: 'Ana dil düzeyinde üstün kelime hakimiyeti' },
};

export const FirebaseService = {
  // =========================================================================
  // 1. GENEL SEVİYE KELİMELERİ (GLOBAL LEVELS HIERARCHY)
  // Hiyerarşi: /levels (Collection) -> {levelId} (Document) -> words (Subcollection) -> {wordId} (Document)
  // =========================================================================

  /**
   * Tüm kelimeleri seviyelerine göre gruplayıp /levels/{levelId}/words/{wordId} hiyerarşisinde batch olarak yükler.
   */
  async seedGlobalVocabulary(words: Word[]): Promise<{ success: boolean; totalCount: number; error?: string }> {
    try {
      if (!words || words.length === 0) {
        return { success: false, totalCount: 0, error: 'Yüklenecek kelime bulunamadı.' };
      }

      const cleanWords = sanitize(words);
      const now = new Date().toISOString();

      // Kelimeleri seviyelerine göre grupla (A1, A2, B1, B2, ...)
      const wordsByLevel: Record<string, Word[]> = {};
      cleanWords.forEach((w) => {
        const lvl = w.level || 'A1';
        if (!wordsByLevel[lvl]) wordsByLevel[lvl] = [];
        wordsByLevel[lvl].push(w);
      });

      let totalUploaded = 0;

      // Her seviye için ana dökümanı ve altındaki kelime subcollection'ını yaz
      for (const [levelId, levelWords] of Object.entries(wordsByLevel)) {
        // 1. Seviye Ana Dökümanı: /levels/{levelId}
        const levelDocRef = doc(db, 'levels', levelId);
        const meta = LEVEL_METADATA[levelId] || { name: `${levelId} Vocabulary`, description: '' };
        await setDoc(
          levelDocRef,
          {
            id: levelId,
            name: meta.name,
            description: meta.description,
            wordCount: levelWords.length,
            lastUpdated: now,
          },
          { merge: true }
        );

        // 2. Alt Koleksiyon: /levels/{levelId}/words/{wordId}
        // Firestore 500 batch limitine uygun olarak 400'lük paketler halinde yaz
        const CHUNK_SIZE = 400;
        for (let i = 0; i < levelWords.length; i += CHUNK_SIZE) {
          const chunk = levelWords.slice(i, i + CHUNK_SIZE);
          const batch = writeBatch(db);

          chunk.forEach((word) => {
            const wordDocRef = doc(db, 'levels', levelId, 'words', word.id);
            batch.set(wordDocRef, {
              ...word,
              updatedAt: now,
            });
          });

          await batch.commit();
        }

        totalUploaded += levelWords.length;
        console.log(`🔥 [Firestore] /levels/${levelId}/words altına ${levelWords.length} kelime başarıyla yüklendi.`);
      }

      console.log(`✅ [Firestore] Toplam ${totalUploaded} kelime subcollection hiyerarşisinde kaydedildi!`);
      return { success: true, totalCount: totalUploaded };
    } catch (error: any) {
      console.error('❌ [Firestore] seedGlobalVocabulary hatası:', error);
      return { success: false, totalCount: 0, error: error?.message || 'Bilinmeyen hata' };
    }
  },

  /**
   * Belirli bir seviyedeki kelimeleri /levels/{levelId}/words alt koleksiyonundan çeker.
   */
  async getLevelWords(levelId: string): Promise<Word[]> {
    try {
      const wordsColRef = collection(db, 'levels', levelId, 'words');
      const snapshot = await getDocs(wordsColRef);
      const words: Word[] = [];
      snapshot.forEach((docSnap) => {
        words.push(docSnap.data() as Word);
      });
      return words;
    } catch (error) {
      console.error(`❌ [Firestore] getLevelWords (${levelId}) hatası:`, error);
      return [];
    }
  },

  /**
   * Tüm seviyelerdeki kelimeleri /levels/{levelId}/words koleksiyonlarından toplayıp tek bir liste olarak döndürür.
   */
  async getGlobalVocabulary(): Promise<Word[] | null> {
    try {
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const allWords: Word[] = [];

      for (const levelId of levels) {
        const words = await this.getLevelWords(levelId);
        if (words && words.length > 0) {
          allWords.push(...words);
        }
      }

      if (allWords.length > 0) {
        console.log(`🔥 [Firestore] levels/*/words üzerinden toplam ${allWords.length} kelime çekildi.`);
        return allWords;
      }

      // Geriye dönük uyumluluk: Eğer yeni subcollection'da yoksa eski dökümandan dene
      const legacyRef = doc(db, 'system', 'vocabulary');
      const legacySnap = await getDoc(legacyRef);
      if (legacySnap.exists() && Array.isArray(legacySnap.data()?.words)) {
        return legacySnap.data()?.words as Word[];
      }
    } catch (error) {
      console.error('❌ [Firestore] getGlobalVocabulary hatası:', error);
    }
    return null;
  },

  // =========================================================================
  // 2. KÜRATÖRLÜ HAZIR LİSTELER (CURATED LISTS HIERARCHY)
  // Hiyerarşi: /curated_lists (Collection) -> {listId} (Document) -> words (Subcollection) -> {wordId} (Document)
  // =========================================================================

  /**
   * Küratörlü listeleri /curated_lists/{listId} ve altındaki /words/{wordId} subcollection'ına yükler.
   */
  async seedGlobalCuratedLists(lists: WordList[]): Promise<{ success: boolean; count: number }> {
    try {
      const cleanLists = sanitize(lists);
      const now = new Date().toISOString();

      for (const list of cleanLists) {
        // 1. Liste Ana Dokümanı
        const listDocRef = doc(db, 'curated_lists', list.id);
        const { words: listWords, ...listMetadata } = list;

        await setDoc(listDocRef, {
          ...listMetadata,
          count: listWords ? listWords.length : list.count,
          updatedAt: now,
        });

        // 2. Listenin altındaki kelimeler: /curated_lists/{listId}/words/{wordId}
        if (listWords && listWords.length > 0) {
          const CHUNK_SIZE = 400;
          for (let i = 0; i < listWords.length; i += CHUNK_SIZE) {
            const chunk = listWords.slice(i, i + CHUNK_SIZE);
            const batch = writeBatch(db);

            chunk.forEach((word) => {
              const wordRef = doc(db, 'curated_lists', list.id, 'words', word.id);
              batch.set(wordRef, {
                ...word,
                updatedAt: now,
              });
            });

            await batch.commit();
          }
        }
      }

      console.log(`🔥 [Firestore] ${cleanLists.length} adet küratörlü liste ve alt kelimeleri subcollection olarak yüklendi.`);
      return { success: true, count: cleanLists.length };
    } catch (error) {
      console.error('❌ [Firestore] seedGlobalCuratedLists hatası:', error);
      return { success: false, count: 0 };
    }
  },

  /**
   * Küratörlü listeleri ve her listenin altındaki kelimeleri /curated_lists/{listId}/words subcollection'ından çeker.
   */
  async getGlobalCuratedLists(): Promise<WordList[] | null> {
    try {
      const listsColRef = collection(db, 'curated_lists');
      const snapshot = await getDocs(listsColRef);

      if (!snapshot.empty) {
        const result: WordList[] = [];

        for (const listDocSnap of snapshot.docs) {
          const listData = listDocSnap.data();
          const listId = listDocSnap.id;

          // Alt kelime koleksiyonunu çek
          const wordsColRef = collection(db, 'curated_lists', listId, 'words');
          const wordsSnap = await getDocs(wordsColRef);
          const words: Word[] = [];
          wordsSnap.forEach((wSnap) => {
            words.push(wSnap.data() as Word);
          });

          result.push({
            id: listId,
            title: listData.title || listId,
            icon: listData.icon || 'folder',
            count: words.length || listData.count || 0,
            mastery: listData.mastery || 0,
            description: listData.description || '',
            color: listData.color || '#3b82f6',
            words: words,
            isCustom: false,
          });
        }

        return result;
      }

      // Geriye dönük uyumluluk: Eski dökümandan dene
      const legacyRef = doc(db, 'system', 'curated_lists');
      const legacySnap = await getDoc(legacyRef);
      if (legacySnap.exists() && Array.isArray(legacySnap.data()?.lists)) {
        return legacySnap.data()?.lists as WordList[];
      }
    } catch (error) {
      console.error('❌ [Firestore] getGlobalCuratedLists hatası:', error);
    }
    return null;
  },

  // =========================================================================
  // 3. KULLANICI KELİMELERİ (USER WORDS SUBCOLLECTION)
  // Hiyerarşi: /users (Collection) -> {userId} (Document) -> words (Subcollection) -> {wordId} (Document)
  // =========================================================================

  /**
   * Tek bir kelimeyi kullanıcının alt koleksiyonuna yazar/günceller.
   */
  async saveUserWord(userId: string, word: Word): Promise<void> {
    try {
      if (!userId || !word || !word.id) return;
      const cleanWord = sanitize(word);
      const now = new Date().toISOString();

      // /users/{userId}/words/{wordId}
      const wordRef = doc(db, 'users', userId, 'words', word.id);
      await setDoc(wordRef, {
        ...cleanWord,
        updatedAt: now,
      }, { merge: true });

      // Ana kullanıcı dökümanında son güncelleme zamanını kaydet
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { lastUpdated: now }, { merge: true });
    } catch (error) {
      console.error('❌ [Firestore] saveUserWord hatası:', error);
    }
  },

  /**
   * Kullanıcının tüm kelimelerini /users/{userId}/words/{wordId} subcollection'ına batch olarak yazar.
   * Asla tek bir 1 MB döküman içine gömülmez!
   */
  async saveUserWords(userId: string, words: Word[]): Promise<void> {
    try {
      if (!userId || !words) return;
      const cleanWords = sanitize(words);
      const now = new Date().toISOString();

      // Batch olarak /users/{userId}/words/{wordId} dokümanlarına yaz
      const CHUNK_SIZE = 400;
      for (let i = 0; i < cleanWords.length; i += CHUNK_SIZE) {
        const chunk = cleanWords.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);

        chunk.forEach((w) => {
          if (w && w.id) {
            const wordDocRef = doc(db, 'users', userId, 'words', w.id);
            batch.set(wordDocRef, { ...w, updatedAt: now }, { merge: true });
          }
        });

        await batch.commit();
      }

      // Ana dökümanda sadece özet sayaç ve tarih tutulur
      const userMainRef = doc(db, 'users', userId);
      await setDoc(
        userMainRef,
        {
          wordsCount: cleanWords.length,
          lastUpdated: now,
        },
        { merge: true }
      );

      console.log(`🔥 [Firestore] ${cleanWords.length} kelime /users/${userId}/words subcollection'ına kaydedildi.`);
    } catch (error) {
      console.error('❌ [Firestore] saveUserWords hatası:', error);
    }
  },

  /**
   * Kullanıcının kelimelerini /users/{userId}/words alt koleksiyonundan çeker.
   */
  async getUserWords(userId: string): Promise<Word[] | null> {
    try {
      if (!userId) return null;

      // 1. Doğrudan alt koleksiyondan oku: /users/{userId}/words
      const userWordsColRef = collection(db, 'users', userId, 'words');
      const snapshot = await getDocs(userWordsColRef);

      if (!snapshot.empty) {
        const words: Word[] = [];
        snapshot.forEach((d) => {
          words.push(d.data() as Word);
        });
        return words;
      }

      // 2. Geriye dönük uyumluluk / Otomatik Geçiş:
      // Eğer alt koleksiyon henüz boşsa eski döküman formatına bak ve gerekirse yeni yapıya migrate et
      const legacySubDoc = doc(db, 'users', userId, 'data', 'words');
      const legacySnap = await getDoc(legacySubDoc);
      if (legacySnap.exists() && Array.isArray(legacySnap.data()?.words) && legacySnap.data().words.length > 0) {
        const oldWords = legacySnap.data().words as Word[];
        // Arka planda yeni subcollection yapısına taşı
        this.saveUserWords(userId, oldWords).catch((err) => console.warn('Otomatik migrasyon hatası:', err));
        return oldWords;
      }
    } catch (error) {
      console.error('❌ [Firestore] getUserWords hatası:', error);
    }
    return null;
  },

  /**
   * Kullanıcının belirli bir kelimesini alt koleksiyondan siler.
   */
  async deleteUserWord(userId: string, wordId: string): Promise<void> {
    try {
      if (!userId || !wordId) return;
      const wordRef = doc(db, 'users', userId, 'words', wordId);
      await deleteDoc(wordRef);
    } catch (error) {
      console.error('❌ [Firestore] deleteUserWord hatası:', error);
    }
  },

  // =========================================================================
  // 4. KULLANICI ÖZEL LİSTELERİ (USER LISTS SUBCOLLECTION)
  // Hiyerarşi: /users (Collection) -> {userId} (Document) -> lists (Subcollection) -> {listId} (Document)
  // =========================================================================

  /**
   * Kullanıcının özel listelerini /users/{userId}/lists/{listId} olarak kaydeder.
   */
  async saveUserLists(userId: string, lists: WordList[]): Promise<void> {
    try {
      if (!userId || !lists) return;
      const cleanLists = sanitize(lists);
      const now = new Date().toISOString();

      const batch = writeBatch(db);
      cleanLists.forEach((list) => {
        if (list && list.id) {
          const listRef = doc(db, 'users', userId, 'lists', list.id);
          batch.set(listRef, {
            ...list,
            updatedAt: now,
          });
        }
      });
      await batch.commit();

      const userMainRef = doc(db, 'users', userId);
      await setDoc(userMainRef, { userListsCount: cleanLists.length, lastUpdated: now }, { merge: true });

      console.log(`🔥 [Firestore] ${cleanLists.length} adet liste /users/${userId}/lists altına kaydedildi.`);
    } catch (error) {
      console.error('❌ [Firestore] saveUserLists hatası:', error);
    }
  },

  /**
   * Kullanıcının listelerini /users/{userId}/lists alt koleksiyonundan çeker.
   */
  async getUserLists(userId: string): Promise<WordList[] | null> {
    try {
      if (!userId) return null;

      const listsColRef = collection(db, 'users', userId, 'lists');
      const snapshot = await getDocs(listsColRef);

      if (!snapshot.empty) {
        const lists: WordList[] = [];
        snapshot.forEach((d) => {
          lists.push(d.data() as WordList);
        });
        return lists;
      }

      // Geriye dönük uyumluluk: Eski 'data/lists' dökümanı
      const legacyRef = doc(db, 'users', userId, 'data', 'lists');
      const legacySnap = await getDoc(legacyRef);
      if (legacySnap.exists() && Array.isArray(legacySnap.data()?.lists)) {
        const oldLists = legacySnap.data()?.lists as WordList[];
        this.saveUserLists(userId, oldLists).catch((err) => console.warn('Liste migrasyon hatası:', err));
        return oldLists;
      }
    } catch (error) {
      console.error('❌ [Firestore] getUserLists hatası:', error);
    }
    return null;
  },

  async deleteUserList(userId: string, listId: string): Promise<void> {
    try {
      if (!userId || !listId) return;
      const listRef = doc(db, 'users', userId, 'lists', listId);
      await deleteDoc(listRef);
    } catch (error) {
      console.error('❌ [Firestore] deleteUserList hatası:', error);
    }
  },

  /**
   * Kullanıcının listelerini temiz 3 standart listeye sıfırlar ve özel listeleri siler.
   */
  async resetUserLists(userId: string, cleanLists: WordList[]): Promise<void> {
    try {
      if (!userId || !cleanLists) return;
      const now = new Date().toISOString();

      // Mevcut listeleri çek
      const listsColRef = collection(db, 'users', userId, 'lists');
      const snapshot = await getDocs(listsColRef);

      const batch = writeBatch(db);
      // Eski tüm özel listeleri sil
      snapshot.forEach((d) => {
        batch.delete(d.ref);
      });

      // Temiz 3 listeyi yeniden yaz
      cleanLists.forEach((list) => {
        if (list && list.id) {
          const listRef = doc(db, 'users', userId, 'lists', list.id);
          batch.set(listRef, {
            ...list,
            count: 0,
            mastery: 0,
            words: [],
            updatedAt: now,
          });
        }
      });

      await batch.commit();

      const userMainRef = doc(db, 'users', userId);
      await setDoc(userMainRef, { userListsCount: cleanLists.length, lastUpdated: now }, { merge: true });
      console.log(`🔥 [Firestore] Kullanıcı (${userId}) listeleri sıfırlandı.`);
    } catch (error) {
      console.error('❌ [Firestore] resetUserLists hatası:', error);
    }
  },

  // =========================================================================
  // 5. KULLANICI PROFİLİ (USER PROFILE)
  // =========================================================================

  async saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
    try {
      if (!userId || !profile) return;
      const cleanProfile = sanitize(profile);
      const now = new Date().toISOString();

      const mainUserRef = doc(db, 'users', userId);
      await setDoc(
        mainUserRef,
        {
          name: cleanProfile.name || 'Öğrenci',
          role: cleanProfile.role || 'Kelime Kaşifi',
          avatarUrl: cleanProfile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop&q=80',
          gender: cleanProfile.gender || 'male',
          wordsLearned: typeof cleanProfile.wordsLearned === 'number' ? cleanProfile.wordsLearned : 0,
          activeStreak: typeof cleanProfile.activeStreak === 'number' ? cleanProfile.activeStreak : 0,
          lastActiveDate: cleanProfile.lastActiveDate || null,
          wordsThisWeek: typeof cleanProfile.wordsThisWeek === 'number' ? cleanProfile.wordsThisWeek : 0,
          gamesPlayed: typeof cleanProfile.gamesPlayed === 'number' ? cleanProfile.gamesPlayed : 0,
          overallAccuracy: typeof cleanProfile.overallAccuracy === 'number' ? cleanProfile.overallAccuracy : 100,
          weeklyActivity: Array.isArray(cleanProfile.weeklyActivity) ? cleanProfile.weeklyActivity : [
            { day: 'Pzt', count: 0, active: false },
            { day: 'Sal', count: 0, active: false },
            { day: 'Çar', count: 0, active: false },
            { day: 'Per', count: 0, active: false },
            { day: 'Cum', count: 0, active: false },
            { day: 'Cmt', count: 0, active: false },
            { day: 'Paz', count: 0, active: false },
          ],
          badges: Array.isArray(cleanProfile.badges) ? cleanProfile.badges : [],
          updatedAt: now,
        },
        { merge: true }
      );

      console.log('🔥 [Firestore] Kullanıcı profili kaydedildi:', cleanProfile.name);
    } catch (error) {
      console.error('❌ [Firestore] saveUserProfile hatası:', error);
    }
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!userId) return null;
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists() && snap.data()?.name) {
        const data = snap.data();
        return {
          name: data.name || 'Misafir Öğrenci',
          role: data.role || 'Misafir Hesap',
          avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop&q=80',
          gender: data.gender || 'male',
          wordsLearned: typeof data.wordsLearned === 'number' ? data.wordsLearned : 0,
          activeStreak: typeof data.activeStreak === 'number' ? data.activeStreak : 0,
          lastActiveDate: data.lastActiveDate || null,
          wordsThisWeek: typeof data.wordsThisWeek === 'number' ? data.wordsThisWeek : 0,
          gamesPlayed: typeof data.gamesPlayed === 'number' ? data.gamesPlayed : 0,
          overallAccuracy: typeof data.overallAccuracy === 'number' ? data.overallAccuracy : 100,
          weeklyActivity: Array.isArray(data.weeklyActivity) && data.weeklyActivity.length === 7 ? data.weeklyActivity : [
            { day: 'Pzt', count: 0, active: false },
            { day: 'Sal', count: 0, active: false },
            { day: 'Çar', count: 0, active: false },
            { day: 'Per', count: 0, active: false },
            { day: 'Cum', count: 0, active: false },
            { day: 'Cmt', count: 0, active: false },
            { day: 'Paz', count: 0, active: false },
          ],
          badges: Array.isArray(data.badges) ? data.badges : [],
        };
      }
    } catch (error) {
      console.error('❌ [Firestore] getUserProfile hatası:', error);
    }
    return null;
  },

  // =========================================================================
  // 6. UYGULAMA AYARLARI (APP SETTINGS SUBCOLLECTION)
  // Hiyerarşi: /users/{userId}/settings/preferences
  // =========================================================================

  async saveAppSettings(userId: string, settings: AppSettings): Promise<void> {
    try {
      if (!userId || !settings) return;
      const cleanSettings = sanitize(settings);
      const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
      await setDoc(settingsRef, {
        ...cleanSettings,
        updatedAt: new Date().toISOString(),
      });
      console.log('🔥 [Firestore] Ayarlar /users/{userId}/settings/preferences dokümanına kaydedildi.');
    } catch (error) {
      console.error('❌ [Firestore] saveAppSettings hatası:', error);
    }
  },

  async getAppSettings(userId: string): Promise<AppSettings | null> {
    try {
      if (!userId) return null;
      const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
      const snap = await getDoc(settingsRef);
      if (snap.exists()) {
        return snap.data() as AppSettings;
      }
    } catch (error) {
      console.error('❌ [Firestore] getAppSettings hatası:', error);
    }
    return null;
  },

  // =========================================================================
  // 7. OYUN SKORLARI (GAME HIGH SCORES SUBCOLLECTION)
  // Hiyerarşi: /users/{userId}/game_scores/{gameId}
  // =========================================================================

  async saveHighScore(userId: string, gameId: string, score: number): Promise<void> {
    try {
      if (!userId || !gameId) return;
      const scoreRef = doc(db, 'users', userId, 'game_scores', gameId);
      await setDoc(
        scoreRef,
        {
          gameId,
          score,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('❌ [Firestore] saveHighScore hatası:', error);
    }
  },

  async getHighScore(userId: string, gameId: string): Promise<number | null> {
    try {
      if (!userId || !gameId) return null;
      const scoreRef = doc(db, 'users', userId, 'game_scores', gameId);
      const snap = await getDoc(scoreRef);
      if (snap.exists() && typeof snap.data()?.score === 'number') {
        return snap.data().score as number;
      }
    } catch (error) {
      console.error('❌ [Firestore] getHighScore hatası:', error);
    }
    return null;
  },

  /**
   * Kullanıcının tüm verilerini (listeler, profil istatistikleri, kelime favorileri) sıfırlar.
   */
  async resetUserData(userId: string, cleanProfile: UserProfile, cleanLists: WordList[], cleanWords: Word[]): Promise<void> {
    try {
      if (!userId) return;
      await this.resetUserLists(userId, cleanLists);
      await this.saveUserProfile(userId, cleanProfile);
      await this.saveUserWords(userId, cleanWords);
      console.log(`🔥 [Firestore] Kullanıcı (${userId}) tüm verileri sıfırlandı.`);
    } catch (error) {
      console.error('❌ [Firestore] resetUserData hatası:', error);
    }
  },
};