import React, { useState, useEffect } from 'react';
import { TabType, Word, WordList, UserProfile, AppSettings } from './types';
import {
  INITIAL_WORD_OF_THE_DAY,
  INITIAL_SUGGESTED_WORDS,
  VOCABULARY_DATABASE,
  INITIAL_USER_LISTS,
  OTHER_CURATED_LISTS,
  INITIAL_USER_PROFILE,
  INITIAL_APP_SETTINGS,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { SidebarDrawer } from './components/SidebarDrawer';
import { SearchModal } from './components/SearchModal';
import { WordDetailModal } from './components/WordDetailModal';
import { AddWordModal } from './components/AddWordModal';
import { CreateListModal } from './components/CreateListModal';
import { ListDetailModal } from './components/ListDetailModal';
import { HomeView } from './components/views/HomeView';
import { GamesView } from './components/views/GamesView';
import { ListsView } from './components/views/ListsView';
import { ProfileView } from './components/views/ProfileView';
import { SettingsView } from './components/views/SettingsView';

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
  // Navigation
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Application Data States
  const [words, setWords] = useState<Word[]>(() => {
    const saved = localStorage.getItem('wordup_words');
    if (saved) {
      try {
        return deduplicateWords(JSON.parse(saved));
      } catch {
        return VOCABULARY_DATABASE;
      }
    }
    return VOCABULARY_DATABASE;
  });

  const [wordOfTheDay] = useState<Word>(INITIAL_WORD_OF_THE_DAY);
  const [suggestedWords, setSuggestedWords] = useState<Word[]>(() =>
    deduplicateWords(INITIAL_SUGGESTED_WORDS)
  );

  const [userLists, setUserLists] = useState<WordList[]>(() => {
    const saved = localStorage.getItem('wordup_user_lists');
    if (saved) {
      try {
        const parsed: WordList[] = JSON.parse(saved);
        return parsed
          .filter((l) => l.id !== 'daily-commute')
          .map((l) => {
            const cleanWords = deduplicateWords(l.words || []);
            let title = l.title;
            if (l.id === 'favorites' && l.title === 'Favorites') {
              title = 'Favoriler';
            }
            if (l.id === 'review' && l.title === 'Review') {
              title = 'Tekrar Gözden Geçir';
            }
            if (l.id === 'struggle' && l.title === 'Words I Struggle With') {
              title = 'Zorlandığım Kelimeler';
            }
            return {
              ...l,
              title,
              words: cleanWords,
              count: cleanWords.length,
            };
          });
      } catch {
        return INITIAL_USER_LISTS;
      }
    }
    return INITIAL_USER_LISTS;
  });

  const [otherLists, setOtherLists] = useState<WordList[]>(OTHER_CURATED_LISTS);

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('wordup_profile');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('wordup_settings');
    return saved ? JSON.parse(saved) : INITIAL_APP_SETTINGS;
  });

  // Modal States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isAddWordOpen, setIsAddWordOpen] = useState(false);
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<WordList | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('wordup_words', JSON.stringify(words));
  }, [words]);

  useEffect(() => {
    localStorage.setItem('wordup_user_lists', JSON.stringify(userLists));
  }, [userLists]);

  useEffect(() => {
    localStorage.setItem('wordup_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('wordup_settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

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

    // Update Favorites List count and items safely without duplicates
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

    // Increment daily words learned
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

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      settings.darkMode ? 'bg-[#0b1320] text-slate-100' : 'bg-[#e9f1f5] text-slate-800'
    } flex justify-center py-0 sm:py-6`}>
      {/* Mobile container wrapper matching the exact phone dimensions & screenshots */}
      <div className={`w-full max-w-[430px] min-h-screen sm:min-h-[880px] sm:max-h-[92vh] flex flex-col transition-colors duration-200 sm:rounded-[36px] sm:shadow-2xl overflow-hidden relative ${
        settings.darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f3f7fa] text-slate-800'
      }`}>
        {/* Top Navbar */}
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          currentTab={currentTab}
          darkMode={settings.darkMode}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto px-5 pt-2">
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
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onChangeTab={(tab) => setCurrentTab(tab)}
          darkMode={settings.darkMode}
        />

        {/* Modals and Drawers */}
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
      </div>
    </div>
  );
}
