/**
 * WordMem Master Vocabulary Compiler
 * Bu betik generate1000Words ve buildMassiveVocabulary listelerini birleştirir,
 * tekilleştirir (deduplicate) ve 'src/data/expandedVocabulary.json' dosyasına yazar.
 */

const fs = require('fs');
const path = require('path');

// 1. generate1000Words çalıştır
require('./generate1000Words.js');
const words1 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'expandedVocabulary.json'), 'utf-8'));

// 2. buildMassiveVocabulary çalıştır
require('./buildMassiveVocabulary.js');
const words2 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'expandedVocabulary.json'), 'utf-8'));

// 3. Tekilleştir ve Birleştir
const combined = new Map();

// Önce words2 (A1 zengin temel)
words2.forEach(w => {
  combined.set(w.id, w);
});

// Üzerine words1 (B1, B2, C1, C2 detaylı akademik ve profesyonel kelimeler)
words1.forEach(w => {
  combined.set(w.id, w);
});

const finalWordsList = Array.from(combined.values()).sort((a, b) => a.word.localeCompare(b.word));

console.log(`=============================================`);
console.log(`🌟 TOPLAM BİRLEŞTİRİLMİŞ KELİME SAYISI: ${finalWordsList.length}`);
console.log(`=============================================`);

const outPath = path.join(__dirname, '..', 'src', 'data', 'expandedVocabulary.json');
fs.writeFileSync(outPath, JSON.stringify(finalWordsList, null, 2), 'utf-8');
console.log(`✅ Master liste kaydedildi: ${outPath}`);
