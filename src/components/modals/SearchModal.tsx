import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  X,
  Volume2,
  Heart,
  SearchX,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react-native';
import { Word } from '../../types';
import { VOCABULARY_DATABASE } from '../../data/vocabulary';
import { playPronunciation } from '../../utils/speech';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';
import { searchWords } from '../../utils/search';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: Word[];
  onSelectWord: (word: Word) => void;
  onToggleFavorite: (wordId: string) => void;
  onOpenAddWord?: () => void;
  darkMode?: boolean;
}

const FILTER_OPTIONS = ['TÜMÜ', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'FAVORİLER'];

interface SearchWordItemProps {
  item: Word;
  darkMode: boolean;
  cardBorder: string;
  onSelectWord: (item: Word) => void;
  onPlayPronunciation: (word: string) => void;
  onToggleFavorite: (id: string) => void;
}

const SearchWordItem = React.memo<SearchWordItemProps>(
  ({
    item,
    darkMode,
    cardBorder,
    onSelectWord,
    onPlayPronunciation,
    onToggleFavorite,
  }) => {
    return (
      <TouchableOpacity
        onPress={() => onSelectWord(item)}
        activeOpacity={0.75}
        style={[
          styles.wordItemCard,
          {
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            borderColor: cardBorder,
          },
        ]}
      >
        <View style={styles.wordItemLeft}>
          <TouchableOpacity
            onPress={() => onPlayPronunciation(item.word)}
            style={[
              styles.audioBtn,
              { backgroundColor: darkMode ? '#334155' : '#fef3e2' },
            ]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Volume2 size={16} color={Colors.accentGold} />
          </TouchableOpacity>

          <View style={styles.wordItemTexts}>
            <View style={styles.wordItemTitleRow}>
              <Text
                style={[
                  styles.wordItemTitle,
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
                      {
                        color: darkMode ? '#7dd3fc' : '#0369a1',
                      },
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
                styles.wordItemTr,
                { color: darkMode ? Colors.primaryAccent : Colors.primary },
              ]}
              numberOfLines={2}
            >
              {item.translation}
            </Text>
          </View>
        </View>

        <View style={styles.wordItemActions}>
          <TouchableOpacity
            onPress={() => onToggleFavorite(item.id)}
            style={styles.favBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Heart
              size={18}
              color="#ef4444"
              fill={item.isFavorite ? '#ef4444' : 'transparent'}
            />
          </TouchableOpacity>
          <ArrowRight size={16} color={darkMode ? '#64748b' : '#94a3b8'} />
        </View>
      </TouchableOpacity>
    );
  }
);

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  words,
  onSelectWord,
  onToggleFavorite,
  onOpenAddWord,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [onlineResult, setOnlineResult] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Reset states when search is closed
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setLevelFilter('ALL');
      setOnlineResult(null);
      setIsTranslating(false);
    }
  }, [isOpen]);

  // Focus input whenever opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
    const cleanQ = query.trim();
    if (!cleanQ) {
      if (levelFilter === 'FAVORITES') {
        return allAvailableWords.filter((w) => !!w.isFavorite);
      }
      if (levelFilter !== 'ALL') {
        return allAvailableWords.filter((w) => w.level === levelFilter).slice(0, 40);
      }
      return allAvailableWords.slice(0, 25);
    }
    return searchWords(allAvailableWords, cleanQ, { levelFilter });
  }, [allAvailableWords, query, levelFilter]);

  // Live online translation fallback if no local words match
  useEffect(() => {
    const cleanQ = query.trim();
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
  }, [query, filteredWords.length]);

  const handleSelectWord = useCallback(
    (item: Word) => {
      HapticsService.selection();
      Keyboard.dismiss();
      onClose();
      onSelectWord(item);
    },
    [onSelectWord, onClose]
  );

  const handlePlayPronunciation = useCallback((word: string) => {
    HapticsService.light();
    playPronunciation(word);
  }, []);

  const handleToggleFavorite = useCallback(
    (id: string) => {
      HapticsService.selection();
      onToggleFavorite(id);
    },
    [onToggleFavorite]
  );

  const handleClose = useCallback(() => {
    HapticsService.light();
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

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

  const handleSubmitEditing = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const keyExtractor = useCallback((item: Word) => item.id, []);

  const renderEmptyState = useCallback(() => {
    const cleanQ = query.trim();
    if (!cleanQ) {
      if (levelFilter === 'FAVORITES') {
        return (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: darkMode ? '#334155' : '#fee2e2' },
              ]}
            >
              <Heart size={26} color="#ef4444" />
            </View>
            <Text style={[styles.emptyTitle, { color: darkMode ? '#f8fafc' : '#0f172a' }]}>
              Henüz Favori Kelimeniz Yok
            </Text>
            <Text style={[styles.emptySubtitle, { color: darkMode ? '#94a3b8' : '#64748b' }]}>
              Kelimelerin yanındaki kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.
            </Text>
          </View>
        );
      }
      return null;
    }

    return (
      <View style={styles.emptyState}>
        {isTranslating ? (
          <View style={styles.translatingBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={[styles.translatingText, { color: darkMode ? '#94a3b8' : '#64748b' }]}>
              Canlı sözlükte aranıyor...
            </Text>
          </View>
        ) : onlineResult ? (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              const onlineWord = createEphemeralWord(cleanQ, onlineResult);
              handleSelectWord(onlineWord);
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
            <Text style={[styles.onlineQuery, { color: darkMode ? '#f8fafc' : '#0f172a' }]}>
              {query}
            </Text>
            <Text style={[styles.onlineTrans, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
              {onlineResult}
            </Text>
            <View style={[styles.addCustomBtn, { backgroundColor: Colors.primary }]}>
              <Plus size={14} color="#ffffff" strokeWidth={2.6} />
              <Text style={styles.addCustomBtnText}>Kelime Detayını Aç & Ekle</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyInner}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: darkMode ? '#334155' : '#f1f5f9' },
              ]}
            >
              <SearchX size={30} color={darkMode ? '#94a3b8' : '#64748b'} />
            </View>
            <Text style={[styles.emptyTitle, { color: darkMode ? '#f8fafc' : '#0f172a' }]}>
              Sonuç Bulunamadı
            </Text>
            <Text style={[styles.emptySubtitle, { color: darkMode ? '#94a3b8' : '#64748b' }]}>
              "{query}" ile eşleşen kelime veritabanında bulunamadı.
            </Text>
            {onOpenAddWord && (
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onOpenAddWord();
                }}
                style={[styles.addCustomBtnOutline, { borderColor: Colors.primary }]}
              >
                <Plus size={14} color={Colors.primary} strokeWidth={2.6} />
                <Text style={[styles.addCustomBtnOutlineText, { color: Colors.primary }]}>
                  Yeni Kelime Olarak Ekle
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }, [query, levelFilter, isTranslating, onlineResult, darkMode, onOpenAddWord, onClose, handleSelectWord]);

  const renderWordItem = useCallback(
    ({ item }: { item: Word }) => (
      <SearchWordItem
        item={item}
        darkMode={darkMode}
        cardBorder={theme.cardBorder}
        onSelectWord={handleSelectWord}
        onPlayPronunciation={handlePlayPronunciation}
        onToggleFavorite={handleToggleFavorite}
      />
    ),
    [
      darkMode,
      theme.cardBorder,
      handleSelectWord,
      handlePlayPronunciation,
      handleToggleFavorite,
    ]
  );

  if (!isOpen) return null;

  const hasQuery = query.trim().length > 0;

  const headerLabel = hasQuery
    ? `${filteredWords.length} kelime bulundu`
    : levelFilter === 'FAVORITES'
    ? 'Favori Kelimelerim'
    : levelFilter !== 'ALL'
    ? `${levelFilter} Seviyesi Kelimeleri`
    : 'Önerilen Kelimeler';

  return (
    <View
      style={[
        styles.overlayRoot,
        {
          backgroundColor: darkMode
            ? 'rgba(15, 23, 42, 0.96)'
            : 'rgba(235, 243, 248, 0.96)',
        },
      ]}
    >
      {/* Absolute Backdrop Touchable */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={handleClose}
      />

      {/* Foreground Safe Content */}
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          {/* Header Bar with Back button, Search input, and Close button */}
          <View style={styles.headerBar}>
            {/* 1. Back Arrow Button */}
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.7}
              style={[
                styles.headerBtn,
                {
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  borderColor: darkMode ? '#334155' : '#d1e3ec',
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Geri"
            >
              <ArrowLeft
                size={22}
                color={darkMode ? '#f8fafc' : '#334155'}
                strokeWidth={2.4}
              />
            </TouchableOpacity>

            {/* 2. Main Search Capsule */}
            <View
              style={[
                styles.searchCapsule,
                {
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  borderColor: darkMode
                    ? 'rgba(255, 255, 255, 0.18)'
                    : 'rgba(52, 92, 67, 0.35)',
                },
              ]}
            >
              <TouchableOpacity
                onPress={handleSubmitEditing}
                activeOpacity={0.7}
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
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSubmitEditing}
                placeholder="İngilizce veya Türkçe kelime ara..."
                placeholderTextColor={darkMode ? '#94a3b8' : '#64748b'}
                style={[
                  styles.searchInput,
                  { color: darkMode ? '#f8fafc' : '#0f172a' },
                ]}
                autoFocus
                returnKeyType="search"
                blurOnSubmit={false}
                clearButtonMode="never"
              />

              {query.length > 0 ? (
                <TouchableOpacity
                  onPress={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  style={[
                    styles.clearBtn,
                    { backgroundColor: darkMode ? '#334155' : '#e2e8f0' },
                  ]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Metni temizle"
                >
                  <X size={14} color={darkMode ? '#cbd5e1' : '#475569'} strokeWidth={2.6} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* 3. Close Button */}
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.7}
              style={[
                styles.headerBtn,
                {
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  borderColor: darkMode ? '#334155' : '#d1e3ec',
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Kapat"
            >
              <X
                size={20}
                color={darkMode ? '#f8fafc' : '#334155'}
                strokeWidth={2.4}
              />
            </TouchableOpacity>
          </View>

          {/* Main Floating Results & Filter Card */}
          <View
            style={[
              styles.resultsCard,
              {
                backgroundColor: darkMode
                  ? 'rgba(30, 41, 59, 0.98)'
                  : 'rgba(255, 255, 255, 0.98)',
                borderColor: darkMode
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(226, 237, 242, 0.9)',
              },
            ]}
          >
            {/* Result count & Level Filter Chips */}
            <View style={styles.resultsHeader}>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: darkMode ? '#334155' : '#e5eff3' },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    {
                      color: darkMode
                        ? Colors.primaryAccent
                        : Colors.primary,
                    },
                  ]}
                >
                  {headerLabel}
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

            {/* Words FlatList */}
            <FlatList
              data={filteredWords}
              keyExtractor={keyExtractor}
              renderItem={renderWordItem}
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
              initialNumToRender={14}
              maxToRenderPerBatch={12}
              windowSize={7}
              updateCellsBatchingPeriod={30}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 30,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 12,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 8,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  searchCapsule: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingLeft: 10,
    paddingRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
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
    paddingHorizontal: 4,
  },
  clearBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  resultsCard: {
    width: '100%',
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
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
  resultsList: {
    padding: 12,
    gap: 8,
    paddingBottom: 32,
  },
  wordItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  wordItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  audioBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordItemTexts: {
    flex: 1,
  },
  wordItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  wordItemTitle: {
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
  wordItemTr: {
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 2,
  },
  wordItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favBtn: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyInner: {
    alignItems: 'center',
    justifyContent: 'center',
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
  translatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  translatingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  onlineResultCard: {
    width: '100%',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
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
});
