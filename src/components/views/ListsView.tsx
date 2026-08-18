import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Heart,
  RotateCw,
  AlertTriangle,
  Bus,
  Plus,
  BookOpen,
  Star,
  Briefcase,
  Plane,
  Sparkles,
  Trash2,
  Folder,
} from 'lucide-react-native';
import { WordList } from '../../types';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';

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
  darkMode = false,
}) => {
  const theme = getTheme(darkMode);
  const [activeTab, setActiveTab] = useState<'my' | 'other'>('my');

  const getListIcon = (iconName: WordList['icon']) => {
    switch (iconName) {
      case 'heart':
        return <Heart size={20} color="#c85a32" strokeWidth={2.2} />;
      case 'refresh':
        return <RotateCw size={20} color="#c89b3c" strokeWidth={2.2} />;
      case 'alert':
        return <AlertTriangle size={20} color="#d94a4a" strokeWidth={2.2} />;
      case 'bus':
        return <Bus size={20} color={Colors.primary} strokeWidth={2.2} />;
      case 'book':
        return <BookOpen size={20} color="#6366f1" strokeWidth={2.2} />;
      case 'star':
        return <Star size={20} color="#f59e0b" strokeWidth={2.2} />;
      case 'briefcase':
        return <Briefcase size={20} color="#0284c7" strokeWidth={2.2} />;
      case 'plane':
        return <Plane size={20} color="#d97706" strokeWidth={2.2} />;
      case 'folder':
      default:
        return <Folder size={20} color={Colors.primary} strokeWidth={2.2} />;
    }
  };

  const displayedLists = activeTab === 'my' ? userLists : otherLists;

  const confirmDelete = (listId: string, title: string) => {
    HapticsService.light();
    Alert.alert(
      'Listeyi Sil',
      `"${title}" listesini silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            HapticsService.medium();
            onDeleteList(listId, activeTab === 'other');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Segmented Tab (Listelerim | Diğer Listeler) */}
      <View style={[styles.tabSegment, { backgroundColor: darkMode ? '#1e293b' : '#dce9ef' }]}>
        <TouchableOpacity
          onPress={() => {
            HapticsService.selection();
            setActiveTab('my');
          }}
          activeOpacity={0.8}
          style={[
            styles.segmentBtn,
            activeTab === 'my' && [
              styles.activeSegmentBtn,
              { backgroundColor: darkMode ? '#0f172a' : '#ffffff' },
            ],
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              { color: darkMode ? Colors.primaryAccent : Colors.primary },
            ]}
          >
            Listelerim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            HapticsService.selection();
            setActiveTab('other');
          }}
          activeOpacity={0.8}
          style={[
            styles.segmentBtn,
            activeTab === 'other' && [
              styles.activeSegmentBtn,
              { backgroundColor: darkMode ? '#0f172a' : '#ffffff' },
            ],
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              { color: darkMode ? Colors.primaryAccent : Colors.primary },
            ]}
          >
            Diğer Listeler
          </Text>
        </TouchableOpacity>
      </View>

      {/* Word Lists Cards */}
      <View style={styles.listsWrapper}>
        {displayedLists.map((list) => (
          <TouchableOpacity
            key={list.id}
            onPress={() => {
              HapticsService.selection();
              onSelectList(list);
            }}
            activeOpacity={0.85}
            style={[
              styles.listCard,
              {
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                borderColor: theme.cardBorder,
              },
            ]}
          >
            {/* Top Row: Icon + Title & Badge + (Percentage & Delete) */}
            <View style={styles.cardTopRow}>
              <View style={styles.titleInfo}>
                <View style={[styles.iconBox, { backgroundColor: darkMode ? '#0f172a' : '#f8fafc', borderColor: theme.cardBorder }]}>
                  {getListIcon(list.icon)}
                </View>

                <View style={styles.textColumn}>
                  <Text style={[styles.listTitle, { color: darkMode ? Colors.primaryAccent : Colors.primary }]} numberOfLines={1}>
                    {list.title}
                  </Text>
                  <View style={[styles.countBadge, { backgroundColor: darkMode ? '#334155' : '#d8ebee' }]}>
                    <Text style={[styles.countText, { color: darkMode ? Colors.primaryAccent : Colors.primaryDark }]}>
                      {list.words?.length || list.count || 0} Kelime
                    </Text>
                  </View>
                </View>
              </View>

              {/* Mastery & Delete action */}
              <View style={styles.actionRow}>
                <Text style={[styles.masteryText, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                  %{list.mastery}
                </Text>
                <TouchableOpacity
                  onPress={() => confirmDelete(list.id, list.title)}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={16} color={darkMode ? '#94a3b8' : '#94a3b8'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Progress Track */}
            <View style={[styles.progressTrack, { backgroundColor: darkMode ? '#334155' : '#e2e8f0' }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${list.mastery}%`,
                    backgroundColor: darkMode ? Colors.primaryAccent : Colors.primary,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        ))}

        {/* "+ Yeni Liste Ekle" Card */}
        {activeTab === 'my' && (
          <TouchableOpacity
            onPress={() => {
              HapticsService.selection();
              onOpenCreateList();
            }}
            activeOpacity={0.8}
            style={[
              styles.addListCard,
              {
                backgroundColor: darkMode ? 'rgba(52, 92, 67, 0.15)' : 'rgba(52, 92, 67, 0.04)',
                borderColor: darkMode ? 'rgba(123, 169, 131, 0.5)' : 'rgba(52, 92, 67, 0.4)',
              },
            ]}
          >
            <View style={[styles.addIconRing, { borderColor: darkMode ? Colors.primaryAccent : Colors.primary }]}>
              <Plus size={20} color={darkMode ? Colors.primaryAccent : Colors.primary} strokeWidth={2.8} />
            </View>
            <Text style={[styles.addListText, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
              Yeni Liste Ekle
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 110,
  },
  tabSegment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 24,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeSegmentBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '800',
  },
  listsWrapper: {
    gap: 12,
  },
  listCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  countBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 10,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  masteryText: {
    fontSize: 14,
    fontWeight: '900',
  },
  deleteBtn: {
    padding: 6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  addListCard: {
    borderRadius: 26,
    borderWidth: 2,
    borderStyle: 'dashed',
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addIconRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addListText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
