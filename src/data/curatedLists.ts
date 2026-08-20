import { WordList } from '../types';
import { VOCABULARY_DATABASE, getWordsByList } from './vocabulary';

// Küratörlü Hazır Kelime Listeleri
export const OTHER_CURATED_LISTS: WordList[] = [
  {
    id: 'oxford-3000',
    title: 'Oxford 3000 Core',
    icon: 'book',
    count: 3000,
    mastery: 72,
    description: 'Günlük İngilizce akıcılığı ve sağlam temel için en kritik kelimeler.',
    color: '#8b5cf6',
    words: VOCABULARY_DATABASE.filter((w) => w.lists?.includes('oxford-3000') || w.level === 'A1' || w.level === 'A2'),
  },
  {
    id: 'toefl-high',
    title: 'TOEFL & IELTS High-Yield',
    icon: 'star',
    count: 500,
    mastery: 45,
    description: 'Akademik sınavlarda ve makalelerde en yüksek puanı getiren seçkin sözcükler.',
    color: '#ec4899',
    words: VOCABULARY_DATABASE.filter((w) => w.lists?.includes('toefl-high') || w.level === 'C1' || w.level === 'C2'),
  },
  {
    id: 'business-pro',
    title: 'Business & Tech English',
    icon: 'briefcase',
    count: 250,
    mastery: 60,
    description: 'Toplantılar, mülakatlar, müzakereler ve teknoloji dünyası için profesyonel terimler.',
    color: '#0284c7',
    words: VOCABULARY_DATABASE.filter((w) => w.lists?.includes('business-pro')),
  },
  {
    id: 'travel-essentials',
    title: 'Travel & Vacations',
    icon: 'plane',
    count: 180,
    mastery: 88,
    description: 'Havalimanı, otel, restoran ve yurt dışı seyahatlerinde hayat kurtaran kelimeler.',
    color: '#f59e0b',
    words: VOCABULARY_DATABASE.filter((w) => w.lists?.includes('travel-essentials')),
  },
];

// Kullanıcı Özel & Sistem Takip Listeleri
export const INITIAL_USER_LISTS: WordList[] = [
  {
    id: 'favorites',
    title: 'Favoriler',
    icon: 'heart',
    count: VOCABULARY_DATABASE.filter((w) => w.isFavorite || w.lists?.includes('favorites')).length,
    mastery: 85,
    description: 'Düzenli çalışmak için kalp ile işaretlediğiniz kelimeler.',
    color: '#d97706',
    words: VOCABULARY_DATABASE.filter((w) => w.isFavorite || w.lists?.includes('favorites')),
  },
  {
    id: 'review',
    title: 'Tekrar Gözden Geçir',
    icon: 'refresh',
    count: VOCABULARY_DATABASE.filter((w) => w.lists?.includes('review')).length,
    mastery: 40,
    description: 'Aralıklı tekrar sistemindeki (Spaced Repetition) kelimeler.',
    color: '#3b82f6',
    words: VOCABULARY_DATABASE.filter((w) => w.lists?.includes('review')),
  },
  {
    id: 'struggle',
    title: 'Zorlandığım Kelimeler',
    icon: 'alert',
    count: VOCABULARY_DATABASE.filter((w) => w.lists?.includes('struggle')).length,
    mastery: 15,
    description: 'Oyunlarda ve testlerde daha fazla dikkat gerektiren zorlayıcı kelimeler.',
    color: '#ef4444',
    words: VOCABULARY_DATABASE.filter((w) => w.lists?.includes('struggle')),
  },
];
