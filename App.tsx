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
} from './src/data/mockData';
import { StorageService } from './src/utils/storage';
import { HapticsService } from './src/utils/haptics';
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
  const [isAuthOpen, setIsAuthOpen] = useState(true);

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

  // Load persistent data on initial mount
  useEffect(() => {
    async function loadData() {
      try {
        const savedWords = await StorageService.getWords();
        const savedLists = await StorageService.getUserLists();
        const savedProfile = await StorageService.getProfile();
        const savedSettings = await StorageService.getSettings();

        if (savedWords) setWords(deduplicateWords(savedWords));
        if (savedLists) setUserLists(savedLists);
        if (savedProfile) setProfile(savedProfile);
        if (savedSettings) setSettings(savedSettings);
      } catch (e) {
        console.warn('Initial storage load failed', e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  // Firebase Auth Listener & Firestore Data Sync
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user) {
        console.log('👤 Giriş yapan kullanıcı:', user.email || user.uid);
        try {
          // Firestore'dan kullanıcının verilerini çek
          const cloudWords = await FirebaseService.getUserWords(user.uid);
          const cloudLists = await FirebaseService.getUserLists(user.uid);
          const cloudProfile = await FirebaseService.getUserProfile(user.uid);
          const cloudSettings = await FirebaseService.getAppSettings(user.uid);

          if (cloudWords && cloudWords.length > 0) {
            const cleanCloud = deduplicateWords(cloudWords);
            setWords(cleanCloud);
            await StorageService.saveWords(cleanCloud);
          } else {
            // İlk kez giriş yapıyorsa mevcut kelimeleri buluta yedekle
            await FirebaseService.saveUserWords(user.uid, words);
          }

          if (cloudLists && cloudLists.length > 0) {
            setUserLists(cloudLists);
            await StorageService.saveUserLists(cloudLists);
          } else {
            await FirebaseService.saveUserLists(user.uid, userLists);
          }

          const isAnon = user.isAnonymous;
          const defaultAvatar = AVATAR_OPTIONS.male;

          const emailName = user.email ? user.email.split('@')[0] : 'Kelime Öğrencisi';
          const calculatedName = isAnon
            ? 'Misafir Öğrenci'
            : (user.displayName || (emailName.charAt(0).toUpperCase() + emailName.slice(1)));

          const profileToUse = cloudProfile || profile;
          const currentProfileName = (!cloudProfile || profileToUse.name === 'Alex' || profileToUse.name === 'Alex Morgan')
            ? calculatedName
            : profileToUse.name;

          const updatedProf: UserProfile = {
            ...profileToUse,
            name: currentProfileName,
            role: isAnon ? 'Misafir Hesap' : 'Kelime Kaşifi',
            avatarUrl: profileToUse.avatarUrl || user.photoURL || defaultAvatar,
            gender: profileToUse.gender || 'male',
          };

          setProfile(updatedProf);
          await StorageService.saveProfile(updatedProf);
          await FirebaseService.saveUserProfile(user.uid, updatedProf);

          if (cloudSettings) {
            setSettings(cloudSettings);
            await StorageService.saveSettings(cloudSettings);
          } else {
            const updatedSettings: AppSettings = {
              ...settings,
              email: isAnon ? 'misafir@wordmem.app' : (user.email || settings.email),
            };
            setSettings(updatedSettings);
            await StorageService.saveSettings(updatedSettings);
            await FirebaseService.saveAppSettings(user.uid, updatedSettings);
          }

          // Giriş yapmışsa giriş ekranını kapat
          if (!isAnon) {
            setIsAuthOpen(false);
          }
        } catch (e) {
          console.warn('Firestore veri yükleme hatası:', e);
        }
      } else {
        // Kullanıcı giriş yapmamışsa başlangıçta giriş ekranını aç
        setIsAuthOpen(true);
        console.log('👤 Oturum açık değil (Giriş ekranı gösteriliyor)');
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

    const updatedSettings = {
      ...settings,
      currentDayWordsCount: Math.min(settings.dailyGoal, settings.currentDayWordsCount + 1),
    };
    setSettings(updatedSettings);

    const updatedProfile = {
      ...profile,
      wordsLearned: profile.wordsLearned + 1,
      wordsThisWeek: profile.wordsThisWeek + 1,
    };
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
    }
  };

  const handleUpdateProfile = async (newProfile: Partial<UserProfile>) => {
    const updated = { ...profile, ...newProfile };
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

      const guestProfile: UserProfile = {
        ...INITIAL_USER_PROFILE,
        name: 'Misafir Öğrenci',
        role: 'Misafir Hesap',
        avatarUrl: AVATAR_OPTIONS.male,
        gender: 'male',
      };

      const guestSettings: AppSettings = {
        ...INITIAL_APP_SETTINGS,
        email: 'misafir@wordmem.app',
      };

      setProfile(guestProfile);
      setSettings(guestSettings);
      setWords(VOCABULARY_DATABASE);
      setUserLists(INITIAL_USER_LISTS);

      await StorageService.saveProfile(guestProfile);
      await StorageService.saveSettings(guestSettings);
      await StorageService.saveWords(VOCABULARY_DATABASE);
      await StorageService.saveUserLists(INITIAL_USER_LISTS);

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
    setUserLists((prev) =>
      prev.map((list) => {
        if (list.id === listId) {
          const newMastery = Math.min(100, Math.max(0, list.mastery + delta));
          return { ...list, mastery: newMastery };
        }
        return list;
      })
    );
  };

  const handleIncrementGamesPlayed = () => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        wordsThisWeek: prev.wordsThisWeek + 2,
      };
      StorageService.saveProfile(updated);
      const activeUser = currentUser || AuthService.getCurrentUser();
      if (activeUser) FirebaseService.saveUserProfile(activeUser.uid, updated);
      return updated;
    });
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
          darkMode={settings.darkMode}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          darkMode={settings.darkMode}
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
