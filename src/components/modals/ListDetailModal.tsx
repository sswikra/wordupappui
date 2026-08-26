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
  Shuffle,
  Check,
  Layers,
  Award,
} from 'lucide-react-native';
import { WordList, Word } from '../../types';
import { playPronunciation } from '../../utils/speech';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';
import { searchWords } from '../../utils/search';

interface ListDetailModalProps {
  list: WordList | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectWord: (word: Word) => void;
  onToggleFavorite: (wordId: string) => void;
  onUpdateListMastery: (listId: string, delta: number) => void;
  onUpdateWordMastery?: (wordId: string, mastery: number) => void;
  onDeleteList?: (listId: string) => void;
  onClearList?: (listId: string) => void;
  onWordMastered?: () => void;
  darkMode?: boolean;
}

const { width, height } = Dimensions.get('window');

// Fisher-Yates Shuffle Algoritması
const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

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
    const isLearned = (item.mastery || 0) >= 100;

    return (
      <TouchableOpacity
        onPress={() => onSelectWord(item)}
        activeOpacity={0.85}
        style={[
          styles.wordRowCard,
          {
            backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
            borderColor: isLearned ? (darkMode ? 'rgba(16, 185, 129, 0.4)' : '#86efac') : cardBorder,
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

          <View style={styles.wordInfoWrap}>
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
              {isLearned && (
                <View
                  style={[
                    styles.learnedBadge,
                    { backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7' },
                  ]}
                >
                  <CheckCircle2 size={11} color="#10b981" />
                  <Text style={[styles.learnedBadgeText, { color: darkMode ? '#34d399' : '#15803d' }]}>
                    Öğrenildi
                  </Text>
                </View>
              )}
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
  onUpdateWordMastery,
  onDeleteList,
  onClearList,
  onWordMastered,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);

  // Çalışma ve Filtre Durumları
  const [studyMode, setStudyMode] = useState(false);
  const [studyWords, setStudyWords] = useState<Word[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionScore, setSessionScore] = useState({ mastered: 0, review: 0 });
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [reviewedWordIds, setReviewedWordIds] = useState<string[]>([]);

  // Kullanıcı Çalışma Ayarları (Öğrenilmemiş / Tümü / Öğrenilen & Karışık Sıra)
  const [studyFilter, setStudyFilter] = useState<'unlearned' | 'all' | 'learned'>('unlearned');
  const [isShuffled, setIsShuffled] = useState(true);

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

  const unlearnedCount = useMemo(() => {
    return words.filter((w) => (w.mastery || 0) < 100).length;
  }, [words]);

  const learnedCount = useMemo(() => {
    return words.filter((w) => (w.mastery || 0) >= 100).length;
  }, [words]);

  // Liste açıldığında veya değiştiğinde filtre tercihini otomatik ayarla
  useEffect(() => {
    if (unlearnedCount > 0) {
      setStudyFilter('unlearned');
    } else {
      setStudyFilter('all');
    }
  }, [list?.id, unlearnedCount]);

  const filteredWords = useMemo(() => {
    return searchWords(words, searchQuery);
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

  // Kart Çalışmasını Başlat
  const startFlashcards = (filter = studyFilter, shuffle = isShuffled) => {
    let pool: Word[] = [];

    if (filter === 'unlearned') {
      pool = words.filter((w) => (w.mastery || 0) < 100);
      if (pool.length === 0) {
        pool = words; // Tüm kelimeler öğrenildiyse tamamını aç
      }
    } else if (filter === 'learned') {
      pool = words.filter((w) => (w.mastery || 0) >= 100);
      if (pool.length === 0) {
        pool = words;
      }
    } else {
      pool = words;
    }

    if (pool.length === 0) return;

    const finalDeck = shuffle ? shuffleArray(pool) : [...pool];
    setStudyWords(finalDeck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionScore({ mastered: 0, review: 0 });
    setReviewedWordIds([]);
    setIsSessionFinished(false);
    setStudyMode(true);
    HapticsService.selection();
  };

  // Çalışma esnasında desteyi anında yeniden karıştır
  const handleReshuffleRemaining = () => {
    if (currentCardIndex >= studyWords.length - 1) return;
    HapticsService.medium();
    const past = studyWords.slice(0, currentCardIndex);
    const remaining = studyWords.slice(currentCardIndex);
    const shuffledRemaining = shuffleArray(remaining);
    setStudyWords([...past, ...shuffledRemaining]);
    setIsFlipped(false);
  };

  // Kart Cevaplama (Öğrenildi / Tekrar Et)
  const handleNextCard = (mastered: boolean) => {
    const currentWord = studyWords[currentCardIndex];
    if (!currentWord) return;

    if (mastered) {
      HapticsService.success();
      setSessionScore((prev) => ({ ...prev, mastered: prev.mastered + 1 }));

      // Kelimeyi kalıcı olarak öğrenildi olarak işaretle
      if (onUpdateWordMastery) {
        onUpdateWordMastery(currentWord.id, 100);
      }
      if (onWordMastered) {
        onWordMastered();
      }
    } else {
      HapticsService.light();
      setSessionScore((prev) => ({ ...prev, review: prev.review + 1 }));
      setReviewedWordIds((prev) => (prev.includes(currentWord.id) ? prev : [...prev, currentWord.id]));

      // Kelime tekrar edilecek olarak güncellenir
      if (onUpdateWordMastery) {
        onUpdateWordMastery(currentWord.id, 0);
      }
    }

    if (currentCardIndex < studyWords.length - 1) {
      setIsFlipped(false);
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      // Oturum Tamamlandı
      HapticsService.success();
      setIsSessionFinished(true);
    }
  };

  // Tekrar Edilecekleri Yeniden Başlat
  const handleStudyReviewedWordsOnly = () => {
    const pool = words.filter((w) => reviewedWordIds.includes(w.id) || (w.mastery || 0) < 100);
    if (pool.length === 0) {
      startFlashcards('all', isShuffled);
      return;
    }
    const finalDeck = isShuffled ? shuffleArray(pool) : pool;
    setStudyWords(finalDeck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionScore({ mastered: 0, review: 0 });
    setReviewedWordIds([]);
    setIsSessionFinished(false);
    HapticsService.selection();
  };

  const handleClearList = () => {
    HapticsService.light();
    Alert.alert(
      'Listeyi Temizle / Sıfırla',
      `"${list.title}" listesindeki tüm kelime ilerlemeleri ve hakimiyet sıfırlanacaktır. Emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sıfırla',
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

  const currentWord = studyWords[currentCardIndex];

  // Aktif filtreye göre çalışılacak kelime sayısı
  const getFilterCardCount = () => {
    if (studyFilter === 'unlearned') return unlearnedCount || words.length;
    if (studyFilter === 'learned') return learnedCount || words.length;
    return words.length;
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff' }]}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: theme.cardBorder }]}>
            <View style={styles.headerLeft}>
              {studyMode && (
                <TouchableOpacity
                  onPress={() => {
                    setStudyMode(false);
                    setIsSessionFinished(false);
                  }}
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
                  {words.length} Kelime • {learnedCount} Öğrenildi • %{Math.round(list.mastery || 0)} Hakimiyet
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              {studyMode && !isSessionFinished && studyWords.length > 1 && (
                <TouchableOpacity
                  onPress={handleReshuffleRemaining}
                  style={[styles.headerIconBtn, { backgroundColor: darkMode ? '#334155' : '#f1f5f9' }]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Shuffle size={16} color={theme.textPrimary} />
                </TouchableOpacity>
              )}

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
                  setIsSessionFinished(false);
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
            isSessionFinished ? (
              /* Session Completed Congratulations View */
              <View style={styles.completionContainer}>
                <View style={styles.completionHeader}>
                  <View style={[styles.trophyRing, { backgroundColor: darkMode ? '#334155' : '#fef3c7' }]}>
                    <Award size={48} color="#f59e0b" />
                  </View>
                  <Text style={[styles.completionTitle, { color: theme.textPrimary }]}>
                    Harika İş Çıkardın! 🎉
                  </Text>
                  <Text style={[styles.completionSubtitle, { color: theme.textSecondary }]}>
                    "{list.title}" listesi için çalışma oturumunu tamamladınız.
                  </Text>
                </View>

                {/* Session Stats Grid */}
                <View style={[styles.statsSummaryCard, { backgroundColor: darkMode ? '#0f172a' : '#f8fafc', borderColor: theme.cardBorder }]}>
                  <View style={styles.statSummaryCol}>
                    <Text style={[styles.statSummaryVal, { color: Colors.primaryAccent }]}>
                      {studyWords.length}
                    </Text>
                    <Text style={[styles.statSummaryLabel, { color: theme.textMuted }]}>
                      Çalışılan
                    </Text>
                  </View>

                  <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />

                  <View style={styles.statSummaryCol}>
                    <Text style={[styles.statSummaryVal, { color: '#10b981' }]}>
                      {sessionScore.mastered}
                    </Text>
                    <Text style={[styles.statSummaryLabel, { color: theme.textMuted }]}>
                      Öğrenildi
                    </Text>
                  </View>

                  <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />

                  <View style={styles.statSummaryCol}>
                    <Text style={[styles.statSummaryVal, { color: '#f59e0b' }]}>
                      {sessionScore.review}
                    </Text>
                    <Text style={[styles.statSummaryLabel, { color: theme.textMuted }]}>
                      Tekrar
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.completionActions}>
                  {sessionScore.review > 0 && (
                    <TouchableOpacity
                      onPress={handleStudyReviewedWordsOnly}
                      activeOpacity={0.85}
                      style={[styles.completionPrimaryBtn, { backgroundColor: '#c85a32' }]}
                    >
                      <RotateCcw size={16} color="#ffffff" />
                      <Text style={styles.completionPrimaryBtnText}>
                        Tekrar Edilecekleri Çalış ({sessionScore.review})
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => startFlashcards('all', true)}
                    activeOpacity={0.85}
                    style={[styles.completionPrimaryBtn, { backgroundColor: Colors.primary }]}
                  >
                    <Shuffle size={16} color="#ffffff" />
                    <Text style={styles.completionPrimaryBtnText}>
                      Tümünü Karışık Yeniden Çalış
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setStudyMode(false);
                      setIsSessionFinished(false);
                    }}
                    activeOpacity={0.85}
                    style={[styles.completionSecondaryBtn, { backgroundColor: darkMode ? '#334155' : '#e2e8f0' }]}
                  >
                    <Text style={[styles.completionSecondaryBtnText, { color: theme.textPrimary }]}>
                      Listeye Geri Dön
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Flashcard Study Mode */
              <View style={styles.studyContainer}>
                {/* Progress Count & Progress Bar */}
                <View style={styles.studyProgressWrap}>
                  <View style={styles.studyProgressRow}>
                    <Text style={[styles.studyProgressText, { color: theme.textSecondary }]}>
                      Kart {currentCardIndex + 1} / {studyWords.length}
                    </Text>
                    <View style={styles.studyScorePills}>
                      <Text style={[styles.studyScorePill, { color: '#10b981' }]}>
                        ✓ {sessionScore.mastered} Öğrenildi
                      </Text>
                      {sessionScore.review > 0 && (
                        <Text style={[styles.studyScorePill, { color: '#f59e0b' }]}>
                          🔄 {sessionScore.review} Tekrar
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={[styles.miniProgressTrack, { backgroundColor: darkMode ? '#334155' : '#e2e8f0' }]}>
                    <View
                      style={[
                        styles.miniProgressBar,
                        {
                          width: `${Math.round(((currentCardIndex + 1) / studyWords.length) * 100)}%`,
                          backgroundColor: Colors.primary,
                        },
                      ]}
                    />
                  </View>
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
                        borderColor: isFlipped
                          ? (darkMode ? '#10b981' : '#345c43')
                          : (darkMode ? '#334155' : Colors.primary),
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
                        {currentWord.exampleTranslation ? (
                          <Text style={[styles.cardExampleTr, { color: darkMode ? '#94a3b8' : '#64748b' }]}>
                            "{currentWord.exampleTranslation}"
                          </Text>
                        ) : null}
                        <Text style={[styles.flipHint, { color: theme.textMuted }]}>
                          (İngilizceye dönmek için dokunun)
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ) : null}

                {/* Study Action Buttons (Tekrar Et / Öğrenildi) */}
                <View style={styles.studyActions}>
                  <TouchableOpacity
                    onPress={() => handleNextCard(false)}
                    style={[styles.reviewBtn, { backgroundColor: darkMode ? '#334155' : '#e2e8f0' }]}
                    activeOpacity={0.8}
                  >
                    <RotateCcw size={16} color={theme.textPrimary} />
                    <Text style={[styles.reviewBtnText, { color: theme.textPrimary }]}>Tekrar Et</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleNextCard(true)}
                    style={[styles.masteredBtn, { backgroundColor: Colors.primary }]}
                    activeOpacity={0.8}
                  >
                    <CheckCircle2 size={16} color="#ffffff" />
                    <Text style={styles.masteredBtnText}>Öğrenildi</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          ) : (
            /* Standard Word List Table & Study Options */
            <View style={styles.listContainer}>
              {/* Study Scope & Options Bar */}
              <View style={[styles.studyOptionsCard, { backgroundColor: darkMode ? '#0f172a' : '#f8fafc', borderColor: theme.cardBorder }]}>
                {/* Filter Scope Chips */}
                <View style={styles.scopeChipsRow}>
                  <TouchableOpacity
                    onPress={() => {
                      HapticsService.selection();
                      setStudyFilter('unlearned');
                    }}
                    style={[
                      styles.scopeChip,
                      studyFilter === 'unlearned' && [
                        styles.activeScopeChip,
                        { backgroundColor: darkMode ? '#345c43' : '#dcfce7', borderColor: '#10b981' },
                      ],
                      { borderColor: theme.cardBorder },
                    ]}
                  >
                    <Text
                      style={[
                        styles.scopeChipText,
                        {
                          color: studyFilter === 'unlearned'
                            ? (darkMode ? '#86efac' : '#15803d')
                            : theme.textSecondary,
                          fontWeight: studyFilter === 'unlearned' ? '900' : '700',
                        },
                      ]}
                    >
                      ⚡ Öğrenilmemiş ({unlearnedCount})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      HapticsService.selection();
                      setStudyFilter('all');
                    }}
                    style={[
                      styles.scopeChip,
                      studyFilter === 'all' && [
                        styles.activeScopeChip,
                        { backgroundColor: darkMode ? '#334155' : '#e0f2fe', borderColor: '#38bdf8' },
                      ],
                      { borderColor: theme.cardBorder },
                    ]}
                  >
                    <Text
                      style={[
                        styles.scopeChipText,
                        {
                          color: studyFilter === 'all'
                            ? (darkMode ? '#7dd3fc' : '#0369a1')
                            : theme.textSecondary,
                          fontWeight: studyFilter === 'all' ? '900' : '700',
                        },
                      ]}
                    >
                      📚 Tümü ({words.length})
                    </Text>
                  </TouchableOpacity>

                  {learnedCount > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        HapticsService.selection();
                        setStudyFilter('learned');
                      }}
                      style={[
                        styles.scopeChip,
                        studyFilter === 'learned' && [
                          styles.activeScopeChip,
                          { backgroundColor: darkMode ? '#451a03' : '#fef3c7', borderColor: '#f59e0b' },
                        ],
                        { borderColor: theme.cardBorder },
                      ]}
                    >
                      <Text
                        style={[
                          styles.scopeChipText,
                          {
                            color: studyFilter === 'learned'
                              ? (darkMode ? '#fcd34d' : '#b45309')
                              : theme.textSecondary,
                            fontWeight: studyFilter === 'learned' ? '900' : '700',
                          },
                        ]}
                      >
                        ✓ Öğrenilen ({learnedCount})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Shuffle & Start Controls */}
                <View style={styles.launchControlsRow}>
                  {/* Shuffle Toggle Button */}
                  <TouchableOpacity
                    onPress={() => {
                      HapticsService.selection();
                      setIsShuffled(!isShuffled);
                    }}
                    activeOpacity={0.8}
                    style={[
                      styles.shuffleToggleBtn,
                      {
                        backgroundColor: isShuffled
                          ? (darkMode ? '#334155' : '#e2e8f0')
                          : (darkMode ? '#1e293b' : '#f1f5f9'),
                        borderColor: isShuffled ? Colors.primary : theme.cardBorder,
                      },
                    ]}
                  >
                    <Shuffle
                      size={14}
                      color={isShuffled ? (darkMode ? '#fbbf24' : Colors.accentOrange) : theme.textMuted}
                    />
                    <Text
                      style={[
                        styles.shuffleToggleText,
                        {
                          color: isShuffled
                            ? (darkMode ? '#fbbf24' : Colors.accentOrange)
                            : theme.textMuted,
                          fontWeight: isShuffled ? '800' : '600',
                        },
                      ]}
                    >
                      {isShuffled ? 'Karışık Sıra' : 'Normal Sıra'}
                    </Text>
                  </TouchableOpacity>

                  {/* Big Flashcards Launch Button */}
                  <TouchableOpacity
                    onPress={() => startFlashcards(studyFilter, isShuffled)}
                    disabled={words.length === 0}
                    activeOpacity={0.85}
                    style={[
                      styles.startFlashcardsBtn,
                      {
                        backgroundColor: words.length > 0 ? Colors.primary : '#94a3b8',
                      },
                    ]}
                  >
                    <Play size={15} color="#ffffff" fill="#ffffff" />
                    <Text style={styles.startFlashcardsText}>
                      Kartlarla Çalış ({getFilterCardCount()})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Filter Input */}
              <View style={styles.listActionsBar}>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Listedeki kelimeleri ara..."
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
                ListEmptyComponent={
                  <View style={styles.emptyListWrap}>
                    <Text style={[styles.emptyListText, { color: theme.textMuted }]}>
                      {searchQuery ? 'Aramanızla eşleşen kelime bulunamadı.' : 'Bu listede henüz kelime yok.'}
                    </Text>
                  </View>
                }
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
    height: height * 0.9,
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
  headerIconBtn: {
    padding: 6,
    borderRadius: 12,
  },
  trashBtn: {
    padding: 6,
  },
  closeBtn: {
    padding: 6,
  },
  studyContainer: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  studyProgressWrap: {
    marginBottom: 8,
  },
  studyProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  studyProgressText: {
    fontSize: 12,
    fontWeight: '800',
  },
  studyScorePills: {
    flexDirection: 'row',
    gap: 8,
  },
  studyScorePill: {
    fontSize: 12,
    fontWeight: '800',
  },
  miniProgressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  flashcard: {
    borderRadius: 28,
    borderWidth: 2,
    minHeight: 250,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
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
    marginBottom: 12,
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
    marginBottom: 14,
  },
  cardSpeakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 14,
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
    marginBottom: 4,
    paddingHorizontal: 10,
  },
  cardExampleTr: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 12,
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
    paddingBottom: 6,
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
  completionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 6,
  },
  completionHeader: {
    alignItems: 'center',
    marginTop: 10,
  },
  trophyRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  completionTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  completionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statsSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 22,
    borderWidth: 1,
    marginVertical: 16,
  },
  statSummaryCol: {
    alignItems: 'center',
    flex: 1,
  },
  statSummaryVal: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  statSummaryLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  completionActions: {
    gap: 10,
  },
  completionPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completionPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  completionSecondaryBtn: {
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  listContainer: {
    flex: 1,
    paddingTop: 10,
  },
  studyOptionsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  scopeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  scopeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  activeScopeChip: {
    borderWidth: 1.5,
  },
  scopeChipText: {
    fontSize: 11,
  },
  launchControlsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  shuffleToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  shuffleToggleText: {
    fontSize: 11,
  },
  startFlashcardsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  startFlashcardsText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  listActionsBar: {
    marginBottom: 10,
  },
  listFilterInput: {
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '700',
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
  wordInfoWrap: {
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
    flexWrap: 'wrap',
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
  learnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  learnedBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  wordRowTr: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  favBtn: {
    padding: 6,
  },
  emptyListWrap: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
