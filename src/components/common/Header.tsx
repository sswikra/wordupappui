import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Menu, Search } from 'lucide-react-native';
import { TabType } from '../../types';
import { Colors, getTheme } from '../../theme/colors';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenSearch: () => void;
  currentTab: TabType;
  darkMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenSearch,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
      {/* Drawer Toggle */}
      <TouchableOpacity
        onPress={onOpenSidebar}
        style={[styles.iconButton, { backgroundColor: darkMode ? '#1e293b' : '#ffffff' }]}
        activeOpacity={0.7}
        accessibilityLabel="Menüyü aç"
      >
        <Menu size={22} color={darkMode ? '#94a3b8' : '#334155'} strokeWidth={2.2} />
      </TouchableOpacity>

      {/* Brand Title */}
      <View style={styles.titleContainer}>
        <Text style={[styles.logoText, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
          WordMem
        </Text>
      </View>

      {/* Search Button */}
      <TouchableOpacity
        onPress={onOpenSearch}
        style={[styles.iconButton, { backgroundColor: darkMode ? '#1e293b' : '#ffffff' }]}
        activeOpacity={0.7}
        accessibilityLabel="Kelimelerde ara"
      >
        <Search size={22} color={darkMode ? '#94a3b8' : '#334155'} strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
});
