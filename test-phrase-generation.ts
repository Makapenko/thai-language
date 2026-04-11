// Test script to generate sample phrases with pronoun objects
import { pronouns as lesson2Pronouns, objectPronouns as lesson2ObjectPronouns } from './src/data/vocabulary/lessons/lesson2.ts';
import { pronouns as lesson1Pronouns, verbs as lesson1Verbs, objectPronouns as lesson1ObjectPronouns } from './src/data/vocabulary/lessons/lesson1.ts';
import { generatePhrasesWithPronounObjects } from './src/data/phraseGenerator.ts';

// Combine object pronouns from both lessons
const allObjectPronouns = [...lesson1ObjectPronouns, ...lesson2ObjectPronouns];

// Filter verbs that work well with person objects
const verbsWithPronounObjects = lesson1Verbs.filter(v =>
  ['เห็น', 'ช่วย', 'รอ', 'โทร', 'รัก', 'รู้', 'พบ', 'ให้', 'ถาม', 'ตอบ', 'ได้ยิน', 'ต้องการ', 'เข้าใจ'].includes(v.thai)
);

// Generate sample phrases
const samplePhrases = generatePhrasesWithPronounObjects(
  lesson2Pronouns,
  verbsWithPronounObjects,
  allObjectPronouns,
  [
    'present_affirmative_obj_pron',
    'present_negative_obj_pron',
    'present_question_obj_pron',
    'past_affirmative_obj_pron',
    'past_negative_obj_pron',
    'future_affirmative_obj_pron',
    'future_negative_obj_pron',
    'continuous_obj_pron',
  ],
  2
);

// Display a sample of generated phrases
console.log('=== SAMPLE PHRASES WITH PRONOUN OBJECTS ===\n');
console.log(`Total generated: ${samplePhrases.length}\n`);

// Show first 30 phrases
samplePhrases.slice(0, 30).forEach((phrase, index) => {
  console.log(`${index + 1}. ${phrase.russian}`);
  console.log(`   Thai: ${phrase.thai}`);
  console.log(`   Transcription: ${phrase.transcription}`);
  console.log(`   Structure: ${phrase.structure.map(s => `${s.groupId}=${s.thai}`).join(', ')}`);
  console.log('');
});

// Analyze potential issues
console.log('\n=== POTENTIAL ISSUES ===\n');

// Find phrases with same subject and object
const reflexivePhrases = samplePhrases.filter(p => {
  const subjectThai = p.structure.find(s => s.groupId === 'subject')?.thai;
  const objectThai = p.structure.find(s => s.groupId === 'objectPronoun')?.thai;
  return subjectThai === objectThai;
});

console.log(`Reflexive phrases (subject = object): ${reflexivePhrases.length}`);
reflexivePhrases.slice(0, 10).forEach(p => {
  console.log(`  - ${p.russian} (${p.thai})`);
});

console.log('');

// Find phrases with specific verbs that might be problematic
const problematicVerbs = ['ให้', 'บอก', 'โทร'];
const verbIssues = samplePhrases.filter(p => {
  const verbThai = p.structure.find(s => s.groupId === 'verb')?.thai;
  return problematicVerbs.includes(verbThai || '');
});

console.log(`\nPhrases with potentially problematic verbs (ให้, บอก, โทร): ${verbIssues.length}`);
verbIssues.slice(0, 10).forEach(p => {
  console.log(`  - ${p.russian}`);
  console.log(`    Thai: ${p.thai}`);
});
