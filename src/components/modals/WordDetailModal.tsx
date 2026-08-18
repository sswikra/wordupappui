import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { X, Volume2, Heart, Plus, Check, Sparkles, BookOpen, Layers, Trash2 } from 'lucide-react-native';
import { Word, WordList } from '../../types';
import { playPronunciation } from '../../utils/speech';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';

interface WordDetailModalProps {
  word: Word | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (wordId: string) => void;
  userLists: WordList[];
  onAddWordToList: (wordId: string, listId: string) => void;
  onDeleteWord?: (wordId: string) => void;
  darkMode?: boolean;
}

const { width, height } = Dimensions.get('window');

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  word,
  isOpen,
  onClose,
  onToggleFavorite,
  userLists,
  onAddWordToList,
  onDeleteWord,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);
  const [showAddToListDropdown, setShowAddToListDropdown] = useState(false);
  const [addedToListSuccess, setAddedToListSuccess] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizRevealed, setQuizRevealed] = useState(false);

  if (!isOpen || !word) return null;

  const handlePronounce = () => {
    HapticsService.light();
    playPronunciation(word.word);
  };

  const handleListSelect = (listId: string) => {
    HapticsService.selection();
    onAddWordToList(word.id, listId);
    setAddedToListSuccess(listId);
    setTimeout(() => {
      setAddedToListSuccess(null);
      setShowAddToListDropdown(false);
    }, 1200);
  };

  const handleDeleteWord = () => {
    Alert.alert(
      'Kelimeyi Sil',
      `"${word.word}" kelimesini silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            HapticsService.medium();
            if (onDeleteWord) {
              onDeleteWord(word.id);
            }
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff' }]}>
          {/* Header Controls */}
          <View style={[styles.headerRow, { borderBottomColor: theme.cardBorder }]}>
            <View style={styles.badgeGroup}>
              <View style={[styles.posBadge, { backgroundColor: darkMode ? '#334155' : '#d8ebee' }]}>
                <Text style={[styles.posText, { color: darkMode ? Colors.primaryAccent : Colors.primaryDark }]}>
                  {word.partOfSpeech}
                </Text>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: darkMode ? '#334155' : '#fef3e2' }]}>
                <Text style={[styles.levelText, { color: darkMode ? '#fcd34d' : '#92400e' }]}>
                  Seviye {word.level}
                </Text>
              </View>
            </View>

            <View style={styles.actionBtns}>
              {onDeleteWord && (
                <TouchableOpacity
                  onPress={handleDeleteWord}
                  style={[
                    styles.circleBtn,
                    {
                      backgroundColor: darkMode ? '#334155' : '#fee2e2',
                    },
                  ]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {
                  HapticsService.selection();
                  onToggleFavorite(word.id);
                }}
                style={[
                  styles.circleBtn,
                  {
                    backgroundColor: word.isFavorite
                      ? '#ffe4e6'
                      : darkMode
                      ? '#334155'
                      : '#f1f5f9',
                  },
                ]}
              >
                <Heart
                  size={18}
                  color="#ef4444"
                  fill={word.isFavorite ? '#ef4444' : 'transparent'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={[styles.circleBtn, { backgroundColor: darkMode ? '#334155' : '#f1f5f9' }]}
              >
                <X size={18} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Word Heading & Pronunciation */}
            <View style={styles.wordHeadingSection}>
              <View style={styles.wordTitleRow}>
                <Text style={[styles.wordTitle, { color: darkMode ? '#fbbf24' : Colors.accentOrange }]}>
                  {word.word}
                </Text>
                <TouchableOpacity
                  onPress={handlePronounce}
                  style={[styles.speakerBtn, { backgroundColor: Colors.accentGold }]}
                  activeOpacity={0.8}
                >
                  <Volume2 size={18} color="#ffffff" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.phoneticText, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                {word.phonetic}
              </Text>
            </View>

            {/* Quiz Mode / Flashcard Reveal */}
            {quizMode ? (
              <TouchableOpacity
                onPress={() => setQuizRevealed(!quizRevealed)}
                activeOpacity={0.9}
                style={[
                  styles.quizCard,
                  {
                    backgroundColor: quizRevealed
                      ? darkMode
                        ? '#334155'
                        : '#ecfdf5'
                      : darkMode
                      ? '#1e293b'
                      : '#fffbeb',
                    borderColor: quizRevealed ? '#10b981' : '#f59e0b',
                  },
                ]}
              >
                <Sparkles size={20} color={quizRevealed ? '#10b981' : '#f59e0b'} />
                <Text style={[styles.quizTitle, { color: quizRevealed ? '#065f46' : '#92400e' }]}>
                  {quizRevealed ? word.translation : 'Türkçe anlamını görmek için dokunun'}
                </Text>
              </TouchableOpacity>
            ) : (
              /* Translation Card */
              <View style={[styles.translationBox, { backgroundColor: darkMode ? '#334155' : '#eaf4ec', borderColor: darkMode ? '#475569' : '#cbe3d0' }]}>
                <Text style={[styles.transLabel, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                  TÜRKÇE ANLAMI
                </Text>
                <Text style={[styles.transValue, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                  {word.translation}
                </Text>
              </View>
            )}

            {/* Definition */}
            {word.definition && (
              <View style={styles.detailBlock}>
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>TANIM (DEFINITION)</Text>
                <Text style={[styles.detailText, { color: theme.textPrimary }]}>
                  {word.definition}
                </Text>
              </View>
            )}

            {/* Example Sentence */}
            {word.example && (
              <View style={[styles.exampleBlock, { backgroundColor: darkMode ? '#334155' : '#f8fafc', borderColor: theme.cardBorder }]}>
                <Text style={[styles.exampleEn, { color: theme.textPrimary }]}>
                  "{word.example}"
                </Text>
                {word.exampleTranslation && (
                  <Text style={[styles.exampleTr, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                    "{word.exampleTranslation}"
                  </Text>
                )}
              </View>
            )}

            {/* Synonyms */}
            {word.synonyms && word.synonyms.length > 0 && (
              <View style={styles.synonymsSection}>
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>EŞ ANLAMLILAR (SYNONYMS)</Text>
                <View style={styles.synonymsWrap}>
                  {word.synonyms.map((s, i) => (
                    <View key={i} style={[styles.synChip, { backgroundColor: darkMode ? '#334155' : '#e2e8f0' }]}>
                      <Text style={[styles.synText, { color: theme.textPrimary }]}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Add to Custom List Section */}
            <View style={styles.addToListSection}>
              <TouchableOpacity
                onPress={() => setShowAddToListDropdown(!showAddToListDropdown)}
                style={[styles.addToListToggle, { backgroundColor: darkMode ? '#334155' : '#f1f5f9', borderColor: theme.cardBorder }]}
                activeOpacity={0.8}
              >
                <View style={styles.dropdownLeft}>
                  <Layers size={16} color={darkMode ? Colors.primaryAccent : Colors.primary} />
                  <Text style={[styles.dropdownLabel, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                    Listeye Ekle
                  </Text>
                </View>
                <Plus size={16} color={darkMode ? Colors.primaryAccent : Colors.primary} />
              </TouchableOpacity>

              {showAddToListDropdown && (
                <View style={[styles.listPickerCard, { backgroundColor: darkMode ? '#334155' : '#f8fafc', borderColor: theme.cardBorder }]}>
                  {userLists.map((l) => (
                    <TouchableOpacity
                      key={l.id}
                      onPress={() => handleListSelect(l.id)}
                      style={[styles.listPickerItem, { borderBottomColor: theme.cardBorder }]}
                    >
                      <Text style={[styles.pickerItemText, { color: theme.textPrimary }]}>
                        {l.title}
                      </Text>
                      {addedToListSuccess === l.id && (
                        <Check size={16} color="#10b981" strokeWidth={2.4} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
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
    maxHeight: height * 0.88,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
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
  badgeGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  posBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  posText: {
    fontSize: 11,
    fontWeight: '800',
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyScroll: {
    paddingVertical: 12,
  },
  wordHeadingSection: {
    alignItems: 'center',
    marginBottom: 14,
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wordTitle: {
    fontSize: 32,
    fontWeight: '900',
  },
  speakerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneticText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  translationBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  transLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  transValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  quizCard: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  quizTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  detailBlock: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  exampleBlock: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  exampleEn: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 4,
  },
  exampleTr: {
    fontSize: 12,
    fontWeight: '700',
  },
  synonymsSection: {
    marginBottom: 14,
  },
  synonymsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  synChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  synText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addToListSection: {
    marginVertical: 10,
    paddingBottom: 20,
  },
  addToListToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  listPickerCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 6,
    overflow: 'hidden',
  },
  listPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  pickerItemText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
