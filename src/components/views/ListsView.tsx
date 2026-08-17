import React, { useState } from 'react';
import { Heart, RotateCw, AlertTriangle, Bus, Plus, BookOpen, Star, Briefcase, Plane, Sparkles, Trash2 } from 'lucide-react';
import { WordList } from '../../types';
import { motion } from 'motion/react';

interface ListsViewProps {
  userLists: WordList[];
  otherLists: WordList[];
  onSelectList: (list: WordList) => void;
  onOpenCreateList: () => void;
  onDeleteList: (listId: string, isOtherTab?: boolean) => void;
  darkMode?: boolean;
}

export const ListsView: React.FC<ListsViewProps> = ({
  userLists,
  otherLists,
  onSelectList,
  onOpenCreateList,
  onDeleteList,
  darkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'my' | 'other'>('my');

  const getListIcon = (iconName: WordList['icon']) => {
    switch (iconName) {
      case 'heart':
        return <Heart className="w-5 h-5 text-[#c85a32] stroke-[2.2]" />;
      case 'refresh':
        return <RotateCw className="w-5 h-5 text-[#c89b3c] stroke-[2.2]" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-[#d94a4a] stroke-[2.2]" />;
      case 'bus':
        return <Bus className="w-5 h-5 text-[#345c43] stroke-[2.2]" />;
      case 'book':
        return <BookOpen className="w-5 h-5 text-indigo-500 stroke-[2.2]" />;
      case 'star':
        return <Star className="w-5 h-5 text-amber-500 stroke-[2.2]" />;
      case 'briefcase':
        return <Briefcase className="w-5 h-5 text-sky-500 stroke-[2.2]" />;
      case 'plane':
        return <Plane className="w-5 h-5 text-amber-600 stroke-[2.2]" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-600 stroke-[2.2]" />;
    }
  };

  const getIconBackground = (iconName: WordList['icon']) => {
    switch (iconName) {
      case 'heart':
        return 'bg-[#ffeedd] dark:bg-rose-950/50';
      case 'refresh':
        return 'bg-[#fff5dc] dark:bg-amber-950/50';
      case 'alert':
        return 'bg-[#ffebec] dark:bg-red-950/50';
      case 'bus':
        return 'bg-[#e2eff2] dark:bg-slate-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  const displayedLists = activeTab === 'my' ? userLists : otherLists;

  return (
    <div className="space-y-4 pb-28 relative min-h-[580px] animate-fadeIn">
      {/* Top Tabs matching Screen 3: My Lists | Other Lists */}
      <div className="p-1">
        <div className={`p-1.5 rounded-full flex items-center shadow-inner ${
          darkMode ? 'bg-slate-800' : 'bg-[#dce9ef]'
        }`}>
          <button
            id="tab-my-lists"
            onClick={() => setActiveTab('my')}
            className={`flex-1 py-2.5 rounded-full font-extrabold text-xs transition-all ${
              activeTab === 'my'
                ? 'bg-white dark:bg-slate-900 text-[#345c43] dark:text-[#7ba983] shadow-sm'
                : 'text-[#345c43] dark:text-[#7ba983] opacity-75 hover:opacity-100'
            }`}
          >
            Listelerim
          </button>
          <button
            id="tab-other-lists"
            onClick={() => setActiveTab('other')}
            className={`flex-1 py-2.5 rounded-full font-extrabold text-xs transition-all ${
              activeTab === 'other'
                ? 'bg-white dark:bg-slate-900 text-[#345c43] dark:text-[#7ba983] shadow-sm'
                : 'text-[#345c43] dark:text-[#7ba983] opacity-75 hover:opacity-100'
            }`}
          >
            Diğer Listeler
          </button>
        </div>
      </div>

      {/* List of Word Lists matching Screen 3 */}
      <div className="space-y-3 pt-1">
        {displayedLists.map((list) => (
          <div
            key={list.id}
            id={`list-card-${list.id}`}
            onClick={() => onSelectList(list)}
            className={`p-5 rounded-[28px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border cursor-pointer transition-all ${
              darkMode
                ? 'bg-[#1e293b] border-slate-800 hover:border-slate-700'
                : 'bg-white border-slate-100/80 hover:shadow-md'
            }`}
          >
            {/* Top row: Icon + Title + (Percentage & Delete List) */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                {/* White background icon container */}
                <div className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm">
                  {getListIcon(list.icon)}
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-[#345c43] dark:text-[#7ba983] tracking-tight truncate">
                    {list.title}
                  </h3>
                  <span className="inline-block mt-0.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#d8ebee] text-[#345c43] dark:bg-slate-800 dark:text-[#7ba983]">
                    {list.count || list.words?.length || 0} Kelime
                  </span>
                </div>
              </div>

              {/* Percentage mastery number and Delete List button */}
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-sm font-extrabold text-[#345c43] dark:text-[#7ba983]">
                  %{list.mastery}
                </span>
                <button
                  type="button"
                  id={`delete-list-btn-${list.id}`}
                  title="Listeyi Sil"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteList(list.id, activeTab === 'other');
                  }}
                  className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95 transition-all"
                >
                  <Trash2 className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Olive Green Mastery Progress Bar */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${list.mastery}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-[#345c43] dark:bg-[#5b8768] rounded-full"
              />
            </div>
          </div>
        ))}

        {/* "+ Yeni Liste Ekle" Card with dashed border matching home screen add word card */}
        {activeTab === 'my' && (
          <div
            id="lists-add-list-card"
            onClick={onOpenCreateList}
            className={`p-5 rounded-[28px] cursor-pointer transition-all flex flex-col justify-center items-center text-center min-h-[105px] border-2 border-dashed ${
              darkMode
                ? 'border-[#345c43]/80 hover:border-[#7ba983] bg-slate-900/50 hover:bg-slate-900/80'
                : 'border-[#345c43]/60 hover:border-[#345c43] bg-emerald-50/30 hover:bg-emerald-50/50'
            }`}
          >
            <div className="w-9 h-9 rounded-full border-2 border-current text-[#345c43] dark:text-[#7ba983] flex items-center justify-center mb-1.5">
              <Plus className="w-5 h-5 stroke-[2.8]" />
            </div>
            <span className="text-xs font-extrabold text-[#345c43] dark:text-[#7ba983]">
              Yeni Liste Ekle
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
