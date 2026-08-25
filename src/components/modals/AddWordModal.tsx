import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X, Plus, Sparkles, Check } from 'lucide-react-native';
import { Word, PartOfSpeech, CEFRLevel, WordList } from '../../types';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWord: (word: Word, listId?: string) => void;
  userLists: WordList[];
  darkMode?: boolean;
}

const { height } = Dimensions.get('window');

export const AddWordModal: React.FC<AddWordModalProps> = ({
  isOpen,
  onClose,
  onAddWord,
  userLists,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);
  const [word, setWord] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [translation, setTranslation] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('Noun');
  const [level, setLevel] = useState<CEFRLevel>('B1');
  const [example, setExample] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [selectedListId, setSelectedListId] = useState<string>(userLists[0]?.id || 'favorites');

  if (!isOpen) return null;

  const partOfSpeechOptions: PartOfSpeech[] = ['Noun', 'Verb', 'Adj.', 'Adv.', 'Phrase', 'Idiom'];
  const levelOptions: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const handleSubmit = () => {
    if (!word.trim() || !translation.trim()) {
      HapticsService.error();
      return;
    }

    HapticsService.success();
    const newWord: Word = {
      id: `w-custom-${Date.now()}`,
      word: word.trim(),
      phonetic: phonetic.trim() || `/${word.trim().toLowerCase()}/`,
      partOfSpeech,
      level,
      translation: translation.trim(),
      definition: `${word.trim()} in Turkish is ${translation.trim()}`,
      example: example.trim() || `Learning the word ${word.trim()} everyday.`,
      exampleTranslation: exampleTranslation.trim() || `Her gün ${word.trim()} kelimesini öğreniyorum.`,
      isFavorite: false,
      mastery: 0,
      lists: selectedListId ? [selectedListId] : [],
    };

    onAddWord(newWord, selectedListId);
    onClose();

    // Reset Form
    setWord('');
    setPhonetic('');
    setTranslation('');
    setExample('');
    setExampleTranslation('');
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff' }]}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: theme.cardBorder }]}>
            <View style={styles.headerTitleGroup}>
              <View style={[styles.plusIconCircle, { backgroundColor: darkMode ? '#334155' : '#d8ebee' }]}>
                <Plus size={18} color={darkMode ? Colors.primaryAccent : Colors.primary} strokeWidth={2.4} />
              </View>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                Özel Kelime Ekle
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Form Scroll */}
          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Word Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                İNGİLİZCE KELİME *
              </Text>
              <TextInput
                value={word}
                onChangeText={setWord}
                placeholder="Örn. Euphoria"
                placeholderTextColor={darkMode ? '#64748b' : '#94a3b8'}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
                    borderColor: theme.cardBorder,
                    color: theme.textPrimary,
                  },
                ]}
              />
            </View>

            {/* Translation Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                TÜRKÇE ANLAMI *
              </Text>
              <TextInput
                value={translation}
                onChangeText={setTranslation}
                placeholder="Örn. Coşku, aşırı sevinç"
                placeholderTextColor={darkMode ? '#64748b' : '#94a3b8'}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
                    borderColor: theme.cardBorder,
                    color: theme.textPrimary,
                  },
                ]}
              />
            </View>

            {/* Part of Speech Chips */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                SÖZCÜK TÜRÜ
              </Text>
              <View style={styles.chipsRow}>
                {partOfSpeechOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => {
                      HapticsService.selection();
                      setPartOfSpeech(opt);
                    }}
                    style={[
                      styles.chip,
                      partOfSpeech === opt
                        ? { backgroundColor: Colors.primary }
                        : { backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', borderColor: theme.cardBorder },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: partOfSpeech === opt ? '#ffffff' : theme.textPrimary },
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* CEFR Level Chips */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                CEFR SEVİYESİ
              </Text>
              <View style={styles.chipsRow}>
                {levelOptions.map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    onPress={() => {
                      HapticsService.selection();
                      setLevel(lvl);
                    }}
                    style={[
                      styles.chip,
                      level === lvl
                        ? { backgroundColor: Colors.primary }
                        : { backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', borderColor: theme.cardBorder },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: level === lvl ? '#ffffff' : theme.textPrimary },
                      ]}
                    >
                      {lvl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Target List Selector */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                LİSTEYE EKLE
              </Text>
              <View style={styles.chipsRow}>
                {(userLists || []).map((l) => (
                  <TouchableOpacity
                    key={l.id}
                    onPress={() => {
                      HapticsService.selection();
                      setSelectedListId(l.id);
                    }}
                    style={[
                      styles.listChip,
                      selectedListId === l.id
                        ? { backgroundColor: Colors.primary }
                        : { backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', borderColor: theme.cardBorder },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: selectedListId === l.id ? '#ffffff' : theme.textPrimary },
                      ]}
                    >
                      {l.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Example Sentence */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                ÖRNEK CÜMLE
              </Text>
              <TextInput
                value={example}
                onChangeText={setExample}
                placeholder="Örn. He experienced sudden euphoria after winning."
                placeholderTextColor={darkMode ? '#64748b' : '#94a3b8'}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
                    borderColor: theme.cardBorder,
                    color: theme.textPrimary,
                  },
                ]}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              style={[styles.submitBtn, { backgroundColor: Colors.primary }]}
            >
              <Sparkles size={18} color="#ffffff" />
              <Text style={styles.submitBtnText}>Kelimeyi Kaydet</Text>
            </TouchableOpacity>
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
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  plusIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 6,
  },
  formScroll: {
    paddingVertical: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  listChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    marginTop: 10,
    marginBottom: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
