const fs = require('fs');
const path = require('path');

// 1. Modüler dosyalardaki tüm kelimeleri al
const { WORDS_A1 } = require('../src/data/vocabulary/wordsA1');
const { WORDS_A2 } = require('../src/data/vocabulary/wordsA2');
const { WORDS_B1 } = require('../src/data/vocabulary/wordsB1');
const { WORDS_B2 } = require('../src/data/vocabulary/wordsB2');
const { WORDS_C1_C2 } = require('../src/data/vocabulary/wordsC1C2');

console.log("Reading existing datasets...");
console.log("A1:", WORDS_A1.length, "A2:", WORDS_A2.length, "B1:", WORDS_B1.length, "B2:", WORDS_B2.length, "C1/C2:", WORDS_C1_C2.length);
