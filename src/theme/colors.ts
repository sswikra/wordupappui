export const Colors = {
  primary: '#345c43',
  primaryLight: '#d8ebee',
  primaryDark: '#1c472a',
  primaryAccent: '#7ba983',
  primaryPill: '#6e9671',

  accentOrange: '#c46210',
  accentOrangeLight: '#fff8f0',
  accentOrangeDark: '#f39c12',

  accentGold: '#c89b3c',
  accentGoldHover: '#b88c32',
  accentGoldLight: '#fef3e2',

  danger: '#e11d48',
  dangerLight: '#ffe4e6',

  success: '#10b981',
  successLight: '#d1fae5',

  // Light Theme
  light: {
    background: '#f3f7fa',
    cardBackground: '#ffffff',
    cardBorder: '#e2edf2',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#64748b',
    textBrand: '#345c43',
    navBackground: 'rgba(255, 255, 255, 0.95)',
    navBorder: '#e2e8f0',
    inputBackground: '#e5eff3',
    divider: '#e2e8f0',
    subtleBg: '#f8fafc',
  },

  // Dark Theme
  dark: {
    background: '#0f172a',
    cardBackground: '#1e293b',
    cardBorder: '#334155',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    textBrand: '#7ba983',
    navBackground: 'rgba(15, 23, 42, 0.95)',
    navBorder: '#334155',
    inputBackground: '#1e293b',
    divider: '#334155',
    subtleBg: '#1e293b',
  },
};

export const getTheme = (darkMode: boolean) => (darkMode ? Colors.dark : Colors.light);
