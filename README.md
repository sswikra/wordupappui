# WordMem - İngilizce & Türkçe Sözlük ve Kelime Öğrenme Mobil Uygulaması

**WordMem**, Google AI Studio tasarımı ve React Native (Expo) mimarisi üzerine inşa edilmiş, tamamen **çevrimdışı çalışabilen (Offline-first)**, zengin içerikli ve modern bir İngilizce-Türkçe kelime ve hafıza geliştirme mobil uygulamasıdır. Android platformunda Google Play Store'da yayınlanmaya hazır şekilde yapılandırılmıştır.

---

## 📱 Özellikler

- 🌟 **Günün Kelimesi**: Her gün yeni bir kelime, CEFR seviyesi (A1-C2), sözcük türü, Türkçe anlamı, örnek cümleler ve yerel sesli telaffuz.
- 🔍 **Kapsamlı Arama & Filtreleme**: İngilizce ve Türkçe kelimeler içinde anlık arama, CEFR seviyelerine (A1, A2, B1, B2, C1, C2) ve favorilere göre filtreleme.
- 🎮 **5 İnteraktif Mini Oyun**:
  1. **Kelime Tahmini (Word Guess / Wordle)**: 6 denemede 5 harfli kelimeyi bulma, renk kodlu geribildirim ve sanal klavye.
  2. **Kare Bulmaca (Crossword)**: 5x5 interaktif bulmaca ızgarası, yatay ve dikey ipuçları.
  3. **Kelime Eşleştirme (Word Match)**: Zaman karşı 5 İngilizce-Türkçe kelime çiftini eşleştirme.
  4. **Harf Karıştırma (Scramble)**: Karışık harfleri doğru sıraya dizerek kelimeyi tamamlama.
  5. **Adam Asmaca (Hangman)**: Can sistemi, görsel çizim ve harf tahminleri.
- 🗂️ **Kelime Listeleri & Kartlarla Çalış (Flashcards)**:
  - Özel kelime listeleri oluşturma (renk ve simge seçimi).
  - Hazır seçilmiş listeler (*Oxford 3000, TOEFL & IELTS, İş İngilizcesi, Seyahat*).
  - 3D dönen interaktif Flashcard çalışma modu ("Öğrenildi" / "Tekrar Et") ve liste hakimiyet yüzdesi takibi.
- 🔊 **Doğal Sesli Telaffuz (TTS)**: `expo-speech` ile Android ve iOS cihazlarda internet gerekmeden yüksek kaliteli sesli telaffuz.
- 📳 **Haptic Geri Bildirim**: `expo-haptics` ile oyunlarda ve buton etkileşimlerinde titreşimli geri bildirim.
- 📊 **Profil & İlerleme Analitiği**: Haftalık aktivite grafiği, öğrenilen kelime ve oynanan oyun sayaçları, aktif seri takibi ve rozetler.
- 🌓 **Karanlık / Açık Mod**: Göz yorgunluğunu azaltan modern koyu tema ve şık açık tema desteği.
- 💾 **Tam Çevrimdışı Depolama**: `@react-native-async-storage/async-storage` ile tüm kelimeler, özel eklemeler, listeler, ayarlar ve oyun rekorları cihazınızda güvende.

---

## 🚀 Kurulum ve Çalıştırma

### 1. Gereksinimler
- [Node.js](https://nodejs.org/) (LTS sürümü önerilir)
- [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android telefonunuzda test etmek için) veya Android Studio Emülatörü

### 2. Bağımlılıkları Yükleme
Proje klasöründe terminali açın ve çalıştırın:
```bash
npm install
```

### 3. Geliştirici Sunucusunu Başlatma
```bash
npx expo start
```
Terminalde çıkan QR kodu, telefonunuzdaki **Expo Go** uygulaması ile okutarak uygulamayı anında telefonunuzda test edebilirsiniz.

---

## 📦 Android APK ve Google Play Store (.aab) Dağıtımı

Proje `app.json` ve `eas.json` dosyaları ile EAS Build sistemine tam uyumlu hazırlanmıştır:
- **Paket Adı**: `com.wordmem.vocabulary`
- **Sürüm**: `1.0.0` (VersionCode: `1`)
- **İzinler**: `VIBRATE`, `INTERNET`

### Doğrudan Test Edilebilir APK Üretmek İçin:
```bash
npx eas build -p android --profile preview
```

### Google Play Store İçin Android App Bundle (.aab) Üretmek İçin:
```bash
npx eas build -p android --profile production
```

---

## 📁 Proje Dizin Yapısı

```
├── App.tsx                      # Ana mobil uygulama bileşeni & navigasyon yönetimi
├── index.js                     # Expo başlatıcı (registerRootComponent)
├── app.json                     # Android & Expo konfigürasyonu
├── eas.json                     # EAS Build ve yayınlama profilleri
├── package.json                 # Bağımlılıklar
├── tsconfig.json                # TypeScript ayarları
├── assets/                      # Uygulama ikonları, splash screen ve logolar
└── src/
    ├── types.ts                 # Veri modelleri ve TypeScript tipleri
    ├── theme/
    │   └── colors.ts            # Renk paleti ve tema stilleri
    ├── data/
    │   └── mockData.ts          # Zengin kelime veritabanı, seviyeler ve bulmacalar
    ├── utils/
    │   ├── storage.ts           # AsyncStorage yardımcı servisi
    │   ├── speech.ts            # expo-speech sesli telaffuz motoru
    │   └── haptics.ts           # expo-haptics titreşim desteği
    └── components/
        ├── common/              # Ortak bileşenler (Header, BottomNav)
        ├── games/               # 5 mini oyun ve skor tablosu
        ├── modals/              # Arama, kelime detay, flashcard, liste ve drawer modalları
        └── views/               # Ana Sayfa, Oyunlar, Listeler, Profil, Ayarlar görünümleri
```
