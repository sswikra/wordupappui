// src/services/firebaseService.ts
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Word, WordList, UserProfile, AppSettings } from '../types';

// Firestore undefined değerleri kabul etmediği için objeyi temizler
const sanitize = <T>(data: T): T => JSON.parse(JSON.stringify(data));

export const FirebaseService = {
    // 1. Kullanıcı Kelimeleri
    async saveUserWords(userId: string, words: Word[]): Promise<void> {
        try {
            const cleanWords = sanitize(words);
            const userRef = doc(db, 'users', userId, 'data', 'words');
            await setDoc(userRef, { words: cleanWords, updatedAt: new Date().toISOString() });
            console.log(`✅ [Firestore] ${cleanWords.length} adet kelime buluta kaydedildi.`);
        } catch (error) {
            console.error('❌ [Firestore] saveUserWords hatası:', error);
        }
    },

    async getUserWords(userId: string): Promise<Word[] | null> {
        try {
            const userRef = doc(db, 'users', userId, 'data', 'words');
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                return snap.data().words as Word[];
            }
        } catch (error) {
            console.error('❌ [Firestore] getUserWords hatası:', error);
        }
        return null;
    },

    // 2. Kullanıcı Listeleri
    async saveUserLists(userId: string, lists: WordList[]): Promise<void> {
        try {
            const cleanLists = sanitize(lists);
            const userRef = doc(db, 'users', userId, 'data', 'lists');
            await setDoc(userRef, { lists: cleanLists, updatedAt: new Date().toISOString() });
            console.log(`✅ [Firestore] ${cleanLists.length} adet liste buluta kaydedildi.`);
        } catch (error) {
            console.error('❌ [Firestore] saveUserLists hatası:', error);
        }
    },

    async getUserLists(userId: string): Promise<WordList[] | null> {
        try {
            const userRef = doc(db, 'users', userId, 'data', 'lists');
            const snap = await getDoc(userRef);
            if (snap.exists()) {
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
            const cleanProfile = sanitize(profile);
            const userRef = doc(db, 'users', userId, 'data', 'profile');
            await setDoc(userRef, { profile: cleanProfile, updatedAt: new Date().toISOString() });

            // Ana kullanıcı dökümanını da güncelle
            const mainUserRef = doc(db, 'users', userId);
            await setDoc(mainUserRef, {
                name: cleanProfile.name,
                role: cleanProfile.role,
                updatedAt: new Date().toISOString(),
            }, { merge: true });

            console.log('✅ [Firestore] Profil buluta kaydedildi:', cleanProfile.name);
        } catch (error) {
            console.error('❌ [Firestore] saveUserProfile hatası:', error);
        }
    },

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            const userRef = doc(db, 'users', userId, 'data', 'profile');
            const snap = await getDoc(userRef);
            if (snap.exists()) {
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
            const cleanSettings = sanitize(settings);
            const userRef = doc(db, 'users', userId, 'data', 'settings');
            await setDoc(userRef, { settings: cleanSettings, updatedAt: new Date().toISOString() });
            console.log('✅ [Firestore] Ayarlar buluta kaydedildi.');
        } catch (error) {
            console.error('❌ [Firestore] saveAppSettings hatası:', error);
        }
    },

    async getAppSettings(userId: string): Promise<AppSettings | null> {
        try {
            const userRef = doc(db, 'users', userId, 'data', 'settings');
            const snap = await getDoc(userRef);
            if (snap.exists()) {
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
            const userRef = doc(db, 'users', userId, 'data', 'highscores');
            await setDoc(userRef, { [gameId]: score }, { merge: true });
        } catch (error) {
            console.error('❌ [Firestore] saveHighScore hatası:', error);
        }
    },

    async getHighScore(userId: string, gameId: string): Promise<number | null> {
        try {
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