// src/services/authService.ts
import {
    GoogleAuthProvider,
    signInWithCredential,
    signInWithPopup,
    signInAnonymously,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    signOut,
    onAuthStateChanged,
    User,
} from 'firebase/auth';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { auth } from '../firebaseConfig';

const GOOGLE_WEB_CLIENT_ID = '612159107867-8vm5n6foo16d6mjchvppmeqdqkk0j6c6.apps.googleusercontent.com';

const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const getNativeGoogleSignin = () => {
    if (Platform.OS === 'web' || isExpoGo) {
        return null;
    }
    try {
        const { GoogleSignin, statusCodes } = require('@react-native-google-signin/google-signin');
        GoogleSignin.configure({
            webClientId: GOOGLE_WEB_CLIENT_ID,
            offlineAccess: false,
        });
        return { GoogleSignin, statusCodes };
    } catch (e) {
        console.warn('Native GoogleSignin modülü yüklenemedi:', e);
        return null;
    }
};

export const AuthService = {
    // Aktif kullanıcıyı dinleme
    onAuthStateChanged(callback: (user: User | null) => void) {
        return onAuthStateChanged(auth, callback);
    },

    // Aktif kullanıcıyı alma
    getCurrentUser(): User | null {
        return auth.currentUser;
    },

    // Web platformunda doğrudan Google ile Giriş (Firebase Popup)
    async loginWithGoogleWeb() {
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            provider.setCustomParameters({ prompt: 'select_account' });
            const userCredential = await signInWithPopup(auth, provider);
            return userCredential.user;
        } catch (error) {
            console.error('Google Web Giriş Hatası:', error);
            throw error;
        }
    },

    // Native Google Sign-In (Play Services) ile Giriş
    async loginWithNativeGoogle() {
        const nativeModule = getNativeGoogleSignin();
        if (!nativeModule) {
            throw new Error('RN_GOOGLE_SIGNIN_UNAVAILABLE');
        }
        const { GoogleSignin, statusCodes } = nativeModule;
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const response = await GoogleSignin.signIn();
            const idToken = response?.data?.idToken || (response as any)?.idToken || (response as any)?.data?.user?.idToken;
            if (!idToken) {
                throw new Error('Google ID Token alınamadı.');
            }
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            return userCredential.user;
        } catch (error: any) {
            console.error('Native Google Giriş Hatası:', error);
            if (error.code === statusCodes?.SIGN_IN_CANCELLED || error.message?.includes('cancelled') || error.code === 'SIGN_IN_CANCELLED') {
                return null;
            }
            throw error;
        }
    },

    // Mobil / Token ile Google Girişi
    async loginWithGoogleIdToken(idToken?: string | null, accessToken?: string | null) {
        try {
            if (!idToken && !accessToken) {
                throw new Error('Google kimlik doğrulama tokenı alınamadı.');
            }
            const credential = GoogleAuthProvider.credential(idToken || null, accessToken || null);
            const userCredential = await signInWithCredential(auth, credential);
            return userCredential.user;
        } catch (error) {
            console.error('Google Mobil Giriş Hatası:', error);
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
    async registerWithEmail(email: string, pass: string, displayName?: string) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
            if (displayName && userCredential.user) {
                await updateProfile(userCredential.user, { displayName });
            }
            return userCredential.user;
        } catch (error) {
            console.error('E-posta Kayıt Hatası:', error);
            throw error;
        }
    },

    // Şifre Sıfırlama Bağlantısı Gönderme
    async resetPassword(email: string) {
        try {
            await sendPasswordResetEmail(auth, email.trim());
        } catch (error) {
            console.error('Şifre Sıfırlama Hatası:', error);
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

    // Firebase Hata Kodlarını Kullanıcı Dostu Türkçe Mesajlara Çevirici
    getErrorMessage(error: any): string {
        if (!error) return 'Bilinmeyen bir hata oluştu.';
        const code = error.code || '';
        
        switch (code) {
            case 'auth/popup-closed-by-user':
            case 'auth/cancelled-popup-request':
                return 'Giriş penceresi kapatıldı.';
            case 'auth/popup-blocked':
                return 'Açılır pencere tarayıcı tarafından engellendi. Lütfen açılır pencerelere izin verin.';
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                return 'E-posta veya şifre hatalı.';
            case 'auth/invalid-email':
                return 'Geçerli bir e-posta adresi giriniz.';
            case 'auth/email-already-in-use':
                return 'Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın.';
            case 'auth/weak-password':
                return 'Şifreniz en az 6 karakter olmalıdır.';
            case 'auth/network-request-failed':
                return 'İnternet bağlantınızı kontrol edip tekrar deneyin.';
            case 'auth/too-many-requests':
                return 'Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.';
            case 'auth/operation-not-allowed':
                return 'Bu giriş yöntemi henüz aktif edilmemiş.';
            case 'auth/unauthorized-domain':
                return 'Bu alan adı Firebase Authentication için yetkilendirilmemiş.';
            case 'auth/account-exists-with-different-credential':
                return 'Bu e-posta adresi farklı bir yöntemle (örn. Google) kayıtlı.';
            default:
                return error.message || 'İşlem sırasında bir hata oluştu.';
        }
    },
};
