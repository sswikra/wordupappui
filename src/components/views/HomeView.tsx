import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import {
  Search,
  X,
  Flame,
  Volume2,
  Plus,
  Target,
  Heart,
  ArrowRight,
  Sparkles,
  SearchX,
} from 'lucide-react-native';
import { Word, AppSettings } from '../../types';
import { playPronunciation } from '../../utils/speech';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';
import { searchWords } from '../../utils/search';
import { VOCABULARY_DATABASE } from '../../data/vocabulary';

interface HomeViewProps {
  wordOfTheDay: Word;
  suggestedWords: Word[];
  settings: AppSettings;
  streakCount: number;
  onOpenSearch?: () => void;
  onOpenAddWord: () => void;
  onSelectWord: (word: Word) => void;
  onViewAllSuggested?: () => void;
  onOpenDailyGoal?: () => void;
  darkMode?: boolean;
  words?: Word[];
  onToggleFavorite?: (wordId: string) => void;
}

const { width } = Dimensions.get('window');
const FILTER_OPTIONS = ['TÜMÜ', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'FAVORİLER'];

export const HomeView: React.FC<HomeViewProps> = ({
  wordOfTheDay,
  suggestedWords,
  settings,
  streakCount,
  onOpenSearch,
  onOpenAddWord,
  onSelectWord,
  onViewAllSuggested,
  onOpenDailyGoal,
  darkMode = false,
  words,
  onToggleFavorite,
}) => {
  const theme = getTheme(darkMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [onlineResult, setOnlineResult] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const handlePronounce = (wordText: string) => {
    HapticsService.light();
    playPronunciation(wordText);
  };

  const dailyProgressPercent = Math.min(
    100,
    Math.round((settings.currentDayWordsCount / settings.dailyGoal) * 100)
  );

  // Her zaman tüm kelime haznesini garantiye al
  const allAvailableWords = useMemo(() => {
    if (words && words.length >= VOCABULARY_DATABASE.length) {
      return words;
    }
    const customWords = (words || []).filter(
      (w) => w && !VOCABULARY_DATABASE.some((v) => v.id === w.id)
    );
    const overridesMap = new Map((words || []).map((w) => [w.id, w]));
    const merged = VOCABULARY_DATABASE.map((w) => {
      const over = overridesMap.get(w.id);
      return over ? { ...w, ...over } : w;
    });
    return [...customWords, ...merged];
  }, [words]);

  const filteredWords = useMemo(() => {
    const cleanQ = searchQuery.trim();
    if (!cleanQ) return [];
    return searchWords(allAvailableWords, cleanQ, { levelFilter });
  }, [allAvailableWords, searchQuery, levelFilter]);

  // Live online translation fallback if no local words match
  useEffect(() => {
    const cleanQ = searchQuery.trim();
    if (!cleanQ || cleanQ.length < 2 || filteredWords.length > 0) {
      setOnlineResult(null);
      setIsTranslating(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsTranslating(true);
        const isTr = /[çğıöşüÇĞİÖŞÜ]/.test(cleanQ) || cleanQ.endsWith('mak') || cleanQ.endsWith('mek');
        const pair = isTr ? 'tr|en' : 'en|tr';
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanQ)}&langpair=${pair}`
        );
        const data = await res.json();
        if (data?.responseData?.translatedText && data.responseData.translatedText.toLowerCase() !== cleanQ.toLowerCase()) {
          setOnlineResult(data.responseData.translatedText);
        } else {
          setOnlineResult(null);
        }
      } catch (e) {
        setOnlineResult(null);
      } finally {
        setIsTranslating(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery, filteredWords.length]);

  const createEphemeralWord = useCallback((cleanInput: string, transResult: string): Word => {
    const isTr = /[çğıöşüÇĞİÖŞÜ]/.test(cleanInput) || cleanInput.endsWith('mak') || cleanInput.endsWith('mek');
    const engWord = isTr ? transResult.trim() : cleanInput.trim();
    const trWord = isTr ? cleanInput.trim() : transResult.trim();
    return {
      id: `online_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      word: engWord,
      phonetic: `/${engWord.toLowerCase()}/`,
      partOfSpeech: 'Noun',
      level: 'A1',
      translation: trWord,
      definition: `${engWord}: ${trWord}`,
      example: `Search result for "${cleanInput.trim()}".`,
      exampleTranslation: `"${cleanInput.trim()}" için arama sonucu.`,
      mastery: 0,
    };
  }, []);

  const handleSearchSubmit = useCallback(async () => {
    const cleanQ = searchQuery.trim();
    if (!cleanQ) {
      Keyboard.dismiss();
      return;
    }

    // 1. Önce filtrelenmiş yerel kelimelerde tam ya da en iyi eşleşmeyi bul
    if (filteredWords.length > 0) {
      const cleanQLower = cleanQ.toLowerCase();
      const exactMatch = filteredWords.find(
        (w) =>
          w.word.toLowerCase() === cleanQLower ||
          (w.translation && w.translation.toLowerCase() === cleanQLower)
      );
      const targetWord = exactMatch || filteredWords[0];
      HapticsService.selection();
      Keyboard.dismiss();
      onSelectWord(targetWord);
      return;
    }

    // 2. Çevrimiçi çeviri sonucu varsa doğrudan kelime detayı oluştur ve aç
    if (onlineResult) {
      const onlineWord = createEphemeralWord(cleanQ, onlineResult);
      HapticsService.selection();
      Keyboard.dismiss();
      onSelectWord(onlineWord);
      return;
    }

    // 3. Eğer sonuç henüz gelmediyse hızlı canlı çeviri dene
    if (cleanQ.length >= 2) {
      setIsTranslating(true);
      try {
        const isTr = /[çğıöşüÇĞİÖŞÜ]/.test(cleanQ) || cleanQ.endsWith('mak') || cleanQ.endsWith('mek');
        const pair = isTr ? 'tr|en' : 'en|tr';
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanQ)}&langpair=${pair}`
        );
        const data = await res.json();
        const trans = data?.responseData?.translatedText;
        if (trans && trans.toLowerCase() !== cleanQ.toLowerCase()) {
          const onlineWord = createEphemeralWord(cleanQ, trans);
          HapticsService.selection();
          Keyboard.dismiss();
          onSelectWord(onlineWord);
          return;
        }
      } catch (e) {
        // sessizce geç
      } finally {
        setIsTranslating(false);
      }
    }

    Keyboard.dismiss();
  }, [searchQuery, filteredWords, onlineResult, onSelectWord, createEphemeralWord]);

  const handleClearSearch = useCallback(() => {
    HapticsService.light();
    setSearchQuery('');
    setLevelFilter('ALL');
    setOnlineResult(null);
    Keyboard.dismiss();
  }, []);

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* 1. Daily Streak Pill */}
      <View style={styles.streakContainer}>
        <View
          style={[
            styles.streakPill,
            {
              backgroundColor: darkMode ? '#1e293b' : '#fff8f0',
              borderColor: darkMode ? '#334155' : 'rgba(196, 98, 16, 0.25)',
            },
          ]}
        >
          <Flame size={16} color={darkMode ? '#f59e0b' : Colors.accentOrange} strokeWidth={2.4} />
          <Text style={[styles.streakText, { color: darkMode ? '#fbbf24' : Colors.accentOrange }]}>
            {streakCount} Günlük Seri!
          </Text>
        </View>
      </View>

      {/* 2. Direct Interactive Search Bar */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: darkMode ? '#1e293b' : '#e5eff3',
            borderColor: isSearchActive
              ? Colors.primary
              : darkMode
              ? '#334155'
              : '#d1e3ec',
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleSearchSubmit}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.searchIconBtn}
          accessibilityLabel="Ara"
        >
          <Search
            size={19}
            color={darkMode ? Colors.primaryAccent : Colors.primary}
            strokeWidth={2.4}
          />
        </TouchableOpacity>

        <TextInput
          ref={searchInputRef}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          placeholder="İngilizce veya Türkçe kelime ara..."
          placeholderTextColor={darkMode ? '#94a3b8' : '#64748b'}
          style={[
            styles.searchInput,
            { color: darkMode ? '#f8fafc' : '#0f172a' },
          ]}
          returnKeyType="search"
          blurOnSubmit={false}
          clearButtonMode="never"
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            style={[
              styles.clearBtn,
              { backgroundColor: darkMode ? '#334155' : '#cbd5e1' },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Aramayı Kapat ve Temizle"
          >
            <X size={15} color={darkMode ? '#f8fafc' : '#334155'} strokeWidth={2.4} />
          </TouchableOpacity>
        )}
      </View>

      {/* 3. DYNAMIC CONTENT: EITHER SEARCH RESULTS OR NORMAL HOME FEED */}
      {isSearchActive ? (
        <View style={styles.searchResultsWrapper}>
          {/* Result Count and Level Filter Chips */}
          <View style={styles.resultsHeaderRow}>
            <View
              style={[
                styles.countBadge,
                { backgroundColor: darkMode ? '#334155' : '#e0f2fe' },
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  { color: darkMode ? Colors.primaryAccent : Colors.primary },
                ]}
              >
                {filteredWords.length} kelime bulundu
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {FILTER_OPTIONS.map((filter) => {
                const filterKey =
                  filter === 'TÜMÜ'
                    ? 'ALL'
                    : filter === 'FAVORİLER'
                    ? 'FAVORITES'
                    : filter;
                const isActive = levelFilter === filterKey;
                return (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => {
                      HapticsService.selection();
                      setLevelFilter(filterKey);
                    }}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isActive
                          ? Colors.primary
                          : darkMode
                          ? '#334155'
                          : '#f1f5f9',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: isActive
                            ? '#ffffff'
                            : darkMode
                            ? '#cbd5e1'
                            : '#475569',
                          fontWeight: isActive ? '800' : '600',
                        },
                      ]}
                    >
                      {filter === 'FAVORİLER' ? '❤️ Favoriler' : filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* List of matching words */}
          {filteredWords.length > 0 ? (
            filteredWords.slice(0, 30).map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  HapticsService.selection();
                  onSelectWord(item);
                }}
                activeOpacity={0.75}
                style={[
                  styles.searchWordCard,
                  {
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View style={styles.searchWordLeft}>
                  <TouchableOpacity
                    onPress={() => handlePronounce(item.word)}
                    style={[
                      styles.searchAudioBtn,
                      { backgroundColor: darkMode ? '#334155' : '#fef3e2' },
                    ]}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Volume2 size={16} color={Colors.accentGold} />
                  </TouchableOpacity>

                  <View style={styles.searchWordTexts}>
                    <View style={styles.searchWordTitleRow}>
                      <Text
                        style={[
                          styles.searchWordTitle,
                          { color: darkMode ? '#fbbf24' : Colors.accentOrange },
                        ]}
                      >
                        {item.word}
                      </Text>
                      {item.partOfSpeech ? (
                        <View
                          style={[
                            styles.posTag,
                            { backgroundColor: darkMode ? '#334155' : '#e0f2fe' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.posTagText,
                              { color: darkMode ? '#7dd3fc' : '#0369a1' },
                            ]}
                          >
                            {item.partOfSpeech}
                          </Text>
                        </View>
                      ) : null}
                      {item.level ? (
                        <View
                          style={[
                            styles.levelTag,
                            { backgroundColor: darkMode ? '#334155' : '#d8ebee' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.levelTagText,
                              {
                                color: darkMode
                                  ? Colors.primaryAccent
                                  : Colors.primaryDark,
                              },
                            ]}
                          >
                            {item.level}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.searchWordTr,
                        { color: darkMode ? Colors.primaryAccent : Colors.primary },
                      ]}
                      numberOfLines={2}
                    >
                      {item.translation}
                    </Text>
                  </View>
                </View>

                <View style={styles.searchWordActions}>
                  {onToggleFavorite && (
                    <TouchableOpacity
                      onPress={() => {
                        HapticsService.selection();
                        onToggleFavorite(item.id);
                      }}
                      style={styles.favBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Heart
                        size={18}
                        color="#ef4444"
                        fill={item.isFavorite ? '#ef4444' : 'transparent'}
                      />
                    </TouchableOpacity>
                  )}
                  <ArrowRight size={16} color={darkMode ? '#64748b' : '#94a3b8'} />
                </View>
              </TouchableOpacity>
            ))
          ) : isTranslating ? (
            <View style={styles.translatingBox}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text
                style={[
                  styles.translatingText,
                  { color: darkMode ? '#94a3b8' : '#64748b' },
                ]}
              >
                Canlı sözlükte aranıyor...
              </Text>
            </View>
          ) : onlineResult ? (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                const onlineWord = createEphemeralWord(
                  searchQuery.trim(),
                  onlineResult
                );
                HapticsService.selection();
                onSelectWord(onlineWord);
              }}
              style={[
                styles.onlineResultCard,
                {
                  backgroundColor: darkMode ? '#1e293b' : '#f0fdf4',
                  borderColor: darkMode ? '#334155' : '#86efac',
                },
              ]}
            >
              <View style={styles.onlineHeaderRow}>
                <Sparkles size={16} color={Colors.accentOrange} />
                <Text style={[styles.onlineLabel, { color: Colors.accentOrange }]}>
                  Canlı Sözlük Çevirisi (Tıklayıp İncele)
                </Text>
              </View>
              <Text
                style={[
                  styles.onlineQuery,
                  { color: darkMode ? '#f8fafc' : '#0f172a' },
                ]}
              >
                {searchQuery}
              </Text>
              <Text
                style={[
                  styles.onlineTrans,
                  { color: darkMode ? Colors.primaryAccent : Colors.primary },
                ]}
              >
                {onlineResult}
              </Text>
              <View
                style={[styles.addCustomBtn, { backgroundColor: Colors.primary }]}
              >
                <Plus size={14} color="#ffffff" strokeWidth={2.6} />
                <Text style={styles.addCustomBtnText}>
                  Kelime Detayını Aç & Ekle
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: darkMode ? '#334155' : '#f1f5f9' },
                ]}
              >
                <SearchX size={30} color={darkMode ? '#94a3b8' : '#64748b'} />
              </View>
              <Text
                style={[
                  styles.emptyTitle,
                  { color: darkMode ? '#f8fafc' : '#0f172a' },
                ]}
              >
                Sonuç Bulunamadı
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: darkMode ? '#94a3b8' : '#64748b' },
                ]}
              >
                "{searchQuery}" ile eşleşen kelime bulunamadı.
              </Text>
              {onOpenAddWord && (
                <TouchableOpacity
                  onPress={onOpenAddWord}
                  style={[
                    styles.addCustomBtnOutline,
                    { borderColor: Colors.primary },
                  ]}
                >
                  <Plus size={14} color={Colors.primary} strokeWidth={2.6} />
                  <Text
                    style={[
                      styles.addCustomBtnOutlineText,
                      { color: Colors.primary },
                    ]}
                  >
                    Yeni Kelime Olarak Ekle
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      ) : (
        /* 4. Normal Home Screen Feed */
        <View>
          {/* WORD OF THE DAY Card */}
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: darkMode ? Colors.primaryAccent : Colors.primary },
              ]}
            >
              GÜNÜN KELİMESİ
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              HapticsService.selection();
              onSelectWord(wordOfTheDay);
            }}
            activeOpacity={0.9}
            style={[
              styles.wotdCard,
              {
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.wotdWord,
                { color: darkMode ? '#fbbf24' : Colors.accentOrange },
              ]}
            >
              {wordOfTheDay.word}
            </Text>

            {/* Badges: Part of Speech & Level */}
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.posBadge,
                  { backgroundColor: darkMode ? '#334155' : '#d8ebee' },
                ]}
              >
                <Text
                  style={[
                    styles.posText,
                    {
                      color: darkMode
                        ? Colors.primaryAccent
                        : Colors.primaryDark,
                    },
                  ]}
                >
                  {wordOfTheDay.partOfSpeech}
                </Text>
              </View>
              <View
                style={[
                  styles.levelBadge,
                  { backgroundColor: darkMode ? '#334155' : '#fef3e2' },
                ]}
              >
                <Text
                  style={[
                    styles.levelText,
                    { color: darkMode ? '#fcd34d' : '#92400e' },
                  ]}
                >
                  Seviye {wordOfTheDay.level}
                </Text>
              </View>
            </View>

            {/* Subtle Divider */}
            <View
              style={[
                styles.cardDivider,
                { backgroundColor: darkMode ? '#334155' : '#e2e8f0' },
              ]}
            />

            {/* Turkish Translation */}
            <Text
              style={[
                styles.wotdTranslation,
                { color: darkMode ? Colors.primaryAccent : Colors.primary },
              ]}
            >
              {wordOfTheDay.translation}
            </Text>

            {/* Example Sentence & Pronounce Button */}
            <View style={styles.exampleRow}>
              <Text
                style={[
                  styles.exampleText,
                  { color: darkMode ? '#cbd5e1' : '#334155' },
                ]}
              >
                "{wordOfTheDay.example}"
              </Text>

              <TouchableOpacity
                onPress={() => handlePronounce(wordOfTheDay.word)}
                activeOpacity={0.8}
                style={[
                  styles.speakerBtn,
                  { backgroundColor: Colors.accentGold },
                ]}
                accessibilityLabel="Telaffuz et"
              >
                <Volume2 size={20} color="#ffffff" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* SUGGESTED FOR YOU Grid */}
          <View style={[styles.sectionHeader, { marginTop: 18 }]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: darkMode ? Colors.primaryAccent : Colors.primary },
              ]}
            >
              SENİN İÇİN ÖNERİLENLER
            </Text>
            <TouchableOpacity onPress={onViewAllSuggested || onOpenSearch}>
              <Text
                style={[
                  styles.seeAllText,
                  { color: darkMode ? Colors.primaryAccent : Colors.primary },
                ]}
              >
                Tümünü Gör
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid2x2}>
            {suggestedWords.slice(0, 3).map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  HapticsService.selection();
                  onSelectWord(item);
                }}
                activeOpacity={0.85}
                style={[
                  styles.suggestedCard,
                  {
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.suggestedWord,
                    { color: darkMode ? '#fbbf24' : Colors.accentOrange },
                  ]}
                >
                  {item.word}
                </Text>
                <Text
                  style={[
                    styles.suggestedTr,
                    { color: darkMode ? Colors.primaryAccent : Colors.primary },
                  ]}
                >
                  {item.translation}
                </Text>
              </TouchableOpacity>
            ))}

            {/* "+ Kelime Ekle" Shortcut Card */}
            <TouchableOpacity
              onPress={() => {
                HapticsService.selection();
                onOpenAddWord();
              }}
              activeOpacity={0.8}
              style={[
                styles.addWordCard,
                {
                  backgroundColor: darkMode
                    ? 'rgba(52, 92, 67, 0.15)'
                    : '#ecfdf5',
                  borderColor: darkMode
                    ? 'rgba(123, 169, 131, 0.4)'
                    : '#a7f3d0',
                },
              ]}
            >
              <View
                style={[
                  styles.addIconCircle,
                  {
                    borderColor: darkMode
                      ? Colors.primaryAccent
                      : Colors.primary,
                  },
                ]}
              >
                <Plus
                  size={18}
                  color={darkMode ? Colors.primaryAccent : Colors.primary}
                  strokeWidth={2.8}
                />
              </View>
              <Text
                style={[
                  styles.addCardText,
                  { color: darkMode ? Colors.primaryAccent : Colors.primary },
                ]}
              >
                Kelime Ekle
              </Text>
            </TouchableOpacity>
          </View>

          {/* Daily Goal Progress Card */}
          <TouchableOpacity
            activeOpacity={onOpenDailyGoal ? 0.85 : 1}
            onPress={() => {
              if (onOpenDailyGoal) {
                HapticsService.light();
                onOpenDailyGoal();
              }
            }}
            style={[
              styles.goalCard,
              {
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <View style={styles.goalHeader}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Target
                  size={16}
                  color={darkMode ? Colors.primaryAccent : Colors.primary}
                  strokeWidth={2.4}
                />
                <Text
                  style={[
                    styles.goalTitle,
                    { color: darkMode ? Colors.primaryAccent : Colors.primary },
                  ]}
                >
                  Günlük Hedef
                </Text>
              </View>
              <View
                style={[
                  styles.goalBadge,
                  {
                    backgroundColor: darkMode
                      ? 'rgba(245, 158, 11, 0.2)'
                      : '#fdecd2',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.goalBadgeText,
                    { color: darkMode ? '#fbbf24' : '#87450a' },
                  ]}
                >
                  {settings.currentDayWordsCount}/{settings.dailyGoal} Kelime
                </Text>
              </View>
            </View>

            {/* Progress Track & Bar */}
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: darkMode ? '#334155' : '#e2e8f0' },
              ]}
            >
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${dailyProgressPercent}%`,
                    backgroundColor: darkMode
                      ? Colors.primaryAccent
                      : Colors.primary,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 110,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    paddingLeft: 12,
    paddingRight: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIconBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 0,
    paddingHorizontal: 6,
  },
  clearBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  searchResultsWrapper: {
    gap: 8,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
  },
  filterScroll: {
    gap: 6,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  filterChipText: {
    fontSize: 11,
  },
  searchWordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchWordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  searchAudioBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWordTexts: {
    flex: 1,
  },
  searchWordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  searchWordTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  posTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  posTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  levelTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  levelTagText: {
    fontSize: 9,
    fontWeight: '900',
  },
  searchWordTr: {
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 2,
  },
  searchWordActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favBtn: {
    padding: 6,
  },
  translatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  translatingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  onlineResultCard: {
    width: '100%',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 8,
  },
  onlineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  onlineLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  onlineQuery: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  onlineTrans: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  addCustomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  addCustomBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  addCustomBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  addCustomBtnOutlineText: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
  },
  wotdCard: {
    borderRadius: 30,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  wotdWord: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  posBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  posText: {
    fontSize: 11,
    fontWeight: '800',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardDivider: {
    width: 220,
    height: 1,
    marginBottom: 16,
  },
  wotdTranslation: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 14,
  },
  exampleRow: {
    width: '100%',
    position: 'relative',
    minHeight: 48,
    justifyContent: 'center',
    paddingRight: 50,
  },
  exampleText: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 18,
  },
  speakerBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  suggestedCard: {
    width: (width - 42) / 2,
    minHeight: 95,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestedWord: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 2,
  },
  suggestedTr: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  addWordCard: {
    width: (width - 42) / 2,
    minHeight: 95,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  addCardText: {
    fontSize: 12,
    fontWeight: '800',
  },
  goalCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    marginTop: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  goalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
});
