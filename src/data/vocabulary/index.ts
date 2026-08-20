import { Word, CEFRLevel } from '../../types';
import { WORDS_A1 } from './wordsA1';
import { WORDS_A2 } from './wordsA2';
import { WORDS_B1 } from './wordsB1';
import { WORDS_B2 } from './wordsB2';
import { WORDS_C1_C2 } from './wordsC1C2';
import expandedData from '../expandedVocabulary.json';

export { WORDS_A1, WORDS_A2, WORDS_B1, WORDS_B2, WORDS_C1_C2 };

// 1.567 kelimelik tam kapsamlı veritabanı
export const VOCABULARY_DATABASE: Word[] = (expandedData && expandedData.length > 0)
  ? (expandedData as Word[])
  : [
      ...WORDS_A1,
      ...WORDS_A2,
      ...WORDS_B1,
      ...WORDS_B2,
      ...WORDS_C1_C2,
    ];

// Seviyeye göre kelimeleri getiren yardımcı fonksiyon
export const getWordsByLevel = (level: CEFRLevel): Word[] => {
  return VOCABULARY_DATABASE.filter((w) => w.level === level);
};

// Liste ID'sine göre kelimeleri getiren yardımcı fonksiyon
export const getWordsByList = (listId: string): Word[] => {
  return VOCABULARY_DATABASE.filter((w) => w.lists?.includes(listId));
};

// Kelime ID'sine göre kelime getiren yardımcı fonksiyon
export const getWordById = (id: string): Word | undefined => {
  return VOCABULARY_DATABASE.find((w) => w.id === id);
};
