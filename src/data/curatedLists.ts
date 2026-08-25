import { WordList } from '../types';
import { VOCABULARY_DATABASE, getWordsByList } from './vocabulary';

// Küratörlü Hazır Kelime Listeleri (A1-C2 & Sınav Listeleri)
export const OTHER_CURATED_LISTS: WordList[] = [
  {
    id: 'a1',
    title: 'A1 - Beginner',
    icon: 'book',
    count: VOCABULARY_DATABASE.filter((w) => w.level === 'A1').length,
    mastery: 0,
    description: 'Günlük hayatta en sık kullanılan temel kelimeler ve başlangıç ifadeleri.',
    color: '#10b981',
    words: VOCABULARY_DATABASE.filter((w) => w.level === 'A1'),
  },
  {
    id: 'a2',
    title: 'A2 - Elementary',
    icon: 'book',
    count: VOCABULARY_DATABASE.filter((w) => w.level === 'A2').length,
    mastery: 0,
    description: 'Rutin diyaloglar, alışveriş, yön tarifleri ve temel iletişim sözcükleri.',
    color: '#06b6d4',
    words: VOCABULARY_DATABASE.filter((w) => w.level === 'A2'),
  },
  {
    id: 'b1',
    title: 'B1 - Intermediate',
    icon: 'book',
    count: VOCABULARY_DATABASE.filter((w) => w.level === 'B1').length,
    mastery: 0,
    description: 'İş, okul ve sosyal hayatta rahatça iletişim kurabilmek için gerekli sözcükler.',
    color: '#3b82f6',
    words: VOCABULARY_DATABASE.filter((w) => w.level === 'B1'),
  },
  {
    id: 'b2',
    title: 'B2 - Upper Intermediate',
    icon: 'star',
    count: VOCABULARY_DATABASE.filter((w) => w.level === 'B2').length,
    mastery: 0,
    description: 'Karmaşık konuları tartışma, akıcı konuşma ve ileri düzey sözcükler.',
    color: '#8b5cf6',
    words: VOCABULARY_DATABASE.filter((w) => w.level === 'B2'),
  },
  {
    id: 'c1',
    title: 'C1 - Advanced',
    icon: 'sparkles',
    count: VOCABULARY_DATABASE.filter((w) => w.level === 'C1').length,
    mastery: 0,
    description: 'Akademik makaleler, zengin edebi metinler ve profesyonel yetkinlik kelimeleri.',
    color: '#ec4899',
    words: VOCABULARY_DATABASE.filter((w) => w.level === 'C1'),
  },
  {
    id: 'c2',
    title: 'C2 - Proficiency',
    icon: 'award',
    count: VOCABULARY_DATABASE.filter((w) => w.level === 'C2').length,
    mastery: 0,
    description: 'Ana dil düzeyinde üstün hakimiyet, incelikli nüanslar ve seçkin kelime haznesi.',
    color: '#e11d48',
    words: VOCABULARY_DATABASE.filter((w) => w.level === 'C2'),
  },
  {
    id: 'ielts',
    title: 'IELTS Academic & General',
    icon: 'graduation',
    count: VOCABULARY_DATABASE.filter((w) => w.lists?.includes('ielts') || w.lists?.includes('ielts-1000') || w.level === 'B2' || w.level === 'C1' || w.level === 'C2').length,
    mastery: 0,
    description: 'IELTS sınavında Band 7.0+ hedefleyenler için yüksek getirili akademik sözcükler.',
    color: '#f59e0b',
    words: VOCABULARY_DATABASE.filter((w) => w.lists?.includes('ielts') || w.lists?.includes('ielts-1000') || w.level === 'B2' || w.level === 'C1' || w.level === 'C2'),
  },
  {
    id: 'toefl',
    title: 'TOEFL iBT High-Yield',
    icon: 'graduation',
    count: VOCABULARY_DATABASE.filter((w) => w.lists?.includes('toefl') || w.lists?.includes('toefl-300') || w.lists?.includes('toefl-high') || w.level === 'B2' || w.level === 'C1' || w.level === 'C2').length,
    mastery: 0,
    description: 'TOEFL iBT sınavı okuma, dinleme ve yazma bölümlerinde en sık çıkan akademik sözcükler.',
    color: '#6366f1',
    words: VOCABULARY_DATABASE.filter((w) => w.lists?.includes('toefl') || w.lists?.includes('toefl-300') || w.lists?.includes('toefl-high') || w.level === 'B2' || w.level === 'C1' || w.level === 'C2'),
  },
];

// Kullanıcı Özel & Sistem Takip Listeleri
export const getCleanUserLists = (): WordList[] => [
  {
    id: 'favorites',
    title: 'Favoriler',
    icon: 'heart',
    count: 0,
    mastery: 0,
    description: 'Düzenli çalışmak için kalp ile işaretlediğiniz kelimeler.',
    color: '#d97706',
    words: [],
  },
  {
    id: 'review',
    title: 'Tekrar Gözden Geçir',
    icon: 'refresh',
    count: 0,
    mastery: 0,
    description: 'Aralıklı tekrar sistemindeki (Spaced Repetition) kelimeler.',
    color: '#3b82f6',
    words: [],
  },
  {
    id: 'struggle',
    title: 'Zorlandığım Kelimeler',
    icon: 'alert',
    count: 0,
    mastery: 0,
    description: 'Oyunlarda ve testlerde daha fazla dikkat gerektiren zorlayıcı kelimeler.',
    color: '#ef4444',
    words: [],
  },
];

export const INITIAL_USER_LISTS: WordList[] = getCleanUserLists();

