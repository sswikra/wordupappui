// src/services/authService.ts
import {
    GoogleAuthProvider,
    signInWithCredential,
    signInAnonymously,
    signOut,
    onAuthStateChanged,
    User,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

export const AuthService = {
    // Aktif kullanıcıyı dinleme
    onAuthStateChanged(callback: (user: User | null) => void) {
        return onAuthStateChanged(auth, callback);
    },

    // Aktif kullanıcıyı alma
    getCurrentUser(): User | null {
        return auth.currentUser;
    },

    // Google ID Token ile Firebase'e giriş yapma
    async loginWithGoogleIdToken(idToken: string) {
        try {
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            return userCredential.user;
        } catch (error) {
            console.error('Google Giriş Hatası:', error);
            throw error;
        }
    },

    // Misafir / Anonim Giriş
    async loginAnonymously() {
        try {
            const userCredential = await signInAnonymously(auth);
            return userCredential.user;
        } catch (error) {
            console.error('Anonim Giriş Hatası:', error);
            throw error;
        }
    },

    // Çıkış Yapma
    async logout() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Çıkış Hatası:', error);
            throw error;
        }
    },
};