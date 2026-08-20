/**
 * WordMem Firebase Firestore Batch Seeder
 * 
 * Bu betik, 'src/data/expandedVocabulary.json' dosyasındaki tüm kelimeleri
 * ve hazır listeleri Cloud Firestore 'wordmem-16dd9' veritabanına toplu olarak (batch) yükler.
 */

const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  apiKey: "AIzaSyBrt93ey2v4160YHjBVkMW_qWWkeHkWeTs",
  authDomain: "wordmem-16dd9.firebaseapp.com",
  projectId: "wordmem-16dd9",
  storageBucket: "wordmem-16dd9.firebasestorage.app",
  messagingSenderId: "612159107867",
  appId: "1:612159107867:android:22e8433f9e6f9c7fe2d9be",
  measurementId: 'G-DVK80TMYQY',
};

console.log('🚀 Firebase Cloud Firestore bağlantısı kuruluyor (Project: wordmem-16dd9)...');
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

async function runSeeder() {
  try {
    console.log('🔑 Anonim oturum açılıyor...');
    const userCred = await signInAnonymously(auth);
    console.log('✅ Giriş başarılı, UID:', userCred.user.uid);

    const jsonPath = path.join(__dirname, '..', 'src', 'data', 'expandedVocabulary.json');
    const words = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`📖 Toplam ${words.length} adet kelime Firestore'a yükleniyor...`);

    const now = new Date().toISOString();

    // 1. Genel Kelimeleri 'system/vocabulary' dökümanına yaz
    await setDoc(doc(db, 'system', 'vocabulary'), {
      words: words,
      count: words.length,
      version: '2.0.0',
      lastUpdated: now,
    });
    console.log(`✅ [Firestore] 'system/vocabulary' dökümanına ${words.length} kelime başarıyla yüklendi!`);

    // 2. Hazır Listeleri 'system/curated_lists' dökümanına yaz
    const curated = [
      { id: 'oxford-3000', title: 'Oxford 3000 Core', icon: 'book', count: words.filter(w => w.level === 'A1' || w.level === 'A2').length, mastery: 72, description: 'Günlük konuşma ve akıcılık için en önemli kelimeler.', color: '#8b5cf6' },
      { id: 'toefl-high', title: 'TOEFL & IELTS High-Yield', icon: 'star', count: words.filter(w => w.level === 'C1' || w.level === 'C2' || w.level === 'B2').length, mastery: 45, description: 'Akademik sınavlarda yüksek başarı getiren sözcükler.', color: '#ec4899' },
      { id: 'business-pro', title: 'Business & Tech English', icon: 'briefcase', count: words.filter(w => w.lists?.includes('business-pro') || w.level === 'B1' || w.level === 'B2').length, mastery: 60, description: 'Toplantılar ve teknoloji için profesyonel terimler.', color: '#0284c7' },
      { id: 'travel-essentials', title: 'Travel & Vacations', icon: 'plane', count: words.filter(w => w.lists?.includes('travel-essentials')).length, mastery: 88, description: 'Havalimanı ve yurt dışı seyahatlerinde temel kelimeler.', color: '#f59e0b' }
    ];

    await setDoc(doc(db, 'system', 'curated_lists'), {
      lists: curated,
      count: curated.length,
      updatedAt: now
    });
    console.log('✅ [Firestore] Küratörlü listeler güncellendi!');

    console.log('====================================================');
    console.log(`🎉 TÜM VERİLER CLOUD FIRESTORE'A BAŞARIYLA AKTARILDI! (Kelime Sayısı: ${words.length})`);
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Firestore Seeder Hatası:', error);
    process.exit(1);
  }
}

runSeeder();
