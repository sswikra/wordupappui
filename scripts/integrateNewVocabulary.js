/**
 * WordMem Full Vocabulary Integration Script
 * Integrates:
 * - File 1: C1 Vocabulary (500 words)
 * - File 2: C2 Vocabulary (500 words)
 * - File 3: TOEFL & Academic / AWL / Transitions (286 words)
 * - File 4: IELTS 1000 Vocabulary (609 words)
 * 
 * Merges with existing A1, A2, B1, B2 and master expandedVocabulary.json
 */

const fs = require('fs');
const path = require('path');

const f1Path = 'C:/Users/MSİ/.gemini/antigravity/brain/1655d51a-6adb-48a3-8d62-82cb7377752c/.user_uploaded/media_1787638496582.json';
const f2Path = 'C:/Users/MSİ/.gemini/antigravity/brain/1655d51a-6adb-48a3-8d62-82cb7377752c/.user_uploaded/media_1787638496588.json';
const f3Path = 'C:/Users/MSİ/.gemini/antigravity/brain/1655d51a-6adb-48a3-8d62-82cb7377752c/.user_uploaded/media_1787638496594.json';
const f4Path = 'C:/Users/MSİ/.gemini/antigravity/brain/1655d51a-6adb-48a3-8d62-82cb7377752c/.user_uploaded/media_1787638496632.json';

const f1Words = JSON.parse(fs.readFileSync(f1Path, 'utf8')).words;
const f2Words = JSON.parse(fs.readFileSync(f2Path, 'utf8')).words;
const f3Words = JSON.parse(fs.readFileSync(f3Path, 'utf8')).words;
const f4Words = JSON.parse(fs.readFileSync(f4Path, 'utf8')).words;

const vocabDir = path.join(__dirname, '..', 'src', 'data', 'vocabulary');

// Helper to extract word array from existing ts file
function readTsVocab(filename, exportName) {
  const filePath = path.join(vocabDir, filename);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const start = content.indexOf('= [') + 2;
  const end = content.lastIndexOf('];') + 1;
  if (start > 1 && end > start) {
    return eval(content.substring(start, end));
  }
  return [];
}

const existingA1 = readTsVocab('wordsA1.ts', 'WORDS_A1');
const existingA2 = readTsVocab('wordsA2.ts', 'WORDS_A2');
const existingB1 = readTsVocab('wordsB1.ts', 'WORDS_B1');
const existingB2 = readTsVocab('wordsB2.ts', 'WORDS_B2');
const existingExp = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'expandedVocabulary.json'), 'utf8'));

console.log('Loaded existing data:');
console.log(`- A1: ${existingA1.length}`);
console.log(`- A2: ${existingA2.length}`);
console.log(`- B1: ${existingB1.length}`);
console.log(`- B2: ${existingB2.length}`);
console.log(`- Expanded: ${existingExp.length}`);

// Normalize and merge word objects
function cleanWord(w) {
  return {
    id: w.id || `w-${w.word.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    word: w.word.trim(),
    partOfSpeech: w.partOfSpeech || 'Noun',
    phonetic: w.phonetic || '',
    level: w.level || 'B1',
    lists: Array.from(new Set(w.lists || [])).filter(Boolean),
    definition: w.definition ? w.definition.trim() : '',
    translation: w.translation ? w.translation.trim() : '',
    example: w.example ? w.example.trim() : '',
    exampleTranslation: w.exampleTranslation ? w.exampleTranslation.trim() : '',
    synonyms: Array.from(new Set(w.synonyms || [])).filter(Boolean),
    mastery: typeof w.mastery === 'number' ? w.mastery : 0,
    ...(w.isFavorite ? { isFavorite: true } : {}),
  };
}

function mergeWord(target, source) {
  const mergedLists = Array.from(new Set([...(target.lists || []), ...(source.lists || [])]));
  const mergedSynonyms = Array.from(new Set([...(target.synonyms || []), ...(source.synonyms || [])]));
  return {
    ...target,
    ...source,
    lists: mergedLists,
    synonyms: mergedSynonyms,
    translation: source.translation || target.translation,
    definition: source.definition || target.definition,
    example: source.example || target.example,
    exampleTranslation: source.exampleTranslation || target.exampleTranslation,
    phonetic: source.phonetic || target.phonetic,
    partOfSpeech: source.partOfSpeech || target.partOfSpeech,
    mastery: target.mastery || source.mastery || 0,
    ...(target.isFavorite || source.isFavorite ? { isFavorite: true } : {}),
  };
}

// 1. Build C1 Map
const c1Map = new Map();
f1Words.forEach(w => c1Map.set(w.id, cleanWord(w)));
[...f3Words, ...f4Words].filter(w => w.level === 'C1').forEach(w => {
  const cleaned = cleanWord(w);
  if (c1Map.has(cleaned.id)) {
    c1Map.set(cleaned.id, mergeWord(c1Map.get(cleaned.id), cleaned));
  } else {
    c1Map.set(cleaned.id, cleaned);
  }
});

// 2. Build C2 Map
const c2Map = new Map();
f2Words.forEach(w => c2Map.set(w.id, cleanWord(w)));
[...f3Words, ...f4Words].filter(w => w.level === 'C2').forEach(w => {
  const cleaned = cleanWord(w);
  if (c2Map.has(cleaned.id)) {
    c2Map.set(cleaned.id, mergeWord(c2Map.get(cleaned.id), cleaned));
  } else {
    c2Map.set(cleaned.id, cleaned);
  }
});

// 3. Update A1 Map
const a1Map = new Map();
existingA1.forEach(w => a1Map.set(w.id, cleanWord(w)));
[...f3Words, ...f4Words].filter(w => w.level === 'A1').forEach(w => {
  const cleaned = cleanWord(w);
  if (a1Map.has(cleaned.id)) {
    a1Map.set(cleaned.id, mergeWord(a1Map.get(cleaned.id), cleaned));
  } else {
    a1Map.set(cleaned.id, cleaned);
  }
});

// 4. Update A2 Map
const a2Map = new Map();
existingA2.forEach(w => a2Map.set(w.id, cleanWord(w)));
[...f3Words, ...f4Words].filter(w => w.level === 'A2').forEach(w => {
  const cleaned = cleanWord(w);
  if (a2Map.has(cleaned.id)) {
    a2Map.set(cleaned.id, mergeWord(a2Map.get(cleaned.id), cleaned));
  } else {
    a2Map.set(cleaned.id, cleaned);
  }
});

// 5. Update B1 Map
const b1Map = new Map();
existingB1.forEach(w => b1Map.set(w.id, cleanWord(w)));
[...f3Words, ...f4Words].filter(w => w.level === 'B1').forEach(w => {
  const cleaned = cleanWord(w);
  if (b1Map.has(cleaned.id)) {
    b1Map.set(cleaned.id, mergeWord(b1Map.get(cleaned.id), cleaned));
  } else {
    b1Map.set(cleaned.id, cleaned);
  }
});

// 6. Update B2 Map
const b2Map = new Map();
existingB2.forEach(w => b2Map.set(w.id, cleanWord(w)));
[...f3Words, ...f4Words].filter(w => w.level === 'B2').forEach(w => {
  const cleaned = cleanWord(w);
  if (b2Map.has(cleaned.id)) {
    b2Map.set(cleaned.id, mergeWord(b2Map.get(cleaned.id), cleaned));
  } else {
    b2Map.set(cleaned.id, cleaned);
  }
});

// 7. Master Expanded Vocabulary Map
const masterMap = new Map();
// Load existing
existingExp.forEach(w => masterMap.set(w.id, cleanWord(w)));

// Merge all level words
const allLevelWords = [
  ...a1Map.values(),
  ...a2Map.values(),
  ...b1Map.values(),
  ...b2Map.values(),
  ...c1Map.values(),
  ...c2Map.values(),
];

allLevelWords.forEach(w => {
  if (masterMap.has(w.id)) {
    masterMap.set(w.id, mergeWord(masterMap.get(w.id), w));
  } else {
    masterMap.set(w.id, w);
  }
});

// Sort lists alphabetically by word
const sortWords = (arr) => arr.sort((a, b) => a.word.localeCompare(b.word));

const finalA1 = sortWords(Array.from(a1Map.values()));
const finalA2 = sortWords(Array.from(a2Map.values()));
const finalB1 = sortWords(Array.from(b1Map.values()));
const finalB2 = sortWords(Array.from(b2Map.values()));
const finalC1 = sortWords(Array.from(c1Map.values()));
const finalC2 = sortWords(Array.from(c2Map.values()));
const finalMaster = sortWords(Array.from(masterMap.values()));

console.log('\n--- COMPILED WORD COUNTS ---');
console.log(`A1 Words: ${finalA1.length}`);
console.log(`A2 Words: ${finalA2.length}`);
console.log(`B1 Words: ${finalB1.length}`);
console.log(`B2 Words: ${finalB2.length}`);
console.log(`C1 Words: ${finalC1.length}`);
console.log(`C2 Words: ${finalC2.length}`);
console.log(`C1+C2 Words: ${finalC1.length + finalC2.length}`);
console.log(`Total Master Expanded Words: ${finalMaster.length}`);

// Write files
function writeTsModule(filename, varName, words) {
  const content = `import { Word } from '../../types';\n\nexport const ${varName}: Word[] = ${JSON.stringify(words, null, 2)};\n`;
  fs.writeFileSync(path.join(vocabDir, filename), content, 'utf8');
  console.log(`✅ Saved ${filename}`);
}

writeTsModule('wordsA1.ts', 'WORDS_A1', finalA1);
writeTsModule('wordsA2.ts', 'WORDS_A2', finalA2);
writeTsModule('wordsB1.ts', 'WORDS_B1', finalB1);
writeTsModule('wordsB2.ts', 'WORDS_B2', finalB2);
writeTsModule('wordsC1.ts', 'WORDS_C1', finalC1);
writeTsModule('wordsC2.ts', 'WORDS_C2', finalC2);

// Write wordsC1C2.ts
const c1c2Content = `import { Word } from '../../types';
import { WORDS_C1 } from './wordsC1';
import { WORDS_C2 } from './wordsC2';

export const WORDS_C1_C2: Word[] = [
  ...WORDS_C1,
  ...WORDS_C2,
];

export { WORDS_C1, WORDS_C2 };
`;
fs.writeFileSync(path.join(vocabDir, 'wordsC1C2.ts'), c1c2Content, 'utf8');
console.log(`✅ Saved wordsC1C2.ts`);

// Write expandedVocabulary.json
const expPath = path.join(__dirname, '..', 'src', 'data', 'expandedVocabulary.json');
fs.writeFileSync(expPath, JSON.stringify(finalMaster, null, 2), 'utf8');
console.log(`✅ Saved expandedVocabulary.json (${finalMaster.length} words)`);

console.log('\n🎉 Integration completed successfully!');
