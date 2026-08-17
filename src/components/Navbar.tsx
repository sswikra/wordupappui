import React from 'react';
import { Menu, Search } from 'lucide-react';
import { TabType } from '../types';

interface NavbarProps {
  onOpenSidebar: () => void;
  onOpenSearch: () => void;
  currentTab: TabType;
  darkMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar, onOpenSearch, darkMode }) => {
  return (
    <header className={`sticky top-0 z-30 flex items-center justify-between px-5 pt-4 pb-3 transition-colors duration-200 ${
      darkMode ? 'bg-[#0f172a]/95 text-slate-100 backdrop-blur-md' : 'bg-[#f3f7fa]/95 text-slate-800 backdrop-blur-md'
    }`}>
      {/* Hamburger Menu Button */}
      <button
        id="navbar-menu-btn"
        onClick={onOpenSidebar}
        aria-label="Open menu"
        className={`p-2.5 rounded-2xl transition-transform active:scale-95 ${
          darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-white/80 text-slate-700'
        }`}
      >
        <Menu className="w-6 h-6 stroke-[2.2]" />
      </button>

      {/* Brand Logo matching screenshots */}
      <div className="flex items-center justify-center">
        <span
          id="navbar-logo"
          className="text-[32px] font-extrabold tracking-tight text-[#345c43] dark:text-[#7ba983] select-none"
          style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
        >
          WordMem
        </span>
      </div>

      {/* Search Button */}
      <button
        id="navbar-search-btn"
        onClick={onOpenSearch}
        aria-label="Search words"
        className={`p-2.5 rounded-2xl transition-transform active:scale-95 ${
          darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-white/80 text-slate-700'
        }`}
      >
        <Search className="w-6 h-6 stroke-[2.2]" />
      </button>
    </header>
  );
};
