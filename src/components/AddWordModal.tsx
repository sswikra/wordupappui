import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { Word, PartOfSpeech, CEFRLevel, WordList } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWord: (word: Word, listId?: string) => void;
  userLists: WordList[];
  darkMode?: boolean;
}

export const AddWordModal: React.FC<AddWordModalProps> = ({
  isOpen,
  onClose,
  onAddWord,
  userLists,
  darkMode,
}) => {
  const [word, setWord] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [translation, setTranslation] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('Noun');
  const [level, setLevel] = useState<CEFRLevel>('B1');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [selectedListId, setSelectedListId] = useState<string>(userLists[0]?.id || 'favorites');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !translation.trim()) return;

    const newWord: Word = {
      id: `w-custom-${Date.now()}`,
      word: word.trim(),
      phonetic: phonetic.trim() || `/${word.trim().toLowerCase()}/`,
      partOfSpeech,
      level,
      translation: translation.trim(),
      definition: definition.trim() || `${word.trim()} in Turkish is ${translation.trim()}`,
      example: example.trim() || `Learning the word ${word.trim()} everyday.`,
      exampleTranslation: exampleTranslation.trim() || `Her gün ${word.trim()} kelimesini öğreniyorum.`,
      isFavorite: false,
      mastery: 0,
      lists: selectedListId ? [selectedListId] : [],
    };

    onAddWord(newWord, selectedListId);
    onClose();
    // Reset
    setWord('');
    setPhonetic('');
    setTranslation('');
    setDefinition('');
    setExample('');
    setExampleTranslation('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          className={`relative w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl p-6 transition-colors max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-[#1e293b] text-slate-100' : 'bg-white text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#345c43]/15 text-[#1c472a] dark:text-[#7ba983] flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-950 dark:text-white">Özel Kelime Ekle</h3>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${
                darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                İngilizce Kelime *
              </label>
              <input
                type="text"
                required
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Örn. Euphoria"
                className={`w-full px-4 py-2.5 rounded-2xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-[#345c43] ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                    : 'bg-slate-100 border-slate-300 text-slate-950 placeholder:text-slate-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Türkçe Anlamı *
              </label>
              <input
                type="text"
                required
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="Örn. Coşku, aşırı sevinç"
                className={`w-full px-4 py-2.5 rounded-2xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-[#345c43] ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                    : 'bg-slate-100 border-slate-300 text-slate-950 placeholder:text-slate-400'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Sözcük Türü
                </label>
                <select
                  value={partOfSpeech}
                  onChange={(e) => setPartOfSpeech(e.target.value as PartOfSpeech)}
                  className={`w-full px-3 py-2.5 rounded-2xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-[#345c43] ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-100 border-slate-300 text-slate-950'
                  }`}
                >
                  <option value="Noun">İsim (Noun)</option>
                  <option value="Verb">Fiil (Verb)</option>
                  <option value="Adj.">Sıfat (Adj.)</option>
                  <option value="Adv.">Zarf (Adv.)</option>
                  <option value="Phrase">Kalıp (Phrase)</option>
                  <option value="Idiom">Deyim (Idiom)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  CEFR Seviyesi
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as CEFRLevel)}
                  className={`w-full px-3 py-2.5 rounded-2xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-[#345c43] ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-100 border-slate-300 text-slate-950'
                  }`}
                >
                  <option value="A1">Seviye A1 (Başlangıç)</option>
                  <option value="A2">Seviye A2 (Temel)</option>
                  <option value="B1">Seviye B1 (Orta)</option>
                  <option value="B2">Seviye B2 (Orta-İleri)</option>
                  <option value="C1">Seviye C1 (İleri)</option>
                  <option value="C2">Seviye C2 (Uzman)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Listeye Ekle
              </label>
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-2xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-[#345c43] ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-100 border-slate-300 text-slate-950'
                }`}
              >
                {userLists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({l.words?.length || 0} kelime)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Örnek Cümle
              </label>
              <input
                type="text"
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder="Örn. He experienced sudden euphoria after winning."
                className={`w-full px-4 py-2 rounded-2xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-[#345c43] ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                    : 'bg-slate-100 border-slate-300 text-slate-950 placeholder:text-slate-400'
                }`}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#345c43] hover:bg-[#2c4e39] text-white font-bold text-sm shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Kelimeyi Kaydet</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
