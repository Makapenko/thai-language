import type { Phrase, WordGroup } from '../types';
import { generatePhrases, generatePhrasesWithObjects } from '../phraseGenerator';
import { pronouns, verbs, nouns } from '../vocabulary/lessons/lesson1';

// ============================================================
// Фразы урока 1 — генерируются автоматически из vocabulary
// ============================================================

// Generate phrases without objects
// 8 subjects × 62 verbs × 10 patterns = 4960 phrases
export const lesson1Phrases: Phrase[] = generatePhrases(
  pronouns,
  verbs,
  [
    'present_affirmative',
    'present_negative',
    'present_question',
    'past_affirmative',
    'past_negative',
    'past_question',
    'future_affirmative',
    'future_negative',
    'future_question',
    'continuous',
  ],
  1
);

// Transitive verbs that work well with objects
const transitiveVerbs = verbs.filter(v =>
  ['เปิด', 'ปิด', 'เห็น', 'ดู', 'ซื้อ', 'ทำ', 'เปลี่ยน', 'สร้าง', 'หา', 'ตัด'].includes(v.thai)
);

// Generate phrases with objects
// 8 subjects × 10 transitive verbs × 6 nouns × 8 patterns = 3840 phrases
export const lesson1PhrasesWithObjects: Phrase[] = generatePhrasesWithObjects(
  pronouns,
  transitiveVerbs,
  nouns,
  [
    'present_affirmative_obj',
    'present_negative_obj',
    'present_question_obj',
    'past_affirmative_obj',
    'past_negative_obj',
    'future_affirmative_obj',
    'future_negative_obj',
    'continuous_obj',
  ],
  1
);

// Combined phrases for the lesson
export const lesson1AllPhrases: Phrase[] = [...lesson1Phrases, ...lesson1PhrasesWithObjects];

// ============================================================
// Word groups for the phrase builder UI
// ============================================================
export const lesson1WordGroups: WordGroup[] = [
  {
    id: 'subject',
    name: 'Подлежащее',
    options: pronouns
      .filter((s, i, arr) => arr.findIndex(x => x.thai === s.thai) === i) // unique by thai
      .map(s => ({ thai: s.thai, transcription: s.transcription, russian: s.russian })),
  },
  {
    id: 'tense',
    name: 'Время/Отрицание',
    options: [
      { thai: '', transcription: '', russian: '(настоящее)' },
      { thai: 'จะ', transcription: 'jà', russian: 'будет' },
      { thai: 'กำลัง', transcription: 'gam-lang', russian: 'сейчас' },
      { thai: 'ไม่', transcription: 'mâi', russian: 'не' },
      { thai: 'จะไม่', transcription: 'jà mâi', russian: 'не будет' },
      { thai: 'ไม่ได้', transcription: 'mâi-dâi', russian: 'не (прош.)' },
    ],
  },
  {
    id: 'verb',
    name: 'Глагол',
    options: verbs.map(v => ({ thai: v.thai, transcription: v.transcription, russian: v.infinitive })),
  },
  {
    id: 'object',
    name: 'Объект',
    options: nouns.map(n => ({ thai: n.thai, transcription: n.transcription, russian: n.russian })),
  },
  {
    id: 'ending',
    name: 'Окончание',
    options: [
      { thai: '', transcription: '', russian: '(без окончания)' },
      { thai: 'แล้ว', transcription: 'láew', russian: 'уже' },
      { thai: 'ไหม', transcription: 'mǎi', russian: '?' },
      { thai: 'ครับ', transcription: 'kráp', russian: '(вежл.)' },
    ],
  },
];
