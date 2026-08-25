import * as Haptics from 'expo-haptics';

export const HapticsService = {
  light() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
  },
  medium() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {}
  },
  heavy() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    } catch {}
  },
  success() {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {}
  },
  error() {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } catch {}
  },
  selection() {
    try {
      Haptics.selectionAsync().catch(() => {});
    } catch {}
  },
};

