import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Modal,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Search, X, Volume2, Heart, SearchX, Plus, ArrowRight, Sparkles } from 'lucide-react-native';
import { Word } from '../../types';
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

const { height } = Dimensions.get('window');

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

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setLevelFilter('ALL');
      setOnlineResult(null);
      setIsTranslating(false);
    }
  }, [isOpen]);

  const filteredWords = useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    return searchWords(words, query, { levelFilter });
  }, [words, query, levelFilter]);

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
      onSelectWord(item);
      onClose();
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

  const handleSubmitEditing = useCallback(() => {
    if (filteredWords.length > 0) {
      const cleanQ = query.trim().toLowerCase();
      const exactMatch = filteredWords.find(
        (w) =>
          w.word.toLowerCase() === cleanQ ||
          w.translation.toLowerCase() === cleanQ
      );
      const targetWord = exactMatch || filteredWords[0];
      handleSelectWord(targetWord);
    } else {
      HapticsService.light();
      Keyboard.dismiss();
    }
  }, [filteredWords, query, handleSelectWord]);

  const keyExtractor = useCallback((item: Word) => item.id, []);

  const renderEmptyState = useCallback(() => {
    if (!query.trim()) return null;

    return (
      <View style={styles.emptyState}>
        {isTranslating ? (
          <View style={styles.translatingBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={[styles.translatingText, { color: darkMode ? '#94a3b8' : '#64748b' }]}>
              Çeviri aranıyor...
            </Text>
          </View>
        ) : onlineResult ? (
          <View style={[styles.onlineResultCard, { backgroundColor: darkMode ? '#1e293b' : '#f0fdf4', borderColor: darkMode ? '#334155' : '#86efac' }]}>
            <View style={styles.onlineHeaderRow}>
              <Sparkles size={16} color={Colors.accentOrange} />
              <Text style={[styles.onlineLabel, { color: Colors.accentOrange }]}>
                Canlı Sözlük Çevirisi
              </Text>
            </View>
            <Text style={[styles.onlineQuery, { color: darkMode ? '#f8fafc' : '#0f172a' }]}>
              {query}
            </Text>
            <Text style={[styles.onlineTrans, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
              {onlineResult}
            </Text>
            {onOpenAddWord && (
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onOpenAddWord();
                }}
                style={[styles.addCustomBtn, { backgroundColor: Colors.primary }]}
              >
                <Plus size={14} color="#ffffff" strokeWidth={2.6} />
                <Text style={styles.addCustomBtnText}>Kelime Listeme Ekle</Text>
              </TouchableOpacity>
            )}
          </View>
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
  }, [query, isTranslating, onlineResult, darkMode, onOpenAddWord, onClose]);

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

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* 1. Frosted Glass Blur Background */}
        <BlurView
          intensity={Platform.OS === 'ios' ? 75 : 90}
          tint={darkMode ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

        {/* 2. Absolute Backdrop - Touching outside triggers dismiss & close */}
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: darkMode
                ? 'rgba(15, 23, 42, 0.72)'
                : 'rgba(235, 243, 248, 0.68)',
            },
          ]}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        />

        {/* 3. Foreground Safe Layout */}
        <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[
              styles.container,
              hasQuery ? styles.containerActive : styles.containerCentered,
            ]}
          >
            {/* Search Bar Capsule */}
            <View
              style={[
                styles.searchCapsule,
                {
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  borderColor: darkMode
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(52, 92, 67, 0.28)',
                },
              ]}
            >
              <TouchableOpacity
                onPress={handleSubmitEditing}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Search
                  size={20}
                  color={darkMode ? Colors.primaryAccent : Colors.primary}
                  strokeWidth={2.4}
                  style={styles.searchIcon}
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
                clearButtonMode="while-editing"
              />

              {query ? (
                <TouchableOpacity
                  onPress={() => setQuery('')}
                  style={styles.clearBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={16} color={darkMode ? '#94a3b8' : '#64748b'} />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  onClose();
                }}
                style={[
                  styles.closeBtn,
                  {
                    backgroundColor: darkMode ? '#334155' : '#f1f5f9',
                  },
                ]}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <X
                  size={18}
                  color={darkMode ? '#f8fafc' : '#334155'}
                  strokeWidth={2.2}
                />
              </TouchableOpacity>
            </View>

            {/* Results Floating Card (Only when query is present) */}
            {hasQuery && (
              <View
                style={[
                  styles.resultsCard,
                  {
                    backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(226, 237, 242, 0.9)',
                  },
                ]}
              >
                {/* Result count & level chips */}
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

                {/* Words FlatList */}
                <FlatList
                  data={filteredWords}
                  keyExtractor={keyExtractor}
                  renderItem={renderWordItem}
                  ListEmptyComponent={renderEmptyState}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.resultsList}
                  initialNumToRender={10}
                  maxToRenderPerBatch={8}
                  windowSize={5}
                  updateCellsBatchingPeriod={50}
                  removeClippedSubviews={Platform.OS === 'android'}
                  keyboardShouldPersistTaps="always"
                />
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerActive: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
  },
  searchCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    paddingLeft: 16,
    paddingRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 6,
    marginRight: 4,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsCard: {
    width: '100%',
    marginTop: 12,
    flex: 1,
    maxHeight: height * 0.62,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterChipText: {
    fontSize: 10.5,
  },
  resultsList: {
    padding: 12,
    paddingTop: 4,
    gap: 8,
    paddingBottom: 24,
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
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
    marginBottom: 12,
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

