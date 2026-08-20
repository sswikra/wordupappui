import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getAuth } from 'firebase/auth';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBrt93ey2v4160YHjBVkMW_qWWkeHkWeTs",
  authDomain: "wordmem-16dd9.firebaseapp.com",
  projectId: "wordmem-16dd9",
  storageBucket: "wordmem-16dd9.firebasestorage.app",
  messagingSenderId: "612159107867",
  appId: "1:612159107867:android:22e8433f9e6f9c7fe2d9be",
  measurementId: 'G-DVK80TMYQY',
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore Database
export const db = getFirestore(app);

// Firebase Auth with AsyncStorage Persistence for React Native
export const auth = (() => {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
})();



