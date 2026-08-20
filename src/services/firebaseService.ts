// src/services/firebaseService.ts
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Word, WordList, UserProfile, AppSettings } from '../types';

// Firestore undefined değerleri kabul etmediği için objeyi temizler
const sanitize = <T>(data: T): T => JSON.parse(JSON.stringify(data));

export const FirebaseService = {
    // 1. Kullanıcı Kelimeleri (Hem ana dökümana hem de alt koleksiyona yazar)
    async saveUserWords(userId: string, words: Word[]): Promise<void> {
        try {
            if (!userId) return;
            const cleanWords = sanitize(words);
            const now = new Date().toISOString();

            // A) Alt koleksiyon: users/{userId}/data/words
            const userSubDocRef = doc(db, 'users', userId, 'data', 'words');
            await setDoc(userSubDocRef, { words: cleanWords, count: cleanWords.length, updatedAt: now });

            // B) Ana döküman: users/{userId} (Firebase konsolunda doğrudan görünsün)
            const userMainRef = doc(db, 'users', userId);
            await setDoc(userMainRef, {
                words: cleanWords,
                wordsCount: cleanWords.length,
                lastUpdated: now,
            }, { merge: true });

            console.log(`🔥 [Firestore] ${cleanWords.length} adet kelime buluta başarıyla kaydedildi! (User: ${userId})`);
        } catch (error) {
            console.error('❌ [Firestore] saveUserWords hatası:', error);
        }
    },

    async getUserWords(userId: string): Promise<Word[] | null> {
        try {
            if (!userId) return null;
            // 1. Önce alt koleksiyona bak
            const userSubDocRef = doc(db, 'users', userId, 'data', 'words');
            const snap = await getDoc(userSubDocRef);
            if (snap.exists() && snap.data()?.words && Array.isArray(snap.data().words) && snap.data().words.length > 0) {
                return snap.data().words as Word[];
            }

            // 2. Bulamazsa ana dökümandan dene
            const userMainRef = doc(db, 'users', userId);
            const mainSnap = await getDoc(userMainRef);
            if (mainSnap.exists() && mainSnap.data()?.words && Array.isArray(mainSnap.data().words)) {
                return mainSnap.data().words as Word[];
            }
        } catch (error) {
            console.error('❌ [Firestore] getUserWords hatası:', error);
        }
        return null;
    },

    // 2. Kullanıcı Listeleri
    async saveUserLists(userId: string, lists: WordList[]): Promise<void> {
        try {
            if (!userId) return;
            const cleanLists = sanitize(lists);
            const now = new Date().toISOString();

            const userSubDocRef = doc(db, 'users', userId, 'data', 'lists');
            await setDoc(userSubDocRef, { lists: cleanLists, count: cleanLists.length, updatedAt: now });

            const userMainRef = doc(db, 'users', userId);
            await setDoc(userMainRef, {
                userListsCount: cleanLists.length,
                lastUpdated: now,
            }, { merge: true });

            console.log(`🔥 [Firestore] ${cleanLists.length} adet liste buluta kaydedildi.`);
        } catch (error) {
            console.error('❌ [Firestore] saveUserLists hatası:', error);
        }
    },

    async getUserLists(userId: string): Promise<WordList[] | null> {
        try {
            if (!userId) return null;
            const userRef = doc(db, 'users', userId, 'data', 'lists');
            const snap = await getDoc(userRef);
            if (snap.exists() && snap.data()?.lists) {
                return snap.data().lists as WordList[];
            }
        } catch (error) {
            console.error('❌ [Firestore] getUserLists hatası:', error);
        }
        return null;
    },

    // 3. Kullanıcı Profili
    async saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
        try {
            if (!userId) return;
            const cleanProfile = sanitize(profile);
            const now = new Date().toISOString();

            const userRef = doc(db, 'users', userId, 'data', 'profile');
            await setDoc(userRef, { profile: cleanProfile, updatedAt: now });

            // Ana kullanıcı dökümanını da güncelle
            const mainUserRef = doc(db, 'users', userId);
            await setDoc(mainUserRef, {
                name: cleanProfile.name,
                role: cleanProfile.role,
                avatarUrl: cleanProfile.avatarUrl,
                gender: cleanProfile.gender || 'male',
                wordsLearned: cleanProfile.wordsLearned,
                activeStreak: cleanProfile.activeStreak,
                updatedAt: now,
            }, { merge: true });

            console.log('🔥 [Firestore] Profil buluta kaydedildi:', cleanProfile.name);
        } catch (error) {
            console.error('❌ [Firestore] saveUserProfile hatası:', error);
        }
    },

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            if (!userId) return null;
            const userRef = doc(db, 'users', userId, 'data', 'profile');
            const snap = await getDoc(userRef);
            if (snap.exists() && snap.data()?.profile) {
                return snap.data().profile as UserProfile;
            }
        } catch (error) {
            console.error('❌ [Firestore] getUserProfile hatası:', error);
        }
        return null;
    },

    // 4. Uygulama Ayarları
    async saveAppSettings(userId: string, settings: AppSettings): Promise<void> {
        try {
            if (!userId) return;
            const cleanSettings = sanitize(settings);
            const userRef = doc(db, 'users', userId, 'data', 'settings');
            await setDoc(userRef, { settings: cleanSettings, updatedAt: new Date().toISOString() });
            console.log('🔥 [Firestore] Ayarlar buluta kaydedildi.');
        } catch (error) {
            console.error('❌ [Firestore] saveAppSettings hatası:', error);
        }
    },

    async getAppSettings(userId: string): Promise<AppSettings | null> {
        try {
            if (!userId) return null;
            const userRef = doc(db, 'users', userId, 'data', 'settings');
            const snap = await getDoc(userRef);
            if (snap.exists() && snap.data()?.settings) {
                return snap.data().settings as AppSettings;
            }
        } catch (error) {
            console.error('❌ [Firestore] getAppSettings hatası:', error);
        }
        return null;
    },

    // 5. Oyun Yüksek Skorları
    async saveHighScore(userId: string, gameId: string, score: number): Promise<void> {
        try {
            if (!userId) return;
            const userRef = doc(db, 'users', userId, 'data', 'highscores');
            await setDoc(userRef, { [gameId]: score }, { merge: true });
        } catch (error) {
            console.error('❌ [Firestore] saveHighScore hatası:', error);
        }
    },

    async getHighScore(userId: string, gameId: string): Promise<number | null> {
        try {
            if (!userId) return null;
            const userRef = doc(db, 'users', userId, 'data', 'highscores');
            const snap = await getDoc(userRef);
            if (snap.exists() && snap.data()[gameId] !== undefined) {
                return snap.data()[gameId] as number;
            }
        } catch (error) {
            console.error('❌ [Firestore] getHighScore hatası:', error);
        }
        return null;
    },
};