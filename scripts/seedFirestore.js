/**
 * WordMem Firebase Firestore Batch Seeder (Hierarchical Subcollections)
 * 
 * Bu betik, kelimeleri Firestore 1 MB döküman limitine takılmadan:
 * Collection -> Document -> Subcollection -> Document hiyerarşisiyle:
 * 1. /levels/{levelId}/words/{wordId}
 * 2. /curated_lists/{listId}/words/{wordId}
 * altına Firestore writeBatch() kullanarak parçalı (chunk) olarak yükler.
 */

const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, doc, setDoc, writeBatch } = require('firebase/firestore');
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

const LEVEL_METADATA = {
  A1: { name: 'A1 - Beginner', description: 'Temel günlük kelimeler ve ifadeler' },
  A2: { name: 'A2 - Elementary', description: 'Günlük yaşam ve temel diyalog kelimeleri' },
  B1: { name: 'B1 - Intermediate', description: 'Orta seviye akıcı konuşma ve metin kelimeleri' },
  B2: { name: 'B2 - Upper Intermediate', description: 'İleri orta seviye akademik ve profesyonel kelimeler' },
  C1: { name: 'C1 - Advanced', description: 'İleri seviye yetkinlik ve zengin kelime haznesi' },
  C2: { name: 'C2 - Mastery', description: 'Ana dil düzeyinde üstün kelime hakimiyeti' },
};

async function runSeeder() {
  try {
    console.log('🔑 Anonim oturum açılıyor...');
    const userCred = await signInAnonymously(auth);
    console.log('✅ Giriş başarılı, UID:', userCred.user.uid);

    const jsonPath = path.join(__dirname, '..', 'src', 'data', 'expandedVocabulary.json');
    const words = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`📖 Toplam ${words.length} adet kelime Firestore'a yükleniyor...`);

    const now = new Date().toISOString();

    // 1. KELİMELERİ SEVİYELERE GÖRE GRUPLA
    const wordsByLevel = {};
    words.forEach((w) => {
      const lvl = w.level || 'A1';
      if (!wordsByLevel[lvl]) wordsByLevel[lvl] = [];
      wordsByLevel[lvl].push(w);
    });

    console.log('\n--- 1. SEVİYE SUBCOLLECTIONS (/levels/{levelId}/words/{wordId}) YÜKLENİYOR ---');
    for (const [levelId, levelWords] of Object.entries(wordsByLevel)) {
      // 1. Seviye Ana Dökümanı: /levels/{levelId}
      const meta = LEVEL_METADATA[levelId] || { name: `${levelId} Vocabulary`, description: '' };
      await setDoc(doc(db, 'levels', levelId), {
        id: levelId,
        name: meta.name,
        description: meta.description,
        wordCount: levelWords.length,
        lastUpdated: now,
      }, { merge: true });

      // 2. Alt Koleksiyon: /levels/{levelId}/words/{wordId}
      // Firestore batch limiti maksimum 500'dür. 400'erli paketlerle yazıyoruz.
      const CHUNK_SIZE = 400;
      for (let i = 0; i < levelWords.length; i += CHUNK_SIZE) {
        const chunk = levelWords.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);

        chunk.forEach((word) => {
          const wordRef = doc(db, 'levels', levelId, 'words', word.id);
          batch.set(wordRef, {
            ...word,
            updatedAt: now,
          });
        });

        await batch.commit();
        console.log(`  🔹 [levels/${levelId}/words] ${i + chunk.length}/${levelWords.length} kelime yüklendi...`);
      }
      console.log(`✅ [levels/${levelId}] Seviye ${levelId} tamamlandı (${levelWords.length} kelime)!`);
    }

    // 2. KÜRATÖRLÜ LİSTELERİ SUBCOLLECTIONS OLARAK YÜKLE
    console.log('\n--- 2. KÜRATÖRLÜ LİSTELER SUBCOLLECTIONS (/curated_lists/{listId}/words) YÜKLENİYOR ---');
    const curated = [
      {
        id: 'oxford-3000',
        title: 'Oxford 3000 Core',
        icon: 'book',
        count: words.filter((w) => w.lists?.includes('oxford-3000') || w.level === 'A1' || w.level === 'A2').length,
        mastery: 72,
        description: 'Günlük konuşma ve akıcılık için en önemli kelimeler.',
        color: '#8b5cf6',
        words: words.filter((w) => w.lists?.includes('oxford-3000') || w.level === 'A1' || w.level === 'A2'),
      },
      {
        id: 'toefl-high',
        title: 'TOEFL & IELTS High-Yield',
        icon: 'star',
        count: words.filter((w) => w.lists?.includes('toefl-high') || w.level === 'C1' || w.level === 'C2' || w.level === 'B2').length,
        mastery: 45,
        description: 'Akademik sınavlarda yüksek başarı getiren sözcükler.',
        color: '#ec4899',
        words: words.filter((w) => w.lists?.includes('toefl-high') || w.level === 'C1' || w.level === 'C2' || w.level === 'B2'),
      },
      {
        id: 'business-pro',
        title: 'Business & Tech English',
        icon: 'briefcase',
        count: words.filter((w) => w.lists?.includes('business-pro') || w.level === 'B1' || w.level === 'B2').length,
        mastery: 60,
        description: 'Toplantılar ve teknoloji için profesyonel terimler.',
        color: '#0284c7',
        words: words.filter((w) => w.lists?.includes('business-pro') || w.level === 'B1' || w.level === 'B2'),
      },
      {
        id: 'travel-essentials',
        title: 'Travel & Vacations',
        icon: 'plane',
        count: words.filter((w) => w.lists?.includes('travel-essentials')).length,
        mastery: 88,
        description: 'Havalimanı ve yurt dışı seyahatlerinde temel kelimeler.',
        color: '#f59e0b',
        words: words.filter((w) => w.lists?.includes('travel-essentials')),
      },
    ];

    for (const list of curated) {
      const { words: listWords, ...listMetadata } = list;
      // 1. Liste Ana Dokümanı
      await setDoc(doc(db, 'curated_lists', list.id), {
        ...listMetadata,
        count: listWords.length,
        updatedAt: now,
      });

      // 2. Alt Koleksiyon: /curated_lists/{listId}/words/{wordId}
      if (listWords.length > 0) {
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
      console.log(`✅ [curated_lists/${list.id}] Liste ve ${listWords.length} alt kelimesi yüklendi!`);
    }

    console.log('\n====================================================');
    console.log(`🎉 TÜM VERİLER HİYERARŞİK SUBCOLLECTION YAPISINDA CLOUD FIRESTORE'A AKTARILDI!`);
    console.log(`📊 Toplam Seviye Kelimesi: ${words.length} adet doküman`);
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Firestore Seeder Hatası:', error);
    process.exit(1);
  }
}

runSeeder();

