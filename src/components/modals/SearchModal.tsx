import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Search, X, Volume2, Heart, SearchX } from 'lucide-react-native';
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
  darkMode?: boolean;
}

const { width, height } = Dimensions.get('window');

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
        activeOpacity={0.85}
        style={[
          styles.wordItemCard,
          {
            backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
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
            >
              {item.translation}
            </Text>
          </View>
        </View>

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
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setLevelFilter('ALL');
    }
  }, [isOpen]);

  const filteredWords = useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    return searchWords(words, query, { levelFilter });
  }, [words, query, levelFilter]);

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
      // Tam eşleşen kelime varsa önce onu bul, yoksa en yüksek skorlu ilk sonucu aç
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
    if (!query.trim()) {
      return null;
    }
    return (
      <View style={styles.emptyState}>
        <View
          style={[
            styles.emptyIconCircle,
            { backgroundColor: darkMode ? '#334155' : '#f1f5f9' },
          ]}
        >
          <SearchX size={32} color={darkMode ? '#94a3b8' : '#64748b'} />
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
          "{query}" için eşleşen İngilizce veya Türkçe kelime bulunamadı.
        </Text>
      </View>
    );
  }, [query, darkMode]);

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
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdropContainer}>
          {/* Frosted Glass Blur Background */}
          <BlurView
            intensity={Platform.OS === 'ios' ? 75 : 90}
            tint={darkMode ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />

          {/* Semi-transparent tint overlay for contrast */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: darkMode
                  ? 'rgba(15, 23, 42, 0.72)'
                  : 'rgba(235, 243, 248, 0.65)',
              },
            ]}
          />

          {/* Centered Keyboard Avoiding Container */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoidingView}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.mainContainer}>
                {/* Floating Centered Search Bar Capsule */}
                <View
                  style={[
                    styles.searchCapsule,
                    {
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      borderColor: darkMode
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(52, 92, 67, 0.25)',
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
                    onPress={onClose}
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

                {/* Floating Results Card (Only appears when typing) */}
                {hasQuery && (
                  <View
                    style={[
                      styles.resultsCard,
                      {
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                        borderColor: theme.cardBorder,
                      },
                    ]}
                  >
                    {/* Header with Result Count & Level Filter Chips */}
                    <View style={styles.resultsHeader}>
                      <View style={styles.countBadge}>
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
                          {filteredWords.length} kelime
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

                    {/* Results FlatList */}
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
                      keyboardShouldPersistTaps="handled"
                    />
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  mainContainer: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    justifyContent: 'center',
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
    maxHeight: height * 0.52,
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
    paddingHorizontal: 14,
    paddingTop: 12,
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
  },
  wordItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
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
  },
  wordItemTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  levelTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  levelTagText: {
    fontSize: 9,
    fontWeight: '900',
  },
  wordItemTr: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  favBtn: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  },
});
