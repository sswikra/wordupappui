// src/services/firebaseService.ts
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Word, WordList, UserProfile, AppSettings } from '../types';

export const FirebaseService = {
    // 1. Kullanıcı Kelimeleri
    async saveUserWords(userId: string, words: Word[]): Promise<void> {
        try {
            const userRef = doc(db, 'users', userId, 'data', 'words');
            await setDoc(userRef, { words, updatedAt: new Date().toISOString() });
        } catch (error) {
            console.warn('Firebase saveUserWords hatası:', error);
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
            console.warn('Firebase getUserWords hatası:', error);
        }
        return null;
    },

    // 2. Kullanıcı Listeleri
    async saveUserLists(userId: string, lists: WordList[]): Promise<void> {
        try {
            const userRef = doc(db, 'users', userId, 'data', 'lists');
            await setDoc(userRef, { lists, updatedAt: new Date().toISOString() });
        } catch (error) {
            console.warn('Firebase saveUserLists hatası:', error);
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
            console.warn('Firebase getUserLists hatası:', error);
        }
        return null;
    },

    // 3. Kullanıcı Profili
    async saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
        try {
            const userRef = doc(db, 'users', userId, 'data', 'profile');
            await setDoc(userRef, { profile, updatedAt: new Date().toISOString() });
        } catch (error) {
            console.warn('Firebase saveUserProfile hatası:', error);
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
            console.warn('Firebase getUserProfile hatası:', error);
        }
        return null;
    },

    // 4. Uygulama Ayarları
    async saveAppSettings(userId: string, settings: AppSettings): Promise<void> {
        try {
            const userRef = doc(db, 'users', userId, 'data', 'settings');
            await setDoc(userRef, { settings, updatedAt: new Date().toISOString() });
        } catch (error) {
            console.warn('Firebase saveAppSettings hatası:', error);
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
            console.warn('Firebase getAppSettings hatası:', error);
        }
        return null;
    },

    // 5. Oyun Yüksek Skorları
    async saveHighScore(userId: string, gameId: string, score: number): Promise<void> {
        try {
            const userRef = doc(db, 'users', userId, 'data', 'highscores');
            await setDoc(userRef, { [gameId]: score }, { merge: true });
        } catch (error) {
            console.warn('Firebase saveHighScore hatası:', error);
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
            console.warn('Firebase getHighScore hatası:', error);
        }
        return null;
    },
};