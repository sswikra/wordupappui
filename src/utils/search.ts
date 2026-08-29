import type { Word } from '../types';

export interface NormalizedText {
  raw: string;
  folded: string;
}

export interface TokenizedText {
  rawTokens: string[];
  foldedTokens: string[];
}

/**
 * Türkçe ve özel Latin karakterleri ASCII eşdeğerlerine dönüştürür (Aksan/karakter katlama).
 */
export const foldAccents = (str: string): string => {
  return str
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİI]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u')
    .replace(/[âÂ]/g, 'a')
    .replace(/[îÎ]/g, 'i')
    .replace(/[ûÛ]/g, 'u');
};

/**
 * Metni hem Türkçe küçük harfe hem de aksansız katlanmış küçük harfe dönüştürür.
 */
export const normalizeText = (text: string | undefined | null): NormalizedText => {
  if (!text) return { raw: '', folded: '' };
  const raw = text.trim().toLocaleLowerCase('tr-TR');
  const folded = foldAccents(raw);
  return { raw, folded };
};

/**
 * Metni noktalama işaretleri ve boşluklara göre kelime token'larına ayırır.
 */
export const tokenize = (text: string | undefined | null): TokenizedText => {
  if (!text) return { rawTokens: [], foldedTokens: [] };
  const parts = text
    .toLocaleLowerCase('tr-TR')
    .split(/[\s,;/()\-–—.:!?\[\]"'`~@#$%^&*+=\\]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const rawTokens = parts;
  const foldedTokens = parts.map((p) => foldAccents(p));
  return { rawTokens, foldedTokens };
};

interface CachedWordMeta {
  wNormRaw: string;
  wNormFolded: string;
  wTokensRaw: string[];
  wTokensFolded: string[];
  trNormRaw: string;
  trNormFolded: string;
  trTokensRaw: string[];
  trTokensFolded: string[];
  trPhrasesRaw: string[];
  trPhrasesFolded: string[];
  defTokensRaw?: string[];
  defTokensFolded?: string[];
}

const wordMetaCache = new Map<string, CachedWordMeta>();

export const getWordSearchMeta = (word: Word): CachedWordMeta => {
  const cached = wordMetaCache.get(word.id);
  if (cached) return cached;

  const wNorm = normalizeText(word.word);
  const wTok = tokenize(word.word);
  const trNorm = normalizeText(word.translation);
  const trTok = tokenize(word.translation);

  const rawPhrases = (word.translation || '')
    .toLocaleLowerCase('tr-TR')
    .split(/[,;/]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const trPhrasesRaw = rawPhrases;
  const trPhrasesFolded = rawPhrases.map((p) => foldAccents(p));

  let defTokensRaw: string[] | undefined;
  let defTokensFolded: string[] | undefined;
  if (word.definition) {
    const defTok = tokenize(word.definition);
    defTokensRaw = defTok.rawTokens;
    defTokensFolded = defTok.foldedTokens;
  }

  const meta: CachedWordMeta = {
    wNormRaw: wNorm.raw,
    wNormFolded: wNorm.folded,
    wTokensRaw: wTok.rawTokens,
    wTokensFolded: wTok.foldedTokens,
    trNormRaw: trNorm.raw,
    trNormFolded: trNorm.folded,
    trTokensRaw: trTok.rawTokens,
    trTokensFolded: trTok.foldedTokens,
    trPhrasesRaw,
    trPhrasesFolded,
    defTokensRaw,
    defTokensFolded,
  };

  wordMetaCache.set(word.id, meta);
  return meta;
};

/**
 * Uygulama açılışında kelime arama önbelleğini arka planda ısıtır.
 * Böylece kullanıcı ilk harfi yazdığında arama 0 ms gecikmeyle anında sonuç verir.
 */
export const warmupSearchCache = (words: Word[]): void => {
  if (!words || words.length === 0) return;
  const len = words.length;
  for (let i = 0; i < len; i++) {
    const w = words[i];
    if (w && w.id && !wordMetaCache.has(w.id)) {
      getWordSearchMeta(w);
    }
  }
};

/**
 * Bir kelimenin arama sorgusuna uygunluk puanını (relevance score) hesaplar.
 * Önbellekli meta ile 1 mikrosaniyede hesaplar.
 */
export const calculateWordScore = (
  word: Word,
  qNorm: NormalizedText,
  qTokens: TokenizedText
): number => {
  if (!qNorm.raw) return 0;

  const meta = getWordSearchMeta(word);
  let maxScore = 0;

  // 1. İngilizce Kelime Eşleşmesi (word.word)
  if (meta.wNormRaw === qNorm.raw || meta.wNormFolded === qNorm.folded) {
    maxScore = 10000;
  } else if (meta.wNormRaw.startsWith(qNorm.raw) || meta.wNormFolded.startsWith(qNorm.folded)) {
    const lengthDiff = Math.max(0, word.word.length - qNorm.raw.length);
    const score = 6000 - Math.min(1500, lengthDiff * 25);
    maxScore = Math.max(maxScore, score);
  } else if (
    meta.wTokensRaw.some((t) => t.startsWith(qNorm.raw)) ||
    meta.wTokensFolded.some((t) => t.startsWith(qNorm.folded))
  ) {
    maxScore = Math.max(maxScore, 4500);
  } else if (
    qNorm.raw.length >= 3 &&
    (meta.wNormRaw.includes(qNorm.raw) || meta.wNormFolded.includes(qNorm.folded))
  ) {
    maxScore = Math.max(maxScore, 1500 - Math.min(400, word.word.length * 10));
  }

  // 2. Türkçe Çeviri Eşleşmesi (word.translation)
  if (meta.trNormRaw) {
    if (meta.trNormRaw === qNorm.raw || meta.trNormFolded === qNorm.folded) {
      maxScore = Math.max(maxScore, 9000);
    } else if (
      meta.trPhrasesRaw.some((p) => p === qNorm.raw) ||
      meta.trPhrasesFolded.some((p) => p === qNorm.folded)
    ) {
      maxScore = Math.max(maxScore, 8500);
    } else if (
      meta.trTokensRaw.some((t) => t === qNorm.raw) ||
      meta.trTokensFolded.some((t) => t === qNorm.folded)
    ) {
      maxScore = Math.max(maxScore, 8000);
    } else if (
      meta.trPhrasesRaw.some((p) => p.startsWith(qNorm.raw)) ||
      meta.trPhrasesFolded.some((p) => p.startsWith(qNorm.folded))
    ) {
      const lengthDiff = Math.max(0, (word.translation || '').length - qNorm.raw.length);
      const score = 7000 - Math.min(1500, lengthDiff * 10);
      maxScore = Math.max(maxScore, score);
    } else if (
      meta.trTokensRaw.some((t) => t.startsWith(qNorm.raw)) ||
      meta.trTokensFolded.some((t) => t.startsWith(qNorm.folded))
    ) {
      const lengthDiff = Math.max(0, (word.translation || '').length - qNorm.raw.length);
      const score = 5500 - Math.min(1500, lengthDiff * 10);
      maxScore = Math.max(maxScore, score);
    } else if (qTokens.rawTokens.length > 1) {
      if (meta.trNormRaw.includes(qNorm.raw) || meta.trNormFolded.includes(qNorm.folded)) {
        maxScore = Math.max(maxScore, 5000);
      }
    }
  }

  // 3. İngilizce Tanım Eşleşmesi (word.definition - Yalnızca 3+ karakter, kelime sınırında)
  if (meta.defTokensRaw && qNorm.raw.length >= 3) {
    if (
      meta.defTokensRaw.some((t) => t === qNorm.raw) ||
      (meta.defTokensFolded && meta.defTokensFolded.some((t) => t === qNorm.folded))
    ) {
      maxScore = Math.max(maxScore, 800);
    } else if (
      meta.defTokensRaw.some((t) => t.startsWith(qNorm.raw)) ||
      (meta.defTokensFolded && meta.defTokensFolded.some((t) => t.startsWith(qNorm.folded)))
    ) {
      maxScore = Math.max(maxScore, 500);
    }
  }

  return maxScore;
};

export interface SearchOptions {
  levelFilter?: string; // 'ALL' | 'FAVORITES' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}

/**
 * Kelime listesini arar, puanlar ve en alakalıdan en aza doğru sıralar.
 */
export const searchWords = (
  words: Word[],
  query: string,
  options?: SearchOptions
): Word[] => {
  if (!words || words.length === 0) return [];

  const cleanQuery = (query || '').trim();
  const levelFilter = options?.levelFilter || 'ALL';

  // Seviye veya favori filtresi
  const baseWords = words.filter((w) => {
    if (!w || !w.id) return false;
    if (levelFilter === 'ALL') return true;
    if (levelFilter === 'FAVORITES') return !!w.isFavorite;
    return w.level === levelFilter;
  });

  // Sorgu boşsa seviyeye göre filtrelenmiş tekil kelimeleri dön
  if (!cleanQuery) {
    const seen = new Set<string>();
    return baseWords.filter((w) => {
      if (seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });
  }

  const qNorm = normalizeText(cleanQuery);
  const qTokens = tokenize(cleanQuery);

  const scoredItems: { word: Word; score: number }[] = [];
  const seen = new Set<string>();

  for (const w of baseWords) {
    if (seen.has(w.id)) continue;
    const score = calculateWordScore(w, qNorm, qTokens);
    if (score > 0) {
      seen.add(w.id);
      scoredItems.push({ word: w, score });
    }
  }

  // Puan azalan, kelime uzunluğu artan, alfabetik artan
  scoredItems.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (a.word.word.length !== b.word.word.length) {
      return a.word.word.length - b.word.word.length;
    }
    return a.word.word.localeCompare(b.word.word, 'en');
  });

  return scoredItems.map((item) => item.word);
};
