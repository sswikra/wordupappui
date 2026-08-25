// src/utils/streakManager.ts
import { UserProfile, AppSettings, Badge } from '../types';

/**
 * Yerel saat dilimine göre YYYY-MM-DD formatında bugünün tarihini döner.
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Yerel saat dilimine göre YYYY-MM-DD formatında dünün tarihini döner.
 */
export const getYesterdayDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Bugünün Türkçe gün kısaltmasını döner: 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'
 */
export const getTurkishDayName = (date: Date = new Date()): string => {
  const dayIndex = date.getDay(); // 0 = Pazar, 1 = Pazartesi, ...
  const mapping = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  return mapping[dayIndex];
};

/**
 * Sıfır başlangıçlı 7 günlük aktivite listesi
 */
export const getEmptyWeeklyActivity = () => [
  { day: 'Pzt', count: 0, active: false },
  { day: 'Sal', count: 0, active: false },
  { day: 'Çar', count: 0, active: false },
  { day: 'Per', count: 0, active: false },
  { day: 'Cum', count: 0, active: false },
  { day: 'Cmt', count: 0, active: false },
  { day: 'Paz', count: 0, active: false },
];

/**
 * Rozetlerin kilidini kontrol edip günceller.
 */
export const checkAndUnlockBadges = (
  badges: Badge[],
  activeStreak: number,
  wordsLearned: number
): Badge[] => {
  const currentHour = new Date().getHours();

  return badges.map((b) => {
    if (b.isUnlocked) return b;

    let shouldUnlock = false;
    if (b.id === 'b-7streak' && activeStreak >= 7) {
      shouldUnlock = true;
    } else if (b.id === 'b-polyglot' && activeStreak >= 30) {
      shouldUnlock = true;
    } else if (b.id === 'b-wordmaster' && wordsLearned >= 1000) {
      shouldUnlock = true;
    } else if (b.id === 'b-earlybird' && currentHour < 8) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      return {
        ...b,
        isUnlocked: true,
        dateUnlocked: 'Bugün',
      };
    }
    return b;
  });
};

/**
 * Günlük sıfırlama kontrolü:
 * 1. Günlük hedef (currentDayWordsCount): Eğer kayıtlı tarih bugünden farklıysa 0'a sıfırlanır.
 * 2. Günlük seri (activeStreak): Eğer son aktiflik tarihi dünden daha eskiyse veya hiç yoksa seri 0'a sıfırlanır.
 */
export const checkDailyReset = (
  profile: UserProfile,
  settings: AppSettings
): { updatedProfile: UserProfile; updatedSettings: AppSettings; hasChanged: boolean } => {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  let hasChanged = false;
  let updatedSettings = { ...settings };
  let updatedProfile = { ...profile };

  // 1. Günlük Hedef Sıfırlama Kontrolü
  if (updatedSettings.lastDailyGoalDate !== today) {
    updatedSettings = {
      ...updatedSettings,
      currentDayWordsCount: 0,
      lastDailyGoalDate: today,
    };
    hasChanged = true;
  }

  // 2. Günlük Seri Sıfırlama Kontrolü
  // Eğer son aktif olunan tarih yoksa veya (dün değilse ve bugün de değilse) seri bozulmuştur -> 0
  const lastActive = updatedProfile.lastActiveDate;
  if (!lastActive) {
    if ((updatedProfile.activeStreak || 0) > 0) {
      updatedProfile = {
        ...updatedProfile,
        activeStreak: 0,
      };
      hasChanged = true;
    }
  } else if (lastActive !== today && lastActive !== yesterday) {
    if ((updatedProfile.activeStreak || 0) > 0) {
      updatedProfile = {
        ...updatedProfile,
        activeStreak: 0,
      };
      hasChanged = true;
    }
  }

  return { updatedProfile, updatedSettings, hasChanged };
};

/**
 * Kullanıcı kelime öğrendiğinde / eklediğinde / aktivite tamamladığında çağrılır.
 * Hem seriyi, hem hedefi, hem haftalık aktiviteyi ve rozetleri günceller.
 */
export const recordLearningActivity = (
  profile: UserProfile,
  settings: AppSettings,
  wordsDelta: number = 1
): { updatedProfile: UserProfile; updatedSettings: AppSettings } => {
  // Önce gün sıfırlaması gerekip gerekmediğini doğrula
  const { updatedProfile: baseProfile, updatedSettings: baseSettings } = checkDailyReset(
    profile,
    settings
  );

  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const todayName = getTurkishDayName();

  // 1. Günlük Seri Hesabı
  let newStreak = baseProfile.activeStreak || 0;
  if (baseProfile.lastActiveDate === today) {
    // Bugün zaten aktif olunmuş, seri sayacı artırılmaz (mevcut seri korunur)
    if (newStreak === 0) newStreak = 1;
  } else if (baseProfile.lastActiveDate === yesterday) {
    // Dün aktifti ve bugün ilk aktivitesini yapıyor -> seri 1 artar
    newStreak += 1;
  } else {
    // Seri daha önce bozulmuştu veya ilk defa başlıyor -> 1
    newStreak = 1;
  }

  // 2. Günlük Hedef Hesabı
  const newCurrentDayWords = Math.min(
    baseSettings.dailyGoal,
    (baseSettings.currentDayWordsCount || 0) + wordsDelta
  );

  // 3. Haftalık Aktivite Çizelgesi Güncellemesi
  const currentWeekly = baseProfile.weeklyActivity && baseProfile.weeklyActivity.length === 7
    ? baseProfile.weeklyActivity
    : getEmptyWeeklyActivity();

  const updatedWeekly = currentWeekly.map((item) => {
    if (item.day === todayName) {
      return {
        ...item,
        count: item.count + wordsDelta,
        active: true,
      };
    }
    return item;
  });

  const newWordsLearned = (baseProfile.wordsLearned || 0) + wordsDelta;
  const newWordsThisWeek = (baseProfile.wordsThisWeek || 0) + wordsDelta;

  // 4. Rozet Kontrolü
  const updatedBadges = checkAndUnlockBadges(
    baseProfile.badges || [],
    newStreak,
    newWordsLearned
  );

  const finalProfile: UserProfile = {
    ...baseProfile,
    activeStreak: newStreak,
    lastActiveDate: today,
    wordsLearned: newWordsLearned,
    wordsThisWeek: newWordsThisWeek,
    weeklyActivity: updatedWeekly,
    badges: updatedBadges,
  };

  const finalSettings: AppSettings = {
    ...baseSettings,
    currentDayWordsCount: newCurrentDayWords,
    lastDailyGoalDate: today,
  };

  return {
    updatedProfile: finalProfile,
    updatedSettings: finalSettings,
  };
};
