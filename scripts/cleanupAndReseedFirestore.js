/**
 * WordMem Clean Firestore Seeder
 * 
 * 1. Cleans all old/orphaned subcollections:
 *    - /curated_lists/business-pro/words
 *    - /curated_lists/travel-essentials/words
 *    - /curated_lists/oxford-3000/words
 *    - /curated_lists/toefl-high/words
 *    - /curated_lists/a1/words, a2, b1, b2, c1, c2
 * 2. Seeds /levels/{levelId}/words/{wordId} for A1, A2, B1, B2, C1, C2
 * 3. Seeds /curated_lists/{listId}/words/{wordId} ONLY for IELTS and TOEFL
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

async function deleteCollectionSubdocs(collectionPath) {
  const colRef = collection(db, ...collectionPath.split('/'));
  const snapshot = await getDocs(colRef);
  if (snapshot.empty) return 0;

  const docs = snapshot.docs;
  const CHUNK = 400;
  for (let i = 0; i < docs.length; i += CHUNK) {
    const chunk = docs.slice(i, i + CHUNK);
    const batch = writeBatch(db);
    chunk.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  return docs.length;
}

async function runCleanupAndReseed() {
  try {
    console.log('🔑 Anonim oturum açılıyor...');
    const userCred = await signInAnonymously(auth);
    console.log('✅ Giriş başarılı, UID:', userCred.user.uid);

    const jsonPath = path.join(__dirname, '..', 'src', 'data', 'expandedVocabulary.json');
    const words = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`📖 Toplam ${words.length} adet kelime veritabanı senkronizasyonuna hazır.`);

    const now = new Date().toISOString();

    // =========================================================================
    // ADIM 1: ESKİ VE MÜKERRER LİSTELERİ DERİNDEN TEMİZLE (SUBCOLLECTIONS DAHİL)
    // =========================================================================
    console.log('\n🧹 ADIM 1: Eski ve mükerrer listeler temizleniyor...');
    
    // Temizlenecek listeler:
    // a) Eski listeler: business-pro, business, travel-essentials, travel, oxford-3000, toefl-high
    // b) /curated_lists içindeki seviye listeleri: a1, a2, b1, b2, c1, c2 (Çünkü seviyeler artık sadece /levels altında yer alacak!)
    const listsToWipe = [
      'business-pro',
      'business',
      'travel-essentials',
      'travel',
      'oxford-3000',
      'toefl-high',
      'a1',
      'a2',
      'b1',
      'b2',
      'c1',
      'c2',
    ];

    for (const listId of listsToWipe) {
      const deletedCount = await deleteCollectionSubdocs(`curated_lists/${listId}/words`);
      try {
        await deleteDoc(doc(db, 'curated_lists', listId));
      } catch {}
      if (deletedCount > 0) {
        console.log(`  🗑️  /curated_lists/${listId} silindi (${deletedCount} alt kelime dokümanı temizlendi).`);
      }
    }

    // Ayrıca sistem dokümanlarını da temizle
    try { await deleteDoc(doc(db, 'system', 'vocabulary')); } catch {}
    try { await deleteDoc(doc(db, 'system', 'curated_lists')); } catch {}

    // =========================================================================
    // ADIM 2: SEVİYELERİ (/levels/{levelId}/words/{wordId}) TEMİZLE VE YÜKLE
    // =========================================================================
    console.log('\n📚 ADIM 2: Seviyeler (/levels/{levelId}) güncelleniyor...');

    const wordsByLevel = {};
    words.forEach((w) => {
      const lvl = w.level || 'A1';
      if (!wordsByLevel[lvl]) wordsByLevel[lvl] = [];
      wordsByLevel[lvl].push(w);
    });

    for (const [levelId, levelWords] of Object.entries(wordsByLevel)) {
      // 1. Eski seviye alt kelimelerini temizle (artık/eski kayıt kalmaması için)
      await deleteCollectionSubdocs(`levels/${levelId}/words`);

      // 2. Seviye Ana Dokümanı: /levels/{levelId}
      const meta = LEVEL_METADATA[levelId] || { name: `${levelId} Vocabulary`, description: '' };
      await setDoc(doc(db, 'levels', levelId), {
        id: levelId,
        name: meta.name,
        description: meta.description,
        wordCount: levelWords.length,
        lastUpdated: now,
      }, { merge: true });

      // 3. Alt Koleksiyon: /levels/{levelId}/words/{wordId}
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
      }
      console.log(`✅ [levels/${levelId}] ${levelWords.length} kelime yüklendi.`);
    }

    // =========================================================================
    // ADIM 3: KÜRATÖRLÜ LİSTELERİ (/curated_lists/) SADECE ÖZEL LİSTELER (IELTS & TOEFL) İÇİN YÜKLE
    // =========================================================================
    console.log('\n🎯 ADIM 3: Küratörlü Sınav Listeleri (/curated_lists) yükleniyor (Sadece IELTS ve TOEFL)...');

    const curatedLists = [
      {
        id: 'ielts',
        title: 'IELTS Academic & General',
        icon: 'graduation',
        mastery: 45,
        description: 'IELTS sınavında Band 7.0+ hedefleyenler için yüksek getirili akademik sözcükler.',
        color: '#f59e0b',
        words: words.filter((w) => w.lists?.includes('ielts') || w.lists?.includes('ielts-1000') || w.level === 'B2' || w.level === 'C1' || w.level === 'C2'),
      },
      {
        id: 'toefl',
        title: 'TOEFL iBT High-Yield',
        icon: 'graduation',
        mastery: 42,
        description: 'TOEFL iBT sınavı okuma, dinleme ve yazma bölümlerinde en sık çıkan akademik sözcükler.',
        color: '#6366f1',
        words: words.filter((w) => w.lists?.includes('toefl') || w.lists?.includes('toefl-300') || w.lists?.includes('toefl-high') || w.level === 'B2' || w.level === 'C1' || w.level === 'C2'),
      },
    ];

    for (const list of curatedLists) {
      const { words: listWords, ...listMetadata } = list;

      // 1. Önceki alt kelimeleri temizle
      await deleteCollectionSubdocs(`curated_lists/${list.id}/words`);

      // 2. Liste Ana Dokümanı
      await setDoc(doc(db, 'curated_lists', list.id), {
        ...listMetadata,
        count: listWords.length,
        updatedAt: now,
      });

      // 3. Alt Koleksiyon: /curated_lists/{listId}/words/{wordId}
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
      console.log(`✅ [curated_lists/${list.id}] ${listWords.length} kelime yüklendi.`);
    }

    // =========================================================================
    // ADIM 4: NİHAİ DOĞRULAMA (VERIFICATION)
    // =========================================================================
    console.log('\n🔍 ADIM 4: Doğrulama yapılıyor...');

    console.log('\n--- /levels Koleksiyonu Kontrolü ---');
    const finalLevelsSnap = await getDocs(collection(db, 'levels'));
    for (const d of finalLevelsSnap.docs) {
      const wSnap = await getDocs(collection(db, 'levels', d.id, 'words'));
      console.log(`  🔹 levels/${d.id}: Doküman Kayıt Sayısı = ${wSnap.docs.length}`);
    }

    console.log('\n--- /curated_lists Koleksiyonu Kontrolü ---');
    const finalCuratedSnap = await getDocs(collection(db, 'curated_lists'));
    console.log(`  🔹 /curated_lists altındaki toplam liste sayısı: ${finalCuratedSnap.docs.length} (Yalnızca: ${finalCuratedSnap.docs.map(d => d.id).join(', ')})`);
    for (const d of finalCuratedSnap.docs) {
      const wSnap = await getDocs(collection(db, 'curated_lists', d.id, 'words'));
      console.log(`  🔹 curated_lists/${d.id} (${d.data().title}): Doküman Kayıt Sayısı = ${wSnap.docs.length}`);
    }

    console.log('\n--- Silinen Eski Listelerin Kontrolü ---');
    for (const oldId of listsToWipe) {
      const wSnap = await getDocs(collection(db, 'curated_lists', oldId, 'words'));
      if (wSnap.docs.length === 0) {
        console.log(`  ✅ curated_lists/${oldId}/words: 0 doküman (Tamamen temizlendi)`);
      } else {
        console.log(`  ⚠️ UYARI: curated_lists/${oldId}/words içinde hala ${wSnap.docs.length} doküman var!`);
      }
    }

    console.log('\n====================================================');
    console.log(`🎉 FIRESTORE VERİTABANI BAŞARIYLA TEMİZLENDİ VE DÜZELTİLDİ!`);
    console.log(`📊 Levels: A1-C2 (6 seviye, toplam ${words.length} kelime)`);
    console.log(`📊 Curated Lists: Yalnızca IELTS ve TOEFL sınav listeleri`);
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Hata:', error);
    process.exit(1);
  }
}

runCleanupAndReseed();
