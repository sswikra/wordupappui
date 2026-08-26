import validWordsList from '../data/validGuessWords.json';

const VALID_5_LETTER_WORDS_SET = new Set<string>(validWordsList as string[]);

/**
 * Verilen 5 harfli kelimenin geçerli / anlamlı bir İngilizce kelime olup olmadığını denetler.
 */
export const isValid5LetterWord = (word: string): boolean => {
  if (!word || typeof word !== 'string') return false;
  const normalized = word.trim().toUpperCase();
  if (normalized.length !== 5) return false;
  return VALID_5_LETTER_WORDS_SET.has(normalized);
};
