import type { Subject } from '../../phrasePatterns';

// ============================================================
// НОВЫЕ СЛОВА УРОКА 2
// Местоимения-дополнения, вопросительные слова, вежливые частицы
// ============================================================

// Новые местоимения (дополнительные к уроку 1)
export const pronouns: Subject[] = [
  { thai: 'ดิฉัน', transcription: 'dì-chǎn', russian: 'Я (жен., форм.)', conjIndex: 0, gender: 'fem' },
  { thai: 'ท่าน', transcription: 'thâan', russian: 'Вы (вежл.)', conjIndex: 4, gender: 'plural' },
  { thai: 'เธอ', transcription: 'thə̌ə', russian: 'Ты (неформ.)', conjIndex: 1, gender: 'masc' },
  { thai: 'กู', transcription: 'guu', russian: 'Я (грубое)', conjIndex: 0, gender: 'masc' },
  { thai: 'มึง', transcription: 'mueng', russian: 'Ты (грубое)', conjIndex: 1, gender: 'masc' },
];

// Вопросительные слова
export const questionWords = [
  { thai: 'ใคร', transcription: 'krai', russian: 'Кто' },
  { thai: 'อะไร', transcription: 'à-rai', russian: 'Что' },
  { thai: 'เมื่อไหร่', transcription: 'mûea-rài', russian: 'Когда' },
  { thai: 'ที่ไหน', transcription: 'tîi-nǎi', russian: 'Где' },
  { thai: 'ทำไม', transcription: 'tam-mai', russian: 'Почему' },
  { thai: 'อย่างไร', transcription: 'yàang-rai', russian: 'Как' },
];

// Вежливые частицы
export const particles = [
  { thai: 'ครับ', transcription: 'kráp', russian: '(вежл. муж.)', type: 'polite' },
  { thai: 'ค่ะ', transcription: 'kâ', russian: '(вежл. жен.)', type: 'polite' },
  { thai: 'คะ', transcription: 'ká', russian: '(вежл. жен., вопр.)', type: 'polite-question' },
];

// Экспорт в формате LessonVocab для aggregate.ts
export const lesson2Vocab = {
  pronouns,
  questionWords,
  particles,
};
