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
import { X, FolderPlus } from 'lucide-react-native';
import { WordList } from '../../types';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateList: (list: WordList) => void;
  darkMode?: boolean;
}

const { height } = Dimensions.get('window');

export const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  onCreateList,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#345c43');

  if (!isOpen) return null;

  const colorOptions = ['#345c43', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'];

  const handleSubmit = () => {
    if (!title.trim()) {
      HapticsService.error();
      return;
    }

    HapticsService.success();
    const newList: WordList = {
      id: `list-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Özel kelime listesi.',
      icon: 'folder',
      color: selectedColor,
      count: 0,
      mastery: 0,
      words: [],
      isCustom: true,
    };

    onCreateList(newList);
    onClose();
    setTitle('');
    setDescription('');
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff' }]}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: theme.cardBorder }]}>
            <View style={styles.headerTitleGroup}>
              <View style={[styles.folderIconCircle, { backgroundColor: darkMode ? '#334155' : '#d8ebee' }]}>
                <FolderPlus size={18} color={darkMode ? Colors.primaryAccent : Colors.primary} strokeWidth={2.4} />
              </View>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                Yeni Liste Oluştur
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                LİSTE ADI *
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Örn. YDS / YÖKDİL Kelimeleri"
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

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                AÇIKLAMA
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Örn. Sınav için en kritik kelimeler"
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

            {/* Color Palette */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                RENK TEMASI
              </Text>
              <View style={styles.colorsRow}>
                {colorOptions.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => {
                      HapticsService.selection();
                      setSelectedColor(c);
                    }}
                    style={[
                      styles.colorBall,
                      { backgroundColor: c },
                      selectedColor === c && styles.selectedColorBall,
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              style={[styles.submitBtn, { backgroundColor: Colors.primary }]}
            >
              <Text style={styles.submitBtnText}>Liste Oluştur</Text>
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
    maxHeight: height * 0.75,
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
  folderIconCircle: {
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
    marginBottom: 16,
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
  colorsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  colorBall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  selectedColorBall: {
    borderWidth: 3,
    borderColor: '#ffffff',
    transform: [{ scale: 1.15 }],
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
