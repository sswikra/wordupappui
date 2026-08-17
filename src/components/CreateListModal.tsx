import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { WordList } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateList: (list: WordList) => void;
  darkMode?: boolean;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  onCreateList,
  darkMode,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<WordList['icon']>('folder');
  const [selectedColor, setSelectedColor] = useState('#10b981');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newList: WordList = {
      id: `list-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Custom curated vocabulary list.',
      icon: selectedIcon,
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
          className={`relative w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl p-6 transition-colors ${
            darkMode ? 'bg-[#1e293b] text-slate-100' : 'bg-white text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#345c43]/15 text-[#1c472a] dark:text-[#7ba983] flex items-center justify-center">
                <FolderPlus className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-950 dark:text-white">Yeni Liste Oluştur</h3>
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
                Liste Adı *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn. YDS / YÖKDİL Kelimeleri, Tıp Terimleri"
                className={`w-full px-4 py-2.5 rounded-2xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-[#345c43] ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                    : 'bg-slate-100 border-slate-300 text-slate-950 placeholder:text-slate-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Açıklama
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Örn. Gelecek haftaki sınav için önemli kelimeler"
                className={`w-full px-4 py-2 rounded-2xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-[#345c43] ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                    : 'bg-slate-100 border-slate-300 text-slate-950 placeholder:text-slate-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Renk Teması
              </label>
              <div className="flex items-center gap-3">
                {['#345c43', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'].map(
                  (color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        selectedColor === color
                          ? 'ring-4 ring-offset-2 ring-slate-400 scale-110'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                    />
                  )
                )}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#345c43] hover:bg-[#2c4e39] text-white font-bold text-sm shadow-md transition-transform active:scale-98"
              >
                Liste Oluştur
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
