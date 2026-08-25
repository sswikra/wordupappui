const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'src', 'data', 'expandedVocabulary.json');
const words = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log("==========================================");
console.log("📖 WordMem Vocabulary Database Summary:");
console.log("==========================================");
console.log("Total Words in Database:", words.length);

const levels = {};
words.forEach(w => {
  const lvl = w.level || 'Unknown';
  levels[lvl] = (levels[lvl] || 0) + 1;
});

Object.entries(levels).forEach(([lvl, count]) => {
  console.log(`- Level ${lvl}: ${count} words`);
});

console.log("\nSample Word (A1):", words.find(w => w.level === 'A1')?.word, `(${words.find(w => w.level === 'A1')?.translation})`);
console.log("Sample Word (A2):", words.find(w => w.level === 'A2')?.word, `(${words.find(w => w.level === 'A2')?.translation})`);
console.log("Sample Word (B1):", words.find(w => w.level === 'B1')?.word, `(${words.find(w => w.level === 'B1')?.translation})`);
console.log("Sample Word (B2):", words.find(w => w.level === 'B2')?.word, `(${words.find(w => w.level === 'B2')?.translation})`);
console.log("==========================================");

