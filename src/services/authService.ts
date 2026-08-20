// src/services/authService.ts
import {
    GoogleAuthProvider,
    signInWithCredential,
    signInAnonymously,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
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
    async loginWithGoogleIdToken(idToken?: string | null, accessToken?: string | null) {
        try {
            const credential = GoogleAuthProvider.credential(idToken || undefined, accessToken || undefined);
            const userCredential = await signInWithCredential(auth, credential);
            return userCredential.user;
        } catch (error) {
            console.error('Google Giriş Hatası:', error);
            throw error;
        }
    },

    // E-posta ve Şifre ile Giriş
    async loginWithEmail(email: string, pass: string) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
            return userCredential.user;
        } catch (error) {
            console.error('E-posta Giriş Hatası:', error);
            throw error;
        }
    },

    // E-posta ve Şifre ile Kayıt
    async registerWithEmail(email: string, pass: string) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
            return userCredential.user;
        } catch (error) {
            console.error('E-posta Kayıt Hatası:', error);
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