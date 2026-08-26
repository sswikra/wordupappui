import { User } from 'firebase/auth';
import { AuthService } from './src/services/authService';
import { FirebaseService } from './src/services/firebaseService';
import { AuthModal } from './src/components/modals/AuthModal';
import React, { useState, useEffect, useCallback } from 'react';
import { testFirebaseConnection } from './src/firebaseTest';
import {
  View,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
  Alert,
  AppState,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TabType, Word, WordList, UserProfile, AppSettings } from './src/types';
import {
  INITIAL_WORD_OF_THE_DAY,
  INITIAL_SUGGESTED_WORDS,
  VOCABULARY_DATABASE,
  INITIAL_USER_LISTS,
  OTHER_CURATED_LISTS,
  INITIAL_USER_PROFILE,
  INITIAL_APP_SETTINGS,
  AVATAR_OPTIONS,
  getCleanUserLists,
  getCleanUserProfile,
  getCleanAppSettings,
  getCleanVocabularyDatabase,
} from './src/data/mockData';
import { StorageService } from './src/utils/storage';
import { HapticsService } from './src/utils/haptics';
import {
  checkDailyReset,
  recordLearningActivity,
  getEmptyWeeklyActivity,
} from './src/utils/streakManager';
import { Colors, getTheme } from './src/theme/colors';

// Common Components
import { Header } from './src/components/common/Header';
import { BottomNav } from './src/components/common/BottomNav';

// Views
import { HomeView } from './src/components/views/HomeView';
import { GamesView } from './src/components/views/GamesView';
import { ListsView } from './src/components/views/ListsView';
import { ProfileView } from './src/components/views/ProfileView';
import { SettingsView } from './src/components/views/SettingsView';

// Modals
import { SidebarDrawer } from './src/components/modals/SidebarDrawer';
import { SearchModal } from './src/components/modals/SearchModal';
import { WordDetailModal } from './src/components/modals/WordDetailModal';
import { AddWordModal } from './src/components/modals/AddWordModal';
import { CreateListModal } from './src/components/modals/CreateListModal';
import { ListDetailModal } from './src/components/modals/ListDetailModal';
import { DailyGoalModal } from './src/components/modals/DailyGoalModal';

const deduplicateWords = (wordsList: Word[] = []): Word[] => {
  const seen = new Set<string>();
  return wordsList.filter((w) => {
    if (!w || !w.id) return false;
    if (seen.has(w.id)) return false;
    seen.add(w.id);
    return true;
  });
};

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isGameActive, setIsGameActive] = useState(false);

  // Application Data States
  const [words, setWords] = useState<Word[]>(VOCABULARY_DATABASE);
  const [wordOfTheDay] = useState<Word>(INITIAL_WORD_OF_THE_DAY);
  const [suggestedWords, setSuggestedWords] = useState<Word[]>(INITIAL_SUGGESTED_WORDS);
  const [userLists, setUserLists] = useState<WordList[]>(INITIAL_USER_LISTS);
  const [otherLists, setOtherLists] = useState<WordList[]>(OTHER_CURATED_LISTS);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_APP_SETTINGS);

  // Modals & Drawers States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isAddWordOpen, setIsAddWordOpen] = useState(false);
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<WordList | null>(null);
  const [isDailyGoalModalOpen, setIsDailyGoalModalOpen] = useState(false);
  const [isFirstTimeGoal, setIsFirstTimeGoal] = useState(false);

  // Load persistent data on initial mount
  useEffect(() => {
    async function loadData() {
      try {
        let savedWords = await StorageService.getWords();
        let savedLists = await StorageService.getUserLists();
        let savedOtherLists = await StorageService.getOtherLists();
        let savedProfile = await StorageService.getProfile();
        let savedSettings = await StorageService.getSettings();

        if (savedWords) setWords(deduplicateWords(savedWords));
        if (savedLists) setUserLists(savedLists);
        if (savedOtherLists) setOtherLists(savedOtherLists);

        const initialProf = savedProfile || INITIAL_USER_PROFILE;
        const initialSett = savedSettings || INITIAL_APP_SETTINGS;

        const { updatedProfile, updatedSettings, hasChanged } = checkDailyReset(
          initialProf,
          initialSett
        );

        setProfile(updatedProfile);
        setSettings(updatedSettings);

        if (hasChanged) {
          await StorageService.saveProfile(updatedProfile);
          await StorageService.saveSettings(updatedSettings);
        }
      } catch (e) {
        console.warn('Initial storage load failed', e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  // Uygulama ön plana geldiğinde (geceden sabaha geçildiğinde vb.) gün sıfırlamasını kontrol et
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        const { updatedProfile, updatedSettings, hasChanged } = checkDailyReset(
          profile,
          settings
        );
        if (hasChanged) {
          setProfile(updatedProfile);
          setSettings(updatedSettings);
          StorageService.saveProfile(updatedProfile);
          StorageService.saveSettings(updatedSettings);
          const activeUser = currentUser || AuthService.getCurrentUser();
          if (activeUser) {
            FirebaseService.saveUserProfile(activeUser.uid, updatedProfile);
            FirebaseService.saveAppSettings(activeUser.uid, updatedSettings);
          }
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [currentUser, profile, settings]);

  // Firebase Auth Listener & Firestore Data Sync
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user && !user.isAnonymous) {
        console.log('👤 Kalıcı hesapla giriş yapıldı:', user.email || user.displayName || user.uid);
        setIsAuthOpen(false);

        try {
          // Firestore'dan kullanıcının verilerini çek
          const cloudWords = await FirebaseService.getUserWords(user.uid);
          const cloudLists = await FirebaseService.getUserLists(user.uid);
          const cloudProfile = await FirebaseService.getUserProfile(user.uid);
          const cloudSettings = await FirebaseService.getAppSettings(user.uid);

          const defaultAvatar = AVATAR_OPTIONS.male;
          const emailName = user.email ? user.email.split('@')[0] : 'Kelime Öğrencisi';
          const calculatedName = user.displayName || (emailName.charAt(0).toUpperCase() + emailName.slice(1));

          // 1. KELİMELER (Words)
          let wordsToUse: Word[];
          if (cloudWords && cloudWords.length > 0) {
            wordsToUse = deduplicateWords(cloudWords);
          } else {
            wordsToUse = getCleanVocabularyDatabase();
          }
          setWords(wordsToUse);
          await StorageService.saveWords(wordsToUse);

          // 2. LİSTELER (User Lists)
          let listsToUse: WordList[];
          if (cloudLists && cloudLists.length > 0) {
            listsToUse = cloudLists.map((cl) => ({
              ...cl,
              count: cl.words ? cl.words.length : cl.count || 0,
              mastery: typeof cl.mastery === 'number' ? cl.mastery : 0,
              words: cl.words ? deduplicateWords(cl.words) : [],
            }));
          } else {
            listsToUse = getCleanUserLists();
          }
          setUserLists(listsToUse);
          await StorageService.saveUserLists(listsToUse);

          // 3. PROFİL (Profile)
          let profileToUse: UserProfile;
          if (cloudProfile) {
            profileToUse = {
              ...INITIAL_USER_PROFILE,
              ...cloudProfile,
              name: cloudProfile.name || calculatedName,
              role: 'Kelime Kaşifi',
              avatarUrl: cloudProfile.avatarUrl || user.photoURL || defaultAvatar,
              gender: cloudProfile.gender || 'male',
              wordsLearned: typeof cloudProfile.wordsLearned === 'number' ? cloudProfile.wordsLearned : 0,
              wordsThisWeek: typeof cloudProfile.wordsThisWeek === 'number' ? cloudProfile.wordsThisWeek : 0,
              gamesPlayed: typeof cloudProfile.gamesPlayed === 'number' ? cloudProfile.gamesPlayed : 0,
              activeStreak: typeof cloudProfile.activeStreak === 'number' ? cloudProfile.activeStreak : 0,
              overallAccuracy: typeof cloudProfile.overallAccuracy === 'number' ? cloudProfile.overallAccuracy : 100,
              weeklyActivity: Array.isArray(cloudProfile.weeklyActivity) && cloudProfile.weeklyActivity.length === 7
                ? cloudProfile.weeklyActivity
                : getEmptyWeeklyActivity(),
              badges: Array.isArray(cloudProfile.badges) && cloudProfile.badges.length > 0
                ? cloudProfile.badges
                : INITIAL_USER_PROFILE.badges,
            };
          } else {
            profileToUse = getCleanUserProfile(
              calculatedName,
              'Kelime Kaşifi',
              user.email || undefined,
              user.photoURL || defaultAvatar
            );
          }

          // 4. AYARLAR (Settings)
          const isNewUserRegistration = !cloudSettings;
          let settingsToUse: AppSettings = cloudSettings
            ? { ...cloudSettings, email: user.email || cloudSettings.email }
            : getCleanAppSettings(user.email || '');

          const { updatedProfile, updatedSettings } = checkDailyReset(
            profileToUse,
            settingsToUse
          );

          setProfile(updatedProfile);
          setSettings(updatedSettings);
          await StorageService.saveProfile(updatedProfile);
          await StorageService.saveSettings(updatedSettings);
          await FirebaseService.saveUserProfile(user.uid, updatedProfile);
          await FirebaseService.saveAppSettings(user.uid, updatedSettings);

          // İlk kayıt veya bulut ayarı olmayan yeni kullanıcılar için günlük hedef belirleme modalını aç
          if (isNewUserRegistration) {
            setIsFirstTimeGoal(true);
            setIsDailyGoalModalOpen(true);
          }
        } catch (e) {
          console.warn('Firestore veri yükleme hatası:', e);
        }
      } else {
        // Oturum açılmamış veya anonim misafir durumunda giriş ekranını göster
        console.log('👤 Oturum açık değil / Misafir durumu (Giriş ekranı açılıyor)');
        setIsAuthOpen(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to AsyncStorage on updates
  useEffect(() => {
    if (isLoaded) {
      StorageService.saveWords(words);
    }
  }, [words, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      StorageService.saveUserLists(userLists);
    }
  }, [userLists, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      StorageService.saveProfile(profile);
    }
  }, [profile, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      StorageService.saveSettings(settings);
    }
  }, [settings, isLoaded]);

  // Android Hardware Back Button Handling
  useEffect(() => {
    const onBackPress = () => {
      if (isDailyGoalModalOpen) {
        if (!isFirstTimeGoal) {
          setIsDailyGoalModalOpen(false);
        }
        return true;
      }
      if (isAuthOpen) {
        setIsAuthOpen(false);
        return true;
      }
      if (selectedWord) {
        setSelectedWord(null);
        return true;
      }
      if (selectedList) {
        setSelectedList(null);
        return true;
      }
      if (isSearchOpen) {
        setIsSearchOpen(false);
        return true;
      }
      if (isAddWordOpen) {
        setIsAddWordOpen(false);
        return true;
      }
      if (isCreateListOpen) {
        setIsCreateListOpen(false);
        return true;
      }
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
        return true;
      }
      if (isGameActive) {
        setIsGameActive(false);
        return true;
      }
      if (currentTab !== 'home') {
        setCurrentTab('home');
        return true;
      }
      return false; // Exit app
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [
    isDailyGoalModalOpen,
    isFirstTimeGoal,
    isAuthOpen,
    selectedWord,
    selectedList,
    isSearchOpen,
    isAddWordOpen,
    isCreateListOpen,
    isSidebarOpen,
    isGameActive,
    currentTab,
  ]);

  // Handlers
  const handleToggleFavorite = (wordId: string) => {
    setWords((prev) =>
      prev.map((w) => (w.id === wordId ? { ...w, isFavorite: !w.isFavorite } : w))
    );

    setSuggestedWords((prev) =>
      prev.map((w) => (w.id === wordId ? { ...w, isFavorite: !w.isFavorite } : w))
    );

    if (selectedWord && selectedWord.id === wordId) {
      setSelectedWord((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }

    const targetWord = words.find((w) => w.id === wordId);
    const willBeFavorite = targetWord ? !targetWord.isFavorite : true;

    setUserLists((prevLists) =>
      prevLists.map((l) => {
        if (l.id === 'favorites') {
          const cleanRemaining = (l.words || []).filter((w) => w.id !== wordId);
          const updatedWordObj = targetWord
            ? { ...targetWord, isFavorite: willBeFavorite }
            : ({ id: wordId, isFavorite: willBeFavorite } as Word);

          const updatedWords = willBeFavorite
            ? [updatedWordObj, ...cleanRemaining]
            : cleanRemaining;

          const deduplicated = deduplicateWords(updatedWords);
          return {
            ...l,
            count: deduplicated.length,
            words: deduplicated,
          };
        }
        return l;
      })
    );

    const activeUser = currentUser || AuthService.getCurrentUser();
    if (activeUser && targetWord) {
      FirebaseService.saveUserWord(activeUser.uid, { ...targetWord, isFavorite: willBeFavorite });
    }
  };

  const handleAddWord = async (newWord: Word, targetListId?: string) => {
    const updatedWords = deduplicateWords([newWord, ...words]);
    setWords(updatedWords);
    setSuggestedWords((prev) => deduplicateWords([newWord, ...prev.slice(0, 3)]));

    let updatedLists = userLists;
    if (targetListId) {
      updatedLists = userLists.map((list) => {
        if (list.id === targetListId) {
          const filteredOld = (list.words || []).filter((w) => w.id !== newWord.id);
          const listWords = [newWord, ...filteredOld];
          return {
            ...list,
            count: listWords.length,
            words: listWords,
          };
        }
        return list;
      });
      setUserLists(updatedLists);
    }

    const { updatedProfile, updatedSettings } = recordLearningActivity(profile, settings, 1);
    setSettings(updatedSettings);
    setProfile(updatedProfile);

    // Yerel depolamaya anında kaydet
    await StorageService.saveWords(updatedWords);
    if (targetListId) await StorageService.saveUserLists(updatedLists);
    await StorageService.saveSettings(updatedSettings);
    await StorageService.saveProfile(updatedProfile);

    // Firebase'e anında ve güvenli kaydet
    const activeUser = currentUser || AuthService.getCurrentUser();
    if (activeUser) {
      console.log('🔥 [Firebase Sync] Yeni kelime buluta kaydediliyor:', newWord.word, '(UID:', activeUser.uid, ')');
      await FirebaseService.saveUserWords(activeUser.uid, updatedWords);
      if (targetListId) await FirebaseService.saveUserLists(activeUser.uid, updatedLists);
      await FirebaseService.saveUserProfile(activeUser.uid, updatedProfile);
      await FirebaseService.saveAppSettings(activeUser.uid, updatedSettings);
    }
  };

  const handleUpdateProfile = async (newProfile: Partial<UserProfile>) => {
    const updated: UserProfile = {
      ...profile,
      ...newProfile,
      wordsLearned: typeof (newProfile.wordsLearned ?? profile.wordsLearned) === 'number' ? (newProfile.wordsLearned ?? profile.wordsLearned) : 0,
      wordsThisWeek: typeof (newProfile.wordsThisWeek ?? profile.wordsThisWeek) === 'number' ? (newProfile.wordsThisWeek ?? profile.wordsThisWeek) : 0,
      gamesPlayed: typeof (newProfile.gamesPlayed ?? profile.gamesPlayed) === 'number' ? (newProfile.gamesPlayed ?? profile.gamesPlayed) : 0,
      activeStreak: typeof (newProfile.activeStreak ?? profile.activeStreak) === 'number' ? (newProfile.activeStreak ?? profile.activeStreak) : 0,
    };
    setProfile(updated);
    await StorageService.saveProfile(updated);

    const activeUser = currentUser || AuthService.getCurrentUser();
    if (activeUser) {
      await FirebaseService.saveUserProfile(activeUser.uid, updated);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setCurrentUser(null);

      const guestProfile = getCleanUserProfile();
      const guestSettings = getCleanAppSettings('misafir@wordmem.app');
      const cleanWords = getCleanVocabularyDatabase();
      const cleanLists = getCleanUserLists();

      setProfile(guestProfile);
      setSettings(guestSettings);
      setWords(cleanWords);
      setUserLists(cleanLists);

      await StorageService.saveProfile(guestProfile);
      await StorageService.saveSettings(guestSettings);
      await StorageService.saveWords(cleanWords);
      await StorageService.saveUserLists(cleanLists);

      setIsAuthOpen(true);
      console.log('✅ Çıkış yapıldı ve oturum misafir moduna sıfırlandı.');
    } catch (e) {
      console.error('Çıkış hatası:', e);
    }
  };

  const handleCreateList = (newList: WordList) => {
    setUserLists((prev) => {
      const updated = [...prev, newList];
      StorageService.saveUserLists(updated);
      const activeUser = currentUser || AuthService.getCurrentUser();
      if (activeUser) FirebaseService.saveUserLists(activeUser.uid, updated);
      return updated;
    });
  };

  const handleDeleteList = (listId: string, isOtherTab?: boolean) => {
    if (isOtherTab) {
      setOtherLists((prev) => prev.filter((l) => l.id !== listId));
    } else {
      setUserLists((prev) => {
        const updated = prev.filter((l) => l.id !== listId);
        StorageService.saveUserLists(updated);
        const activeUser = currentUser || AuthService.getCurrentUser();
        if (activeUser) {
          FirebaseService.deleteUserList(activeUser.uid, listId);
          FirebaseService.saveUserLists(activeUser.uid, updated);
        }
        return updated;
      });
    }
  };

  const handleAddWordToList = (wordId: string, listId: string) => {
    const targetWord = words.find((w) => w.id === wordId);
    if (!targetWord) return;

    setUserLists((prev) => {
      const updated = prev.map((list) => {
        if (list.id === listId) {
          const alreadyExists = (list.words || []).some((w) => w.id === wordId);
          if (alreadyExists) return list;
          const updatedWords = [targetWord, ...(list.words || [])];
          return {
            ...list,
            count: updatedWords.length,
            words: updatedWords,
          };
        }
        return list;
      });
      StorageService.saveUserLists(updated);
      const activeUser = currentUser || AuthService.getCurrentUser();
      if (activeUser) FirebaseService.saveUserLists(activeUser.uid, updated);
      return updated;
    });
  };

  const handleUpdateListMastery = (listId: string, delta: number) => {
    setUserLists((prev) => {
      const updated = prev.map((list) => {
        if (list.id === listId) {
          const newMastery = Math.min(100, Math.max(0, list.mastery + delta));
          return { ...list, mastery: newMastery };
        }
        return list;
      });
      StorageService.saveUserLists(updated);
      const activeUser = currentUser || AuthService.getCurrentUser();
      if (activeUser) FirebaseService.saveUserLists(activeUser.uid, updated);
      return updated;
    });

    setOtherLists((prev) => {
      const updated = prev.map((list) => {
        if (list.id === listId) {
          const newMastery = Math.min(100, Math.max(0, list.mastery + delta));
          return { ...list, mastery: newMastery };
        }
        return list;
      });
      StorageService.saveOtherLists(updated);
      return updated;
    });
  };

  const handleClearList = async (listId: string) => {
    if (listId === 'favorites') {
      const updatedWords = words.map((w) => (w.isFavorite ? { ...w, isFavorite: false } : w));
      setWords(updatedWords);
      StorageService.saveWords(updatedWords);
      const activeUser = currentUser || AuthService.getCurrentUser();
      if (activeUser) {
        FirebaseService.saveUserWords(activeUser.uid, updatedWords);
      }
    }

    const updatedWords = words.map((w) => {
      if (w.lists?.includes(listId)) {
        return { ...w, lists: w.lists.filter((l) => l !== listId) };
      }
      return w;
    });
    setWords(updatedWords);
    StorageService.saveWords(updatedWords);

    const updatedLists = userLists.map((l) => {
      if (l.id === listId) {
        return {
          ...l,
          count: 0,
          mastery: 0,
          words: [],
        };
      }
      return l;
    });

    setUserLists(updatedLists);
    await StorageService.saveUserLists(updatedLists);

    const activeUser = currentUser || AuthService.getCurrentUser();
    if (activeUser) {
      FirebaseService.saveUserLists(activeUser.uid, updatedLists);
      FirebaseService.saveUserWords(activeUser.uid, updatedWords);
    }

    HapticsService.success();
    Alert.alert('Liste Sıfırlandı 🎉', 'Listedeki tüm kelimeler temizlendi ve hakimiyet %0 yapıldı.');
  };

  const handleResetUserLists = async () => {
    try {
      const cleanLists = getCleanUserLists();
      const cleanWords = getCleanVocabularyDatabase();

      setUserLists(cleanLists);
      setWords(cleanWords);
      setSuggestedWords((prev) => prev.map((w) => ({ ...w, isFavorite: false })));

      await StorageService.saveUserLists(cleanLists);
      await StorageService.saveWords(cleanWords);

      const activeUser = currentUser || AuthService.getCurrentUser();
      if (activeUser) {
        await FirebaseService.resetUserLists(activeUser.uid, cleanLists);
        await FirebaseService.saveUserWords(activeUser.uid, cleanWords);
      }

      HapticsService.success();
      Alert.alert('Listeler Sıfırlandı 🎉', 'Kişisel kelime listeleriniz ve favorileriniz başarıyla sıfırlandı.');
    } catch (e) {
      console.warn('Reset user lists error:', e);
    }
  };

  const handleResetProfile = async () => {
    try {
      const emailName = currentUser?.email ? currentUser.email.split('@')[0] : 'Kelime Öğrencisi';
      const isAnon = !currentUser || currentUser.isAnonymous;
      const calculatedName = isAnon
        ? 'Misafir Öğrenci'
        : (currentUser?.displayName || (emailName.charAt(0).toUpperCase() + emailName.slice(1)));

      const cleanProf = getCleanUserProfile(
        calculatedName,
        isAnon ? 'Misafir Hesap' : 'Kelime Kaşifi',
        currentUser?.email || undefined,
        profile.avatarUrl
      );

      const cleanSett: AppSettings = {
        ...settings,
        currentDayWordsCount: 0,
      };

      setProfile(cleanProf);
      setSettings(cleanSett);

      await StorageService.saveProfile(cleanProf);
      await StorageService.saveSettings(cleanSett);

      const activeUser = currentUser || AuthService.getCurrentUser();
      if (activeUser) {
        await FirebaseService.saveUserProfile(activeUser.uid, cleanProf);
        await FirebaseService.saveAppSettings(activeUser.uid, cleanSett);
      }

      HapticsService.success();
      Alert.alert('İlerleme Sıfırlandı 🎉', 'Öğrenilen kelimeler sayacı, haftalık aktivite grafiği ve seri sayaçlarınız sıfırlandı.');
    } catch (e) {
      console.warn('Reset profile error:', e);
    }
  };

  const handleResetAllData = async () => {
    try {
      const emailName = currentUser?.email ? currentUser.email.split('@')[0] : 'Kelime Öğrencisi';
      const isAnon = !currentUser || currentUser.isAnonymous;
      const calculatedName = isAnon
        ? 'Misafir Öğrenci'
        : (currentUser?.displayName || (emailName.charAt(0).toUpperCase() + emailName.slice(1)));

      const cleanProf = getCleanUserProfile(
        calculatedName,
        isAnon ? 'Misafir Hesap' : 'Kelime Kaşifi',
        currentUser?.email || undefined,
        profile.avatarUrl
      );
      const cleanSett = getCleanAppSettings(currentUser?.email || undefined);
      const cleanLists = getCleanUserLists();
      const cleanWords = getCleanVocabularyDatabase();

      setProfile(cleanProf);
      setSettings(cleanSett);
      setUserLists(cleanLists);
      setWords(cleanWords);
      setSuggestedWords((prev) => prev.map((w) => ({ ...w, isFavorite: false })));

      await StorageService.resetAll();

      const activeUser = currentUser || AuthService.getCurrentUser();
      if (activeUser) {
        await FirebaseService.resetUserData(activeUser.uid, cleanProf, cleanLists, cleanWords);
        await FirebaseService.saveAppSettings(activeUser.uid, cleanSett);
      }

      HapticsService.success();
      Alert.alert('Fabrika Ayarlarına Döndürüldü 🎉', 'Tüm listeleriniz, öğrenilen kelimeler ve uygulama verileriniz başarıyla sıfırlandı.');
    } catch (e) {
      console.warn('Reset all data error:', e);
    }
  };

  const handleWordMastered = async () => {
    const { updatedProfile, updatedSettings } = recordLearningActivity(profile, settings, 1);
    setProfile(updatedProfile);
    setSettings(updatedSettings);

    await StorageService.saveProfile(updatedProfile);
    await StorageService.saveSettings(updatedSettings);

    const activeUser = currentUser || AuthService.getCurrentUser();
    if (activeUser) {
      FirebaseService.saveUserProfile(activeUser.uid, updatedProfile);
      FirebaseService.saveAppSettings(activeUser.uid, updatedSettings);
    }
  };

  const handleIncrementGamesPlayed = () => {
    const { updatedProfile, updatedSettings } = recordLearningActivity(profile, settings, 2);
    const finalProfile: UserProfile = {
      ...updatedProfile,
      gamesPlayed: (profile.gamesPlayed || 0) + 1,
    };

    setProfile(finalProfile);
    setSettings(updatedSettings);

    StorageService.saveProfile(finalProfile);
    StorageService.saveSettings(updatedSettings);

    const activeUser = currentUser || AuthService.getCurrentUser();
    if (activeUser) {
      FirebaseService.saveUserProfile(activeUser.uid, finalProfile);
      FirebaseService.saveAppSettings(activeUser.uid, updatedSettings);
    }
  };

  const handleDeleteWord = (wordId: string) => {
    const updatedWords = words.filter((w) => w.id !== wordId);
    setWords(updatedWords);
    setSuggestedWords((prev) => prev.filter((w) => w.id !== wordId));
    const updatedLists = userLists.map((l) => {
      const cleanWords = (l.words || []).filter((w) => w.id !== wordId);
      return {
        ...l,
        count: cleanWords.length,
        words: cleanWords,
      };
    });
    setUserLists(updatedLists);

    StorageService.saveWords(updatedWords);
    StorageService.saveUserLists(updatedLists);

    const activeUser = currentUser || AuthService.getCurrentUser();
    if (activeUser) {
      FirebaseService.deleteUserWord(activeUser.uid, wordId);
      FirebaseService.saveUserLists(activeUser.uid, updatedLists);
    }

    if (selectedWord && selectedWord.id === wordId) {
      setSelectedWord(null);
    }
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      StorageService.saveSettings(updated);
      const activeUser = currentUser || AuthService.getCurrentUser();
      if (activeUser) FirebaseService.saveAppSettings(activeUser.uid, updated);
      return updated;
    });
  };

  const handleUpdateDailyGoal = (newGoal: number) => {
    handleUpdateSettings({ dailyGoal: newGoal });
    setIsDailyGoalModalOpen(false);
    setIsFirstTimeGoal(false);
  };

  const handleSyncGlobalVocabulary = async () => {
    try {
      const cloudWords = await FirebaseService.getGlobalVocabulary();
      const cloudLists = await FirebaseService.getGlobalCuratedLists();

      if (cloudWords && cloudWords.length > 0) {
        const merged = deduplicateWords([...cloudWords, ...words]);
        setWords(merged);
        await StorageService.saveWords(merged);
        if (cloudLists && cloudLists.length > 0) {
          setOtherLists(cloudLists);
        }
        HapticsService.success();
        Alert.alert(
          'Bulut Senkronizasyonu Başarılı 🎉',
          `Firestore'dan ${cloudWords.length} adet kelime başarıyla indirildi ve cihazınıza kaydedildi.`
        );
      } else {
        HapticsService.selection();
        Alert.alert('Bilgi', 'Firestore bulutunda yeni kelime bulunamadı.');
      }
    } catch (e: any) {
      HapticsService.error();
      Alert.alert('Hata', 'Bulut veritabanı senkronizasyonu sırasında bir hata oluştu.');
    }
  };

  const theme = getTheme(settings.darkMode);

  if (!isLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: settings.darkMode ? '#0f172a' : '#f3f7fa' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar style={settings.darkMode ? 'light' : 'dark'} />

        {/* Top Header */}
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          currentTab={currentTab}
          darkMode={settings.darkMode}
        />

        {/* Main View Area */}
        <View style={styles.viewContainer}>
          {currentTab === 'home' && (
            <HomeView
              wordOfTheDay={wordOfTheDay}
              suggestedWords={suggestedWords}
              settings={settings}
              streakCount={profile.activeStreak}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenAddWord={() => setIsAddWordOpen(true)}
              onSelectWord={(w) => setSelectedWord(w)}
              onOpenDailyGoal={() => {
                setIsFirstTimeGoal(false);
                setIsDailyGoalModalOpen(true);
              }}
              darkMode={settings.darkMode}
            />
          )}

          {currentTab === 'games' && (
            <GamesView
              darkMode={settings.darkMode}
              onIncrementGamesPlayed={handleIncrementGamesPlayed}
              onActiveGameChange={setIsGameActive}
            />
          )}

          {currentTab === 'lists' && (
            <ListsView
              userLists={userLists}
              otherLists={otherLists}
              onSelectList={(l) => setSelectedList(l)}
              onOpenCreateList={() => setIsCreateListOpen(true)}
              onDeleteList={handleDeleteList}
              onClearList={handleClearList}
              onResetAllLists={handleResetUserLists}
              darkMode={settings.darkMode}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              profile={profile}
              darkMode={settings.darkMode}
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthOpen(true)}
              onUpdateProfile={handleUpdateProfile}
              onResetProfile={handleResetProfile}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              darkMode={settings.darkMode}
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthOpen(true)}
              onLogout={handleLogout}
              onSyncCloud={handleSyncGlobalVocabulary}
              onResetUserLists={handleResetUserLists}
              onResetProfile={handleResetProfile}
              onResetAllData={handleResetAllData}
            />
          )}
        </View>

        {/* Bottom Navigation Bar */}
        {!isGameActive && (
          <BottomNav
            currentTab={currentTab}
            onChangeTab={(tab) => {
              setCurrentTab(tab);
              if (tab !== 'games') {
                setIsGameActive(false);
              }
            }}
            darkMode={settings.darkMode}
          />
        )}

        {/* Modals & Drawer */}
        <SidebarDrawer
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          profile={profile}
          settings={settings}
          onToggleDarkMode={() => handleUpdateSettings({ darkMode: !settings.darkMode })}
          onNavigateTab={(tab) => {
            setCurrentTab(tab);
            setIsSidebarOpen(false);
          }}
          onOpenSearch={() => {
            setIsSidebarOpen(false);
            setIsSearchOpen(true);
          }}
          currentUser={currentUser}
          onOpenAuth={() => {
            setIsSidebarOpen(false);
            setIsAuthOpen(true);
          }}
        />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          words={words}
          onSelectWord={(w) => setSelectedWord(w)}
          onToggleFavorite={handleToggleFavorite}
          onOpenAddWord={() => setIsAddWordOpen(true)}
          darkMode={settings.darkMode}
        />

        <WordDetailModal
          word={selectedWord}
          isOpen={!!selectedWord}
          onClose={() => setSelectedWord(null)}
          onToggleFavorite={handleToggleFavorite}
          onDeleteWord={handleDeleteWord}
          userLists={userLists}
          onAddWordToList={handleAddWordToList}
          darkMode={settings.darkMode}
        />

        <AddWordModal
          isOpen={isAddWordOpen}
          onClose={() => setIsAddWordOpen(false)}
          onAddWord={handleAddWord}
          userLists={userLists}
          darkMode={settings.darkMode}
        />

        <CreateListModal
          isOpen={isCreateListOpen}
          onClose={() => setIsCreateListOpen(false)}
          onCreateList={handleCreateList}
          darkMode={settings.darkMode}
        />

        <ListDetailModal
          list={selectedList}
          isOpen={!!selectedList}
          onClose={() => setSelectedList(null)}
          onSelectWord={(w) => setSelectedWord(w)}
          onToggleFavorite={handleToggleFavorite}
          onUpdateListMastery={handleUpdateListMastery}
          onDeleteList={handleDeleteList}
          onClearList={handleClearList}
          onWordMastered={handleWordMastered}
          darkMode={settings.darkMode}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={() => setIsAuthOpen(false)}
          darkMode={settings.darkMode}
        />

        <DailyGoalModal
          isOpen={isDailyGoalModalOpen}
          currentGoal={settings.dailyGoal}
          onSaveGoal={handleUpdateDailyGoal}
          onClose={() => {
            setIsDailyGoalModalOpen(false);
            setIsFirstTimeGoal(false);
          }}
          darkMode={settings.darkMode}
          isFirstTime={isFirstTimeGoal}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  viewContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
