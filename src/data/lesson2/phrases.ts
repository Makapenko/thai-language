import type { Phrase, WordGroup } from '../types';
import {
  generatePhrases,
  generatePhrasesWithObjects,
  generatePhrasesWithPronounObjects,
  generateQuestionPhrases,
  nameToSubject,
  nameToObjectPronoun,
} from '../phraseGenerator';
import { pronouns as lesson1Pronouns, verbs as lesson1Verbs, nouns as lesson1Nouns, objectPronouns as lesson1ObjectPronouns } from '../vocabulary/lessons/lesson1';
import { pronouns as lesson2Pronouns, questionWords as lesson2QuestionWords, objectPronouns as lesson2ObjectPronouns } from '../vocabulary/lessons/lesson2';
import { allNames } from '../vocabulary/names';

// ============================================================
// Словарь для урока 2
// ============================================================
const allVerbs = lesson1Verbs; // глаголы только из урока 1
const allNouns = lesson1Nouns; // существительные только из урока 1
const allObjectPronouns = [...lesson1ObjectPronouns, ...lesson2ObjectPronouns]; // все местоимения-дополнения

// Имена как подлежащие и объекты
const nameSubjects = allNames.map(nameToSubject);
const nameObjects = allNames.map(nameToObjectPronoun);

// Подлежащие: местоимения урока 2 + имена
const subjectsWithNames = [...lesson2Pronouns, ...nameSubjects];

// Местоимения-объекты + имена
const allObjectPronounsWithNames = [...allObjectPronouns, ...nameObjects];

// ============================================================
// Фразы урока 2 — генерируются автоматически
// ============================================================

// 1. Стандартные фразы — тренируем новые местоимения из урока 2 + тайские имена
// (5 pronouns + 8 names) × 62 verbs × 10 patterns = 8060 фраз
export const lesson2Phrases: Phrase[] = generatePhrases(
  subjectsWithNames,
  allVerbs,
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
  2
);

// 2. Фразы с объектами (существительные) — тренируем новые местоимения из урока 2 + тайские имена
const transitiveVerbs = allVerbs.filter(v =>
  ['เปิด', 'ปิด', 'เห็น', 'ดู', 'ซื้อ', 'ทำ', 'เปลี่ยน', 'สร้าง', 'หา', 'ตัด'].includes(v.thai)
);

export const lesson2PhrasesWithObjects: Phrase[] = generatePhrasesWithObjects(
  subjectsWithNames,
  transitiveVerbs,
  allNouns,
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
  2
);

// 2.5 Фразы с местоимениями-объектами — тренируем местоимения из урока 2 как подлежащие + все местоимения-дополнения + имена
// Подбираем глаголы, которые часто используются с дополнениями-лицами
const verbsWithPronounObjects = allVerbs.filter(v =>
  // Глаголы, которые естественно работают с людьми как дополнениями
  // Примечание: ต้องการ удалён, так как создаёт двусмысленные фразы ("я хочу тебя")
  ['เห็น', 'ช่วย', 'รอ', 'โทร', 'รัก', 'รู้', 'พบ', 'ให้', 'ถาม', 'ตอบ', 'ได้ยิน', 'เข้าใจ'].includes(v.thai)
);

export const lesson2PhrasesWithPronounObjects: Phrase[] = generatePhrasesWithPronounObjects(
  subjectsWithNames,              // подлежащие (местоимения урока 2 + имена)
  verbsWithPronounObjects,        // глаголы, подходящие для дополнений-лиц
  allObjectPronounsWithNames,     // объекты (все местоимения + имена)
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

// 3. Вопросительные фразы с вопросительными словами — тренируем местоимения из урока 1 + урока 2 + имена
const allPronounsForQuestions = [...lesson1Pronouns, ...lesson2Pronouns, ...nameSubjects];
// (13 pronouns + 8 names) × 10 verbs × 7 patterns = 1470 фраз
// Каждый паттерн использует только своё вопросительное слово
const selectVerbs = allVerbs.slice(0, 10); // первые 10 глаголов

export const lesson2QuestionPhrases: Phrase[] = generateQuestionPhrases(
  allPronounsForQuestions,
  selectVerbs,
  lesson2QuestionWords,
  [
    'question_who_subject',   // ใครมา? — Кто приходит?
    'question_who',           // คุณเห็นใคร? — Кого ты видишь?
    'question_what',          // คุณทำอะไร? — Что ты делаешь?
    'question_when',          // เขาไปเมื่อไหร่? — Когда он поедет?
    'question_where',         // เธออยู่ที่ไหน? — Где ты находишься?
    'question_why',           // ทำไมคุณไม่มา? — Почему ты не приходишь?
    'question_how',           // คุณไปอย่างไร? — Как ты поедешь?
  ],
  2,
  'q',
  {
    verbFilters: [
      // question_who: только глаголы, которые могут принимать человека как объект
      {
        patternType: 'question_who',
        filterFn: (v) => ['เห็น', 'รัก', 'รู้'].includes(v.thai),
      },
    ],
    subjectFilter: [
      // question_who_subject: подлежащее = ใคร, поэтому не зацикливаемся на местоимениях
      // Берём только первое местоимение-заглушку (реально оно не используется в шаблоне)
      {
        patternType: 'question_who_subject',
        filterFn: (s) => s === allPronounsForQuestions[0],
      },
    ],
  }
);

// Combined phrases for the lesson
export const lesson2AllPhrases: Phrase[] = [
  ...lesson2Phrases,
  ...lesson2PhrasesWithObjects,
  ...lesson2PhrasesWithPronounObjects,
  ...lesson2QuestionPhrases,
];

// ============================================================
// Word groups for the phrase builder UI — урок 2
// Группа subject: только новые местоимения из урока 2
// ============================================================
export const lesson2WordGroups: WordGroup[] = [
  {
    id: 'subject',
    name: 'Подлежащее',
    options: lesson2Pronouns.map(s => ({ thai: s.thai, transcription: s.transcription, russian: s.russian })),
  },
  {
    id: 'name',
    name: 'Имя',
    options: allNames.map(n => ({ thai: n.thai, transcription: n.transcription, russian: n.russian })),
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
    options: allVerbs.map(v => ({ thai: v.thai, transcription: v.transcription, russian: v.infinitive })),
  },
  {
    id: 'object',
    name: 'Объект (сущ.)',
    options: allNouns.map(n => ({ thai: n.thai, transcription: n.transcription, russian: n.russian })),
  },
  {
    id: 'objectPronoun',
    name: 'Объект (мест./имя)',
    options: allObjectPronounsWithNames.map(p => ({ thai: p.thai, transcription: p.transcription, russian: p.russianAccusative })),
  },
  {
    id: 'questionWord',
    name: 'Вопрос',
    options: lesson2QuestionWords.map(qw => ({ thai: qw.thai, transcription: qw.transcription, russian: qw.russian })),
  },
  {
    id: 'ending',
    name: 'Окончание',
    options: [
      { thai: '', transcription: '', russian: '(без окончания)' },
      { thai: 'แล้ว', transcription: 'láew', russian: 'уже' },
      { thai: 'ไหม', transcription: 'mǎi', russian: '?' },
      { thai: 'ครับ', transcription: 'kráp', russian: '(вежл. муж.)' },
      { thai: 'ค่ะ', transcription: 'kâ', russian: '(вежл. жен.)' },
      { thai: 'คะ', transcription: 'ká', russian: '(вежл. жен., вопр.)' },
    ],
  },
];
