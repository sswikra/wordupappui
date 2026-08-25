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
const { getFirestore, doc, setDoc, deleteDoc, writeBatch, collection, getDocs } = require('firebase/firestore');
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
    console.log(`📖 Toplam ${words.length} adet kelime Firestore Subcollection hiyerarşisine aktarılacak...`);

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
        console.log(`  🔹 [levels/${levelId}/words] ${Math.min(i + CHUNK_SIZE, levelWords.length)}/${levelWords.length} kelime yüklendi...`);
      }
      console.log(`✅ [levels/${levelId}] Seviye ${levelId} tamamlandı (${levelWords.length} kelime subcollection dokümanı)!`);
    }

    // 2. KÜRATÖRLÜ LİSTELERİ SUBCOLLECTIONS OLARAK YÜKLE
    console.log('\n--- 2. KÜRATÖRLÜ LİSTELER SUBCOLLECTIONS (/curated_lists/{listId}/words/{wordId}) YÜKLENİYOR ---');
    const curated = [
      {
        id: 'a1',
        title: 'A1 - Beginner',
        icon: 'book',
        count: words.filter((w) => w.level === 'A1').length,
        mastery: 80,
        description: 'Günlük hayatta en sık kullanılan temel kelimeler ve başlangıç ifadeleri.',
        color: '#10b981',
        words: words.filter((w) => w.level === 'A1'),
      },
      {
        id: 'a2',
        title: 'A2 - Elementary',
        icon: 'book',
        count: words.filter((w) => w.level === 'A2').length,
        mastery: 65,
        description: 'Rutin diyaloglar, alışveriş, yön tarifleri ve temel iletişim sözcükleri.',
        color: '#06b6d4',
        words: words.filter((w) => w.level === 'A2'),
      },
      {
        id: 'b1',
        title: 'B1 - Intermediate',
        icon: 'book',
        count: words.filter((w) => w.level === 'B1').length,
        mastery: 50,
        description: 'İş, okul ve sosyal hayatta rahatça iletişim kurabilmek için gerekli sözcükler.',
        color: '#3b82f6',
        words: words.filter((w) => w.level === 'B1'),
      },
      {
        id: 'b2',
        title: 'B2 - Upper Intermediate',
        icon: 'star',
        count: words.filter((w) => w.level === 'B2').length,
        mastery: 40,
        description: 'Karmaşık konuları tartışma, akıcı konuşma ve ileri düzey sözcükler.',
        color: '#8b5cf6',
        words: words.filter((w) => w.level === 'B2'),
      },
      {
        id: 'c1',
        title: 'C1 - Advanced',
        icon: 'sparkles',
        count: words.filter((w) => w.level === 'C1').length,
        mastery: 25,
        description: 'Akademik makaleler, zengin edebi metinler ve profesyonel yetkinlik kelimeleri.',
        color: '#ec4899',
        words: words.filter((w) => w.level === 'C1'),
      },
      {
        id: 'c2',
        title: 'C2 - Proficiency',
        icon: 'award',
        count: words.filter((w) => w.level === 'C2').length,
        mastery: 15,
        description: 'Ana dil düzeyinde üstün hakimiyet, incelikli nüanslar ve seçkin kelime haznesi.',
        color: '#e11d48',
        words: words.filter((w) => w.level === 'C2'),
      },
      {
        id: 'ielts',
        title: 'IELTS Academic & General',
        icon: 'graduation',
        count: words.filter((w) => w.lists?.includes('ielts') || w.level === 'B2' || w.level === 'C1' || w.level === 'C2').length,
        mastery: 45,
        description: 'IELTS sınavında Band 7.0+ hedefleyenler için yüksek getirili akademik sözcükler.',
        color: '#f59e0b',
        words: words.filter((w) => w.lists?.includes('ielts') || w.level === 'B2' || w.level === 'C1' || w.level === 'C2'),
      },
      {
        id: 'toefl',
        title: 'TOEFL iBT High-Yield',
        icon: 'graduation',
        count: words.filter((w) => w.lists?.includes('toefl') || w.lists?.includes('toefl-high') || w.level === 'B2' || w.level === 'C1' || w.level === 'C2').length,
        mastery: 42,
        description: 'TOEFL iBT sınavı okuma, dinleme ve yazma bölümlerinde en sık çıkan akademik sözcükler.',
        color: '#6366f1',
        words: words.filter((w) => w.lists?.includes('toefl') || w.lists?.includes('toefl-high') || w.level === 'B2' || w.level === 'C1' || w.level === 'C2'),
      },
    ];

    for (const list of curated) {
      const { words: listWords, ...listMetadata } = list;
      // 1. Liste Ana Dokümanı: /curated_lists/{listId}
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

    // 3. ESKİ LİSTELERİ TEMİZLE
    console.log('\n--- 3. ESKİ LİSTELER VE DÖKÜMANLARIN TEMİZLENMESİ ---');
    const deprecatedListIds = ['business-pro', 'travel-essentials', 'oxford-3000', 'toefl-high'];
    for (const dId of deprecatedListIds) {
      try {
        await deleteDoc(doc(db, 'curated_lists', dId));
        console.log(`🗑️  Eski \`curated_lists/${dId}\` dokümanı silindi.`);
      } catch (e) {
        console.log(`ℹ️  \`curated_lists/${dId}\` silinemedi veya zaten yok:`, e.message);
      }
    }
    try {
      await deleteDoc(doc(db, 'system', 'vocabulary'));
      console.log('🗑️  Eski `system/vocabulary` silindi.');
    } catch (e) {
      console.log('ℹ️  `system/vocabulary` silinemedi veya zaten yok:', e.message);
    }
    try {
      await deleteDoc(doc(db, 'system', 'curated_lists'));
      console.log('🗑️  Eski `system/curated_lists` silindi.');
    } catch (e) {
      console.log('ℹ️  `system/curated_lists` silinemedi veya zaten yok:', e.message);
    }

    // 4. DOĞRULAMA (VERIFICATION)
    console.log('\n--- 4. DOĞRULAMA (SUBCOLLECTIONS OKUNUYOR) ---');
    const a1WordsSnap = await getDocs(collection(db, 'levels', 'A1', 'words'));
    console.log(`🔍 [levels/A1/words] Doğrulandı! Doküman Sayısı: ${a1WordsSnap.docs.length}`);

    const oxfordSnap = await getDocs(collection(db, 'curated_lists', 'oxford-3000', 'words'));
    console.log(`🔍 [curated_lists/oxford-3000/words] Doğrulandı! Doküman Sayısı: ${oxfordSnap.docs.length}`);

    console.log('\n====================================================');
    console.log(`🎉 TÜM VERİLER HİYERARŞİK SUBCOLLECTION YAPISINDA CLOUD FIRESTORE'A AKTARILDI!`);
    console.log(`📊 Toplam ${words.length} adet kelime alt dokümanlar halinde kaydedildi.`);
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Firestore Seeder Hatası:', error);
    if (error.code === 'permission-denied' || error.message?.includes('PERMISSION_DENIED')) {
      console.error('\n⚠️  DİKKAT: Firebase Console Güvenlik Kuralları (Firestore Rules) henüz güncellenmemiş!');
      console.error('Lütfen Firebase Console -> Firestore Database -> Rules sekmesine giderek kuralları güncelleyip Publish butonuna basınız.');
    }
    process.exit(1);
  }
}

runSeeder();


