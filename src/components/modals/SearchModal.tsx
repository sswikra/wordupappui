import React, { useState, useMemo, useCallback } from 'react';
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
} from 'react-native';
import { Search, X, Volume2, Heart, ArrowRight, SearchX } from 'lucide-react-native';
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

const { height } = Dimensions.get('window');

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

  const filteredWords = useMemo(() => {
    return searchWords(words, query);
  }, [words, query]);

  const handleSelectWord = useCallback(
    (item: Word) => {
      HapticsService.selection();
      onSelectWord(item);
    },
    [onSelectWord]
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
          <SearchX size={36} color={darkMode ? '#94a3b8' : '#64748b'} />
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

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff' }]}>
          {/* Search Header Bar */}
          <View style={styles.header}>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: darkMode ? '#334155' : '#e5eff3',
                  borderColor: darkMode ? '#475569' : '#d1e3ec',
                },
              ]}
            >
              <Search size={18} color={theme.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="İngilizce veya Türkçe kelime ara..."
                placeholderTextColor={darkMode ? '#94a3b8' : '#64748b'}
                style={[styles.searchInput, { color: theme.textPrimary }]}
                autoFocus
              />
              {query ? (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <X size={16} color={theme.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Results Count */}
          <View style={styles.countRow}>
            <Text style={[styles.countText, { color: theme.textMuted }]}>
              {filteredWords.length} kelime bulundu
            </Text>
          </View>

          {/* Words List */}
          <FlatList
            data={filteredWords}
            keyExtractor={keyExtractor}
            renderItem={renderWordItem}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
            initialNumToRender={12}
            maxToRenderPerBatch={10}
            windowSize={5}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={Platform.OS === 'android'}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    height: height * 0.88,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  countRow: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resultsList: {
    gap: 8,
    paddingBottom: 20,
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
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
});
