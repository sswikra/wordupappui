import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
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
} from './src/data/mockData';
import { StorageService } from './src/utils/storage';
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

    setUserLists((prevLists) =>
      prevLists.map((l) => {
        if (l.id === 'favorites') {
          const targetWord = words.find((w) => w.id === wordId);
          const willBeFavorite = targetWord ? !targetWord.isFavorite : true;
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
  };

  const handleAddWord = (newWord: Word, targetListId?: string) => {
    setWords((prev) => deduplicateWords([newWord, ...prev]));
    setSuggestedWords((prev) => deduplicateWords([newWord, ...prev.slice(0, 3)]));

    if (targetListId) {
      setUserLists((prev) =>
        prev.map((list) => {
          if (list.id === targetListId) {
            const filteredOld = (list.words || []).filter((w) => w.id !== newWord.id);
            const updatedWords = [newWord, ...filteredOld];
            return {
              ...list,
              count: updatedWords.length,
              words: updatedWords,
            };
          }
          return list;
        })
      );
    }

    setSettings((prev) => ({
      ...prev,
      currentDayWordsCount: Math.min(prev.dailyGoal, prev.currentDayWordsCount + 1),
    }));

    setProfile((prev) => ({
      ...prev,
      wordsLearned: prev.wordsLearned + 1,
      wordsThisWeek: prev.wordsThisWeek + 1,
    }));
  };

  const handleCreateList = (newList: WordList) => {
    setUserLists((prev) => [...prev, newList]);
  };

  const handleDeleteList = (listId: string, isOtherTab?: boolean) => {
    if (isOtherTab) {
      setOtherLists((prev) => prev.filter((l) => l.id !== listId));
    } else {
      setUserLists((prev) => prev.filter((l) => l.id !== listId));
    }
  };

  const handleAddWordToList = (wordId: string, listId: string) => {
    const targetWord = words.find((w) => w.id === wordId);
    if (!targetWord) return;

    setUserLists((prev) =>
      prev.map((list) => {
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
      })
    );
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
    setProfile((prev) => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      wordsThisWeek: prev.wordsThisWeek + 2,
    }));
  };

  const handleDeleteWord = (wordId: string) => {
    setWords((prev) => prev.filter((w) => w.id !== wordId));
    setSuggestedWords((prev) => prev.filter((w) => w.id !== wordId));
    setUserLists((prevLists) =>
      prevLists.map((l) => {
        const cleanWords = (l.words || []).filter((w) => w.id !== wordId);
        return {
          ...l,
          count: cleanWords.length,
          words: cleanWords,
        };
      })
    );
    if (selectedWord && selectedWord.id === wordId) {
      setSelectedWord(null);
    }
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
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
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              darkMode={settings.darkMode}
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
