import type { Subject, ObjectPronoun } from '../../phrasePatterns';

// ============================================================
// НОВЫЕ СЛОВА УРОКА 2
// Местоимения-дополнения, вопросительные слова, вежливые частицы
// ============================================================

// Новые местоимения (дополнительные к уроку 1)
export const pronouns: Subject[] = [
  { thai: 'ดิฉัน', transcription: 'dì-chǎn', russian: 'я (жен., форм.)', conjIndex: 0, gender: 'fem' },
  { thai: 'ท่าน', transcription: 'thâan', russian: 'вы (вежл.)', conjIndex: 4, gender: 'plural' },
  { thai: 'เธอ', transcription: 'thə̌ə', russian: 'ты (неформ.)', conjIndex: 1, gender: 'masc' },
  { thai: 'กู', transcription: 'guu', russian: 'я (грубое)', conjIndex: 0, gender: 'masc' },
  { thai: 'มึง', transcription: 'mueng', russian: 'ты (грубое)', conjIndex: 1, gender: 'masc' },
];

// Местоимения-дополнения урока 2 (дополнительные к уроку 1)
// Примечание: เธอ используется только как 3-е лицо (он/она) в роли дополнения
// Чтобы избежать бессмысленных предложений типа "ты дашь тебе"
export const objectPronouns: ObjectPronoun[] = [
  { thai: 'ดิฉัน', transcription: 'dì-chǎn', russian: 'я (жен., форм.)', russianAccusative: 'меня' },
  { thai: 'ท่าน', transcription: 'thâan', russian: 'вы (вежл.)', russianAccusative: 'вас' },
  { thai: 'เธอ', transcription: 'thə̌ə', russian: 'он (неформ.)', russianAccusative: 'его' },
  { thai: 'เธอ', transcription: 'thə̌ə', russian: 'она (неформ.)', russianAccusative: 'её' },
  { thai: 'กู', transcription: 'guu', russian: 'я (грубое)', russianAccusative: 'меня' },
  { thai: 'มึง', transcription: 'mueng', russian: 'ты (грубое)', russianAccusative: 'тебя' },
];

// Вопросительные слова
export const questionWords = [
  { thai: 'ใคร', transcription: 'krai', russian: 'кто' },
  { thai: 'อะไร', transcription: 'à-rai', russian: 'что' },
  { thai: 'เมื่อไหร่', transcription: 'mûea-rài', russian: 'когда' },
  { thai: 'ที่ไหน', transcription: 'tîi-nǎi', russian: 'где' },
  { thai: 'ทำไม', transcription: 'tam-mai', russian: 'почему' },
  { thai: 'อย่างไร', transcription: 'yàang-rai', russian: 'как' },
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
