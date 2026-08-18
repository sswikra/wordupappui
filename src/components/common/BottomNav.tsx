import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Gamepad2, ListOrdered, User, Settings, LucideIcon } from 'lucide-react-native';
import { TabType } from '../../types';
import { Colors, getTheme } from '../../theme/colors';
import { HapticsService } from '../../utils/haptics';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  darkMode?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);
  const insets = useSafeAreaInsets();

  const tabs: { id: TabType; label: string; icon: LucideIcon }[] = [
    { id: 'home', label: 'Ana Sayfa', icon: Home },
    { id: 'games', label: 'Oyunlar', icon: Gamepad2 },
    { id: 'lists', label: 'Listeler', icon: ListOrdered },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  const handleTabPress = (tabId: TabType) => {
    if (tabId !== currentTab) {
      HapticsService.selection();
      onChangeTab(tabId);
    }
  };

  const activeColor = darkMode ? Colors.primaryAccent : Colors.primary;
  const inactiveColor = darkMode ? '#94a3b8' : '#64748b';
  const activeIconBg = darkMode ? 'rgba(123, 169, 131, 0.22)' : 'rgba(52, 92, 67, 0.12)';

  const bottomPadding = Platform.OS === 'ios'
    ? Math.max(insets.bottom, 18)
    : Math.max(insets.bottom, 10);

  return (
    <View
      style={[
        styles.navContainer,
        {
          paddingBottom: bottomPadding,
          borderTopColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 237, 242, 0.8)',
        },
      ]}
    >
      {/* Frosted Glass Blur Effect */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 75 : 90}
        tint={darkMode ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle Semi-Transparent Color Overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: darkMode
              ? 'rgba(15, 23, 42, 0.72)'
              : 'rgba(255, 255, 255, 0.82)',
          },
        ]}
      />

      {/* Navigation Tab Items */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.7}
              style={styles.tabItem}
            >
              {/* Soft Oval / Round Icon Container */}
              <View
                style={[
                  styles.iconWrapper,
                  isActive && { backgroundColor: activeIconBg },
                ]}
              >
                <Icon
                  size={21}
                  color={isActive ? activeColor : inactiveColor}
                  strokeWidth={isActive ? 2.4 : 2}
                />
              </View>

              {/* Tab Label */}
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? activeColor : inactiveColor,
                    fontWeight: isActive ? '700' : '600',
                  },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>

              {/* Dot Indicator beneath tab */}
              <View
                style={[
                  styles.dotIndicator,
                  {
                    backgroundColor: isActive ? activeColor : 'transparent',
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minWidth: 60,
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10.5,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});
