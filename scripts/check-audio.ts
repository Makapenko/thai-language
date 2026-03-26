/**
 * Check which word audio files are missing
 * 
 * Usage: npm run check-audio
 */

import { lesson1Words } from '../src/data/lesson1/words.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio', 'words');

console.log('📊 Audio Files Status (Words Only)\n');
console.log('💡 Phrases are played by combining word audio files\n');
console.log('='.repeat(50));

const missingList: Array<{ id: string; thai: string }> = [];

for (const item of lesson1Words) {
  const filepath = path.join(OUTPUT_DIR, `${item.id}.mp3`);
  if (!fs.existsSync(filepath)) {
    missingList.push({ id: item.id, thai: item.thai });
  }
}

const exists = lesson1Words.length - missingList.length;

console.log(`\n📚 Words: ${exists}/${lesson1Words.length} files exist`);

if (missingList.length > 0) {
  console.log(`   Missing: ${missingList.length}`);
  if (missingList.length <= 30) {
    console.log('   Missing IDs:', missingList.map(i => i.id).join(', '));
  }
}

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Total: ${exists}/${lesson1Words.length} files exist`);
console.log(`   Missing: ${missingList.length} files\n`);

if (missingList.length > 0) {
  console.log('💡 Run "npm run generate-audio" to generate missing files');
  console.log(`   Estimated time: ~${Math.ceil(missingList.length / 15)} minutes\n`);
} else {
  console.log('✅ All word audio files are present!\n');
  console.log('🎵 Phrases will play automatically using word audio files\n');
}
