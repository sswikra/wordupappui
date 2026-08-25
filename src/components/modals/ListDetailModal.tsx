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
  Alert,
  Platform,
} from 'react-native';
import {
  X,
  Volume2,
  Heart,
  Play,
  RotateCcw,
  RotateCw,
  CheckCircle2,
  ArrowLeft,
  Trash2,
  Sparkles,
} from 'lucide-react-native';
import { WordList, Word } from '../../types';
import { playPronunciation } from '../../utils/speech';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';

interface ListDetailModalProps {
  list: WordList | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectWord: (word: Word) => void;
  onToggleFavorite: (wordId: string) => void;
  onUpdateListMastery: (listId: string, delta: number) => void;
  onDeleteList?: (listId: string) => void;
  onClearList?: (listId: string) => void;
  onWordMastered?: () => void;
  darkMode?: boolean;
}

const { width, height } = Dimensions.get('window');

interface WordRowItemProps {
  item: Word;
  darkMode: boolean;
  cardBorder: string;
  textSecondary: string;
  onSelectWord: (item: Word) => void;
  onPlayPronunciation: (word: string) => void;
  onToggleFavorite: (id: string) => void;
}

const WordRowItem = React.memo<WordRowItemProps>(
  ({
    item,
    darkMode,
    cardBorder,
    textSecondary,
    onSelectWord,
    onPlayPronunciation,
    onToggleFavorite,
  }) => {
    return (
      <TouchableOpacity
        onPress={() => onSelectWord(item)}
        activeOpacity={0.85}
        style={[
          styles.wordRowCard,
          {
            backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
            borderColor: cardBorder,
          },
        ]}
      >
        <View style={styles.wordRowLeft}>
          <TouchableOpacity
            onPress={() => onPlayPronunciation(item.word)}
            style={[
              styles.wordRowAudio,
              { backgroundColor: darkMode ? '#334155' : '#fef3e2' },
            ]}
          >
            <Volume2 size={16} color={Colors.accentGold} />
          </TouchableOpacity>

          <View>
            <View style={styles.wordRowHeader}>
              <Text
                style={[
                  styles.wordRowTitle,
                  { color: darkMode ? '#fbbf24' : Colors.accentOrange },
                ]}
              >
                {item.word}
              </Text>
              {item.partOfSpeech ? (
                <View
                  style={[
                    styles.rowTag,
                    { backgroundColor: darkMode ? '#334155' : '#e2e8f0' },
                  ]}
                >
                  <Text
                    style={[styles.rowTagText, { color: textSecondary }]}
                  >
                    {item.partOfSpeech}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[
                styles.wordRowTr,
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

export const ListDetailModal: React.FC<ListDetailModalProps> = ({
  list,
  isOpen,
  onClose,
  onSelectWord,
  onToggleFavorite,
  onUpdateListMastery,
  onDeleteList,
  onClearList,
  onWordMastered,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionScore, setSessionScore] = useState({ mastered: 0, review: 0 });

  const words = useMemo(() => {
    const raw = list?.words || [];
    const seen = new Set<string>();
    return raw.filter((w) => {
      if (!w || !w.id) return false;
      if (seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });
  }, [list?.words]);

  const filteredWords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return words;
    return words.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.translation.toLowerCase().includes(q)
    );
  }, [words, searchQuery]);

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

  const renderWordItem = useCallback(
    ({ item }: { item: Word }) => (
      <WordRowItem
        item={item}
        darkMode={darkMode}
        cardBorder={theme.cardBorder}
        textSecondary={theme.textSecondary}
        onSelectWord={handleSelectWord}
        onPlayPronunciation={handlePlayPronunciation}
        onToggleFavorite={handleToggleFavorite}
      />
    ),
    [
      darkMode,
      theme.cardBorder,
      theme.textSecondary,
      handleSelectWord,
      handlePlayPronunciation,
      handleToggleFavorite,
    ]
  );

  if (!isOpen || !list) return null;

  const startFlashcards = () => {
    if (words.length === 0) return;
    HapticsService.selection();
    setStudyMode(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionScore({ mastered: 0, review: 0 });
  };

  const handleNextCard = (mastered: boolean) => {
    if (mastered) {
      HapticsService.success();
      setSessionScore((prev) => ({ ...prev, mastered: prev.mastered + 1 }));
      onUpdateListMastery(list.id, 2);
      if (onWordMastered) {
        onWordMastered();
      }
    } else {
      HapticsService.light();
      setSessionScore((prev) => ({ ...prev, review: prev.review + 1 }));
    }

    if (currentCardIndex < words.length - 1) {
      setIsFlipped(false);
      setCurrentCardIndex((prev) => prev + 1);
    }
  };

  const handleClearList = () => {
    HapticsService.light();
    Alert.alert(
      'Listeyi Temizle / Sıfırla',
      `"${list.title}" listesindeki tüm kelimeler temizlenecek ve hakimiyet %0 yapılacaktır. Emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: () => {
            HapticsService.medium();
            if (onClearList) onClearList(list.id);
            setStudyMode(false);
          },
        },
      ]
    );
  };

  const isSessionComplete =
    currentCardIndex >= words.length - 1 &&
    sessionScore.mastered + sessionScore.review === words.length;

  const currentWord = words[currentCardIndex];

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff' }]}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: theme.cardBorder }]}>
            <View style={styles.headerLeft}>
              {studyMode && (
                <TouchableOpacity
                  onPress={() => setStudyMode(false)}
                  style={styles.backArrowBtn}
                >
                  <ArrowLeft size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              )}
              <View>
                <Text style={[styles.listTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                  {list.title}
                </Text>
                <Text style={[styles.listSubtitle, { color: theme.textMuted }]}>
                  {words.length} Kelime • %{list.mastery} Hakimiyet
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              {words.length > 0 && onClearList && !studyMode && (
                <TouchableOpacity
                  onPress={handleClearList}
                  style={styles.trashBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <RotateCw size={18} color="#f59e0b" />
                </TouchableOpacity>
              )}
              {onDeleteList && !studyMode && list.id !== 'favorites' && list.id !== 'review' && list.id !== 'struggle' && (
                <TouchableOpacity
                  onPress={() => {
                    onDeleteList(list.id);
                    setStudyMode(false);
                    onClose();
                  }}
                  style={styles.trashBtn}
                >
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  setStudyMode(false);
                  onClose();
                }}
                style={styles.closeBtn}
              >
                <X size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Body Content */}
          {studyMode ? (
            /* Flashcard Study Mode */
            <View style={styles.studyContainer}>
              {/* Progress Count */}
              <View style={styles.studyProgressRow}>
                <Text style={[styles.studyProgressText, { color: theme.textSecondary }]}>
                  Kart {currentCardIndex + 1} / {words.length}
                </Text>
                <Text style={[styles.studyProgressText, { color: '#10b981' }]}>
                  Öğrenilen: {sessionScore.mastered}
                </Text>
              </View>

              {/* Flashcard Tile */}
              {currentWord ? (
                <TouchableOpacity
                  onPress={() => {
                    HapticsService.selection();
                    setIsFlipped(!isFlipped);
                  }}
                  activeOpacity={0.9}
                  style={[
                    styles.flashcard,
                    {
                      backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
                      borderColor: darkMode ? '#334155' : Colors.primary,
                    },
                  ]}
                >
                  {!isFlipped ? (
                    /* Front: English */
                    <View style={styles.cardContent}>
                      <View style={[styles.cardLevelBadge, { backgroundColor: darkMode ? '#334155' : '#d8ebee' }]}>
                        <Text style={[styles.cardLevelText, { color: darkMode ? Colors.primaryAccent : Colors.primaryDark }]}>
                          {currentWord.partOfSpeech} • Seviye {currentWord.level}
                        </Text>
                      </View>

                      <Text style={[styles.cardFrontWord, { color: darkMode ? '#fbbf24' : Colors.accentOrange }]}>
                        {currentWord.word}
                      </Text>
                      <Text style={[styles.cardPhonetic, { color: theme.textMuted }]}>
                        {currentWord.phonetic}
                      </Text>

                      <TouchableOpacity
                        onPress={() => {
                          HapticsService.light();
                          playPronunciation(currentWord.word);
                        }}
                        style={[styles.cardSpeakerBtn, { backgroundColor: Colors.accentGold }]}
                      >
                        <Volume2 size={16} color="#ffffff" />
                        <Text style={styles.cardSpeakerText}>Dinle</Text>
                      </TouchableOpacity>

                      <Text style={[styles.flipHint, { color: theme.textMuted }]}>
                        (Türkçe anlamı görmek için dokunun)
                      </Text>
                    </View>
                  ) : (
                    /* Back: Turkish */
                    <View style={styles.cardContent}>
                      <Text style={[styles.transTag, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                        TÜRKÇE ANLAMI
                      </Text>
                      <Text style={[styles.cardBackWord, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                        {currentWord.translation}
                      </Text>
                      {currentWord.example ? (
                        <Text style={[styles.cardExample, { color: theme.textSecondary }]}>
                          "{currentWord.example}"
                        </Text>
                      ) : null}
                      <Text style={[styles.flipHint, { color: theme.textMuted }]}>
                        (İngilizceye dönmek için dokunun)
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ) : null}

              {/* Study Action Buttons (Review / Mastered) */}
              <View style={styles.studyActions}>
                <TouchableOpacity
                  onPress={() => handleNextCard(false)}
                  style={[styles.reviewBtn, { backgroundColor: darkMode ? '#334155' : '#e2e8f0' }]}
                >
                  <RotateCcw size={16} color={theme.textPrimary} />
                  <Text style={[styles.reviewBtnText, { color: theme.textPrimary }]}>Tekrar Et</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleNextCard(true)}
                  style={[styles.masteredBtn, { backgroundColor: Colors.primary }]}
                >
                  <CheckCircle2 size={16} color="#ffffff" />
                  <Text style={styles.masteredBtnText}>Öğrenildi</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Standard Word List Table */
            <View style={styles.listContainer}>
              {/* Action Top Bar */}
              <View style={styles.listActionsBar}>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Listedeki kelimeleri filtrele..."
                  placeholderTextColor={darkMode ? '#64748b' : '#94a3b8'}
                  style={[
                    styles.listFilterInput,
                    {
                      backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
                      borderColor: theme.cardBorder,
                      color: theme.textPrimary,
                    },
                  ]}
                />

                <TouchableOpacity
                  onPress={startFlashcards}
                  disabled={words.length === 0}
                  style={[
                    styles.startFlashcardsBtn,
                    {
                      backgroundColor: words.length > 0 ? Colors.primary : '#94a3b8',
                    },
                  ]}
                >
                  <Play size={14} color="#ffffff" fill="#ffffff" />
                  <Text style={styles.startFlashcardsText}>Kartlarla Çalış</Text>
                </TouchableOpacity>
              </View>

              {/* Words FlatList */}
              <FlatList
                data={filteredWords}
                keyExtractor={keyExtractor}
                renderItem={renderWordItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.wordsScrollList}
                initialNumToRender={12}
                maxToRenderPerBatch={10}
                windowSize={5}
                updateCellsBatchingPeriod={50}
                removeClippedSubviews={Platform.OS === 'android'}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backArrowBtn: {
    padding: 4,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  listSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trashBtn: {
    padding: 6,
  },
  closeBtn: {
    padding: 6,
  },
  studyContainer: {
    flex: 1,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  studyProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  studyProgressText: {
    fontSize: 12,
    fontWeight: '800',
  },
  flashcard: {
    borderRadius: 28,
    borderWidth: 2,
    minHeight: 250,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLevelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  cardLevelText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardFrontWord: {
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardPhonetic: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 16,
  },
  cardSpeakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardSpeakerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  transTag: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardBackWord: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
  },
  cardExample: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  flipHint: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  studyActions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 10,
  },
  reviewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
  },
  reviewBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  masteredBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
  },
  masteredBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  listContainer: {
    flex: 1,
    paddingTop: 12,
  },
  listActionsBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  listFilterInput: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '700',
  },
  startFlashcardsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  startFlashcardsText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  wordsScrollList: {
    gap: 8,
    paddingBottom: 24,
  },
  wordRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  wordRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  wordRowAudio: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wordRowTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  rowTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  rowTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  wordRowTr: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  favBtn: {
    padding: 6,
  },
});
