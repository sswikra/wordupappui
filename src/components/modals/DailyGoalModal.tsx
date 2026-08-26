// src/components/modals/DailyGoalModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Target, Sparkles, Check, Flame, Trophy, Zap, Sprout, X } from 'lucide-react-native';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';

interface DailyGoalModalProps {
  isOpen: boolean;
  currentGoal?: number;
  onSaveGoal: (goal: number) => void;
  onClose?: () => void;
  darkMode?: boolean;
  isFirstTime?: boolean;
}

export interface GoalOption {
  value: number;
  label: string;
  tag: string;
  desc: string;
  monthlyEstimate: string;
  icon: 'sprout' | 'zap' | 'flame' | 'trophy';
  highlightColor: string;
  bgColorLight: string;
  bgColorDark: string;
}

export const GOAL_OPTIONS: GoalOption[] = [
  {
    value: 5,
    label: '5 Kelime / Gün',
    tag: '🌱 Rahat',
    desc: 'Hafif ve stressiz bir başlangıç.',
    monthlyEstimate: '~150 kelime / ay',
    icon: 'sprout',
    highlightColor: '#10b981',
    bgColorLight: '#ecfdf5',
    bgColorDark: '#064e3b',
  },
  {
    value: 10,
    label: '10 Kelime / Gün',
    tag: '⚡ Standart (Önerilen)',
    desc: 'Dengeli ve sürdürülebilir düzenli ilerleme.',
    monthlyEstimate: '~300 kelime / ay',
    icon: 'zap',
    highlightColor: '#3b82f6',
    bgColorLight: '#eff6ff',
    bgColorDark: '#1e3a8a',
  },
  {
    value: 15,
    label: '15 Kelime / Gün',
    tag: '🔥 İddialı',
    desc: 'Hızlı ve etkili kelime gelişimi.',
    monthlyEstimate: '~450 kelime / ay',
    icon: 'flame',
    highlightColor: '#f97316',
    bgColorLight: '#fff7ed',
    bgColorDark: '#431407',
  },
  {
    value: 20,
    label: '20 Kelime / Gün',
    tag: '🏆 Şampiyon',
    desc: 'Yoğun ve tam odaklı kelime hakimiyeti.',
    monthlyEstimate: '~600 kelime / ay',
    icon: 'trophy',
    highlightColor: '#eab308',
    bgColorLight: '#fefce8',
    bgColorDark: '#422006',
  },
];

export const DailyGoalModal: React.FC<DailyGoalModalProps> = ({
  isOpen,
  currentGoal = 10,
  onSaveGoal,
  onClose,
  darkMode = false,
  isFirstTime = false,
}) => {
  const theme = getTheme(darkMode);
  const [selectedGoal, setSelectedGoal] = useState<number>(currentGoal || 10);

  useEffect(() => {
    if (isOpen) {
      setSelectedGoal(currentGoal || 10);
    }
  }, [isOpen, currentGoal]);

  const handleSelect = (val: number) => {
    HapticsService.selection();
    setSelectedGoal(val);
  };

  const handleConfirm = () => {
    HapticsService.success();
    onSaveGoal(selectedGoal);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              borderColor: theme.cardBorder,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: darkMode ? 'rgba(123, 169, 131, 0.2)' : '#e2eff2' },
                ]}
              >
                <Target size={22} color={darkMode ? Colors.primaryAccent : Colors.primary} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                  {isFirstTime ? 'Hoş Geldiniz! 🎉' : 'Günlük Kelime Hedefi'}
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  {isFirstTime
                    ? 'Günde kaç kelime öğrenmek istersiniz?'
                    : 'Öğrenme hızınıza uygun hedefi belirleyin.'}
                </Text>
              </View>
              {!isFirstTime && onClose && (
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeBtn, { backgroundColor: darkMode ? '#334155' : '#f1f5f9' }]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={18} color={theme.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Goal Options List */}
          <ScrollView
            style={styles.optionsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
          >
            {GOAL_OPTIONS.map((opt) => {
              const isSelected = selectedGoal === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => handleSelect(opt.value)}
                  activeOpacity={0.85}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isSelected
                        ? (darkMode ? opt.bgColorDark : opt.bgColorLight)
                        : (darkMode ? '#0f172a' : '#f8fafc'),
                      borderColor: isSelected
                        ? opt.highlightColor
                        : (darkMode ? '#334155' : '#e2e8f0'),
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.optionLeft}>
                    <View
                      style={[
                        styles.optionIconCircle,
                        {
                          backgroundColor: isSelected
                            ? opt.highlightColor
                            : (darkMode ? '#334155' : '#e2e8f0'),
                        },
                      ]}
                    >
                      {opt.icon === 'sprout' && (
                        <Sprout size={18} color={isSelected ? '#ffffff' : theme.textMuted} />
                      )}
                      {opt.icon === 'zap' && (
                        <Zap size={18} color={isSelected ? '#ffffff' : theme.textMuted} />
                      )}
                      {opt.icon === 'flame' && (
                        <Flame size={18} color={isSelected ? '#ffffff' : theme.textMuted} />
                      )}
                      {opt.icon === 'trophy' && (
                        <Trophy size={18} color={isSelected ? '#ffffff' : theme.textMuted} />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={styles.optionHeaderRow}>
                        <Text
                          style={[
                            styles.optionLabel,
                            {
                              color: isSelected
                                ? (darkMode ? '#ffffff' : '#0f172a')
                                : theme.textPrimary,
                              fontWeight: isSelected ? '800' : '700',
                            },
                          ]}
                        >
                          {opt.label}
                        </Text>
                        <View
                          style={[
                            styles.tagBadge,
                            {
                              backgroundColor: isSelected
                                ? opt.highlightColor
                                : (darkMode ? '#334155' : '#e2e8f0'),
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.tagBadgeText,
                              { color: isSelected ? '#ffffff' : theme.textSecondary },
                            ]}
                          >
                            {opt.tag}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                        {opt.desc}
                      </Text>

                      <Text
                        style={[
                          styles.estimateText,
                          { color: isSelected ? opt.highlightColor : theme.textMuted },
                        ]}
                      >
                        ⚡ {opt.monthlyEstimate}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? opt.highlightColor : theme.cardBorder,
                        backgroundColor: isSelected ? opt.highlightColor : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <Check size={13} color="#ffffff" strokeWidth={3.5} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.85}
            style={[styles.confirmBtn, { backgroundColor: Colors.primary }]}
          >
            <Sparkles size={18} color="#ffffff" />
            <Text style={styles.confirmBtnText}>
              {isFirstTime ? 'Hedefimi Kaydet & Başla' : 'Hedefi Güncelle'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsList: {
    maxHeight: 380,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  optionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  optionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 3,
  },
  optionLabel: {
    fontSize: 14,
  },
  tagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  optionDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 4,
  },
  estimateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
