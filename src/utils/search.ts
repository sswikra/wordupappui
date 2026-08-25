import { Word } from '../types';

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

/**
 * Bir kelimenin arama sorgusuna uygunluk puanını (relevance score) hesaplar.
 * Alakasız veya kelime ortası alt dize eşleşmeleri (örneğin "terkedilmiş" içindeki "kedi", "toplum/olumlu" içindeki "lum") 0 puan alır.
 */
export const calculateWordScore = (
  word: Word,
  qNorm: NormalizedText,
  qTokens: TokenizedText
): number => {
  if (!qNorm.raw) return 0;

  let maxScore = 0;

  // 1. İngilizce Kelime Eşleşmesi (word.word)
  const wNorm = normalizeText(word.word);
  const wTokens = tokenize(word.word);

  if (wNorm.raw === qNorm.raw || wNorm.folded === qNorm.folded) {
    // Tam İngilizce kelime eşleşmesi (Örn: "cat" -> "cat")
    maxScore = Math.max(maxScore, 10000);
  } else if (wNorm.raw.startsWith(qNorm.raw) || wNorm.folded.startsWith(qNorm.folded)) {
    // Kelime başlangıç eşleşmesi (Örn: "lum" -> "luminous", "lump")
    const lengthDiff = Math.max(0, word.word.length - qNorm.raw.length);
    const score = 6000 - Math.min(1500, lengthDiff * 25);
    maxScore = Math.max(maxScore, score);
  } else if (
    wTokens.rawTokens.some((t) => t.startsWith(qNorm.raw)) ||
    wTokens.foldedTokens.some((t) => t.startsWith(qNorm.folded))
  ) {
    // Çoklu kelimede token başlangıç eşleşmesi (Örn: "up" -> "look up")
    maxScore = Math.max(maxScore, 4500);
  } else if (
    qNorm.raw.length >= 3 &&
    (wNorm.raw.includes(qNorm.raw) || wNorm.folded.includes(qNorm.folded))
  ) {
    // İngilizce kelime içi alt dize eşleşmesi (Yalnızca 3+ harf için, en düşük öncelik, örn: "press" -> "express", "lum" -> "slum")
    maxScore = Math.max(maxScore, 1500 - Math.min(400, word.word.length * 10));
  }

  // 2. Türkçe Çeviri Eşleşmesi (word.translation)
  if (word.translation) {
    const trNorm = normalizeText(word.translation);
    const trTokens = tokenize(word.translation);
    const phrases = word.translation
      .toLocaleLowerCase('tr-TR')
      .split(/[,;/]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    // Tam Türkçe çeviri eşleşmesi
    if (trNorm.raw === qNorm.raw || trNorm.folded === qNorm.folded) {
      maxScore = Math.max(maxScore, 9000);
    }
    // Virgülle ayrılmış ifadelerden birinde tam eşleşme (Örn: "kedi, evcil kedi" içinde "kedi")
    else if (
      phrases.some((p) => {
        const pNorm = normalizeText(p);
        return pNorm.raw === qNorm.raw || pNorm.folded === qNorm.folded;
      })
    ) {
      maxScore = Math.max(maxScore, 8500);
    }
    // Çeviri içindeki herhangi bir kelime token'ında tam eşleşme (Örn: "evcil kedi" içinde "kedi")
    else if (
      trTokens.rawTokens.some((t) => t === qNorm.raw) ||
      trTokens.foldedTokens.some((t) => t === qNorm.folded)
    ) {
      maxScore = Math.max(maxScore, 8000);
    }
    // Çeviri ifadesinin sorguyla başlaması (Örn: "terk" -> "terk edilmiş")
    else if (
      phrases.some((p) => {
        const pNorm = normalizeText(p);
        return pNorm.raw.startsWith(qNorm.raw) || pNorm.folded.startsWith(qNorm.folded);
      })
    ) {
      const lengthDiff = Math.max(0, word.translation.length - qNorm.raw.length);
      const score = 7000 - Math.min(1500, lengthDiff * 10);
      maxScore = Math.max(maxScore, score);
    }
    // Çevirideki herhangi bir kelimenin sorguyla başlaması (Örn: "terk" -> "terkedilmiş", "ked" -> "kedi")
    else if (
      trTokens.rawTokens.some((t) => t.startsWith(qNorm.raw)) ||
      trTokens.foldedTokens.some((t) => t.startsWith(qNorm.folded))
    ) {
      const lengthDiff = Math.max(0, word.translation.length - qNorm.raw.length);
      const score = 5500 - Math.min(1500, lengthDiff * 10);
      maxScore = Math.max(maxScore, score);
    }
    // Çok kelimeli Türkçe arama sorguları (Örn: "terk etmek")
    else if (qTokens.rawTokens.length > 1) {
      if (trNorm.raw.includes(qNorm.raw) || trNorm.folded.includes(qNorm.folded)) {
        maxScore = Math.max(maxScore, 5000);
      }
    }
    // DİKKAT: Türkçe kelimenin ortasındaki rastgele hece/harfler eşleştirilmez! ("terkedilmiş" içinde "kedi", "toplum" içinde "lum" 0 alır)
  }

  // 3. İngilizce Tanım Eşleşmesi (word.definition - Yalnızca 3+ karakter, kelime sınırında)
  if (word.definition && qNorm.raw.length >= 3) {
    const defTokens = tokenize(word.definition);
    if (
      defTokens.rawTokens.some((t) => t === qNorm.raw) ||
      defTokens.foldedTokens.some((t) => t === qNorm.folded)
    ) {
      maxScore = Math.max(maxScore, 800);
    } else if (
      defTokens.rawTokens.some((t) => t.startsWith(qNorm.raw)) ||
      defTokens.foldedTokens.some((t) => t.startsWith(qNorm.folded))
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
