import type { PhraseStructure, SentenceType } from './types';

// ============================================================
// Subject, Verb, Noun — типы для генерации фраз
// (перенесены сюда чтобы избежать циклического импорта)
// ============================================================

export interface Subject {
  thai: string;
  transcription: string;
  russian: string;
  conjIndex: 0 | 1 | 2 | 3 | 4 | 5;
  gender: 'masc' | 'fem' | 'plural';
}

export interface Verb {
  thai: string;
  transcription: string;
  infinitive: string;
  present: string[];
  past: string[];
  future: string[];
  continuous: string[];
}

export interface Noun {
  thai: string;
  transcription: string;
  russian: string;
  russianAccusative: string;
}

// ============================================================
// TENSE MARKERS — частицы времени
// ============================================================
export const TENSE_MARKERS = {
  none: { thai: '', transcription: '' },
  future: { thai: 'จะ', transcription: 'jà' },
  continuous: { thai: 'กำลัง', transcription: 'gam-lang' },
  negativePresent: { thai: 'ไม่', transcription: 'mâi' },
  negativeFuture: { thai: 'จะไม่', transcription: 'jà mâi' },
  negativePast: { thai: 'ไม่ได้', transcription: 'mâi-dâi' },
} as const;

// ============================================================
// ENDINGS — окончания предложений
// ============================================================
export const ENDINGS = {
  none: { thai: '', transcription: '' },
  past: { thai: 'แล้ว', transcription: 'láew' },
  question: { thai: 'ไหม', transcription: 'mǎi' },
  pastQuestion: { thai: 'แล้วไหม', transcription: 'láew mǎi' },
} as const;

// ============================================================
// Pattern interfaces
// ============================================================
interface Pattern {
  type: SentenceType;
  russianTemplate: (subject: Subject, verb: Verb) => string;
  buildStructure: (subject: Subject, verb: Verb) => PhraseStructure[];
  buildThai: (subject: Subject, verb: Verb) => string;
  buildTranscription: (subject: Subject, verb: Verb) => string;
}

interface PatternWithObject {
  type: SentenceType;
  russianTemplate: (subject: Subject, verb: Verb, noun: Noun) => string;
  buildStructure: (subject: Subject, verb: Verb, noun: Noun) => PhraseStructure[];
  buildThai: (subject: Subject, verb: Verb, noun: Noun) => string;
  buildTranscription: (subject: Subject, verb: Verb, noun: Noun) => string;
}

// ============================================================
// Helper: get subject label with gender marker
// Only "Я" needs a marker (муж./жен.) since both ผม and ฉัน translate to "Я"
// Other pronouns (Он, Она, Мы, Вы, Они) are self-explanatory
// ============================================================
function getSubjectLabel(subject: Subject): string {
  if (subject.russian.startsWith('Я')) {
    switch (subject.gender) {
      case 'masc':
        return 'Я (муж.)';
      case 'fem':
        return 'Я (жен.)';
      default:
        return 'Я';
    }
  }
  return subject.russian;
}

// ============================================================
// Helper: get past tense form based on subject's gender
// ============================================================
function getPastForm(verb: Verb, subject: Subject): string {
  if (verb.past.length === 1) return verb.past[0];
  switch (subject.gender) {
    case 'fem':
      return verb.past[1];
    case 'plural':
      return verb.past[2];
    case 'masc':
    default:
      return verb.past[0];
  }
}

// ============================================================
// PATTERNS — шаблоны без объекта (10 штук)
// ============================================================
export const patterns: Pattern[] = [
  // Present affirmative: Я ем
  {
    type: 'present_affirmative',
    russianTemplate: (s, v) => `${getSubjectLabel(s)} ${v.present[s.conjIndex]}`,
    buildStructure: (s, v) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
    ],
    buildThai: (s, v) => `${s.thai}${v.thai}`,
    buildTranscription: (s, v) => `${s.transcription} ${v.transcription}`,
  },

  // Present negative: Я не ем
  {
    type: 'present_negative',
    russianTemplate: (s, v) => `${getSubjectLabel(s)} не ${v.present[s.conjIndex]}`,
    buildStructure: (s, v) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.negativePresent.thai, transcription: TENSE_MARKERS.negativePresent.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
    ],
    buildThai: (s, v) => `${s.thai}${TENSE_MARKERS.negativePresent.thai}${v.thai}`,
    buildTranscription: (s, v) => `${s.transcription} ${TENSE_MARKERS.negativePresent.transcription} ${v.transcription}`,
  },

  // Present question: Ты ешь?
  {
    type: 'present_question',
    russianTemplate: (s, v) => `${getSubjectLabel(s)} ${v.present[s.conjIndex]}?`,
    buildStructure: (s, v) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'ending', thai: ENDINGS.question.thai, transcription: ENDINGS.question.transcription },
    ],
    buildThai: (s, v) => `${s.thai}${v.thai}${ENDINGS.question.thai}`,
    buildTranscription: (s, v) => `${s.transcription} ${v.transcription} ${ENDINGS.question.transcription}`,
  },

  // Past affirmative: Я поел
  {
    type: 'past_affirmative',
    russianTemplate: (s, v) => `${s.russian} ${getPastForm(v, s)}`,
    buildStructure: (s, v) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'ending', thai: ENDINGS.past.thai, transcription: ENDINGS.past.transcription },
    ],
    buildThai: (s, v) => `${s.thai}${v.thai}${ENDINGS.past.thai}`,
    buildTranscription: (s, v) => `${s.transcription} ${v.transcription} ${ENDINGS.past.transcription}`,
  },

  // Past negative: Я не ел
  {
    type: 'past_negative',
    russianTemplate: (s, v) => `${s.russian} не ${getPastForm(v, s)}`,
    buildStructure: (s, v) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.negativePast.thai, transcription: TENSE_MARKERS.negativePast.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
    ],
    buildThai: (s, v) => `${s.thai}${TENSE_MARKERS.negativePast.thai}${v.thai}`,
    buildTranscription: (s, v) => `${s.transcription} ${TENSE_MARKERS.negativePast.transcription} ${v.transcription}`,
  },

  // Past question: Ты поел?
  {
    type: 'past_question',
    russianTemplate: (s, v) => `${s.russian} ${getPastForm(v, s)}?`,
    buildStructure: (s, v) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'ending', thai: ENDINGS.past.thai, transcription: ENDINGS.past.transcription },
      { groupId: 'ending', thai: ENDINGS.question.thai, transcription: ENDINGS.question.transcription },
    ],
    buildThai: (s, v) => `${s.thai}${v.thai}${ENDINGS.past.thai}${ENDINGS.question.thai}`,
    buildTranscription: (s, v) => `${s.transcription} ${v.transcription} ${ENDINGS.past.transcription} ${ENDINGS.question.transcription}`,
  },

  // Future affirmative: Я буду есть
  {
    type: 'future_affirmative',
    russianTemplate: (s, v) => `${getSubjectLabel(s)} ${v.future[s.conjIndex]}`,
    buildStructure: (s, v) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.future.thai, transcription: TENSE_MARKERS.future.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
    ],
    buildThai: (s, v) => `${s.thai}${TENSE_MARKERS.future.thai}${v.thai}`,
    buildTranscription: (s, v) => `${s.transcription} ${TENSE_MARKERS.future.transcription} ${v.transcription}`,
  },

  // Future negative: Я не буду есть
  {
    type: 'future_negative',
    russianTemplate: (s, v) => `${getSubjectLabel(s)} не ${v.future[s.conjIndex]}`,
    buildStructure: (s, v) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.negativeFuture.thai, transcription: TENSE_MARKERS.negativeFuture.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
    ],
    buildThai: (s, v) => `${s.thai}${TENSE_MARKERS.negativeFuture.thai}${v.thai}`,
    buildTranscription: (s, v) => `${s.transcription} ${TENSE_MARKERS.negativeFuture.transcription} ${v.transcription}`,
  },

  // Future question: Ты будешь есть?
  {
    type: 'future_question',
    russianTemplate: (s, v) => `${getSubjectLabel(s)} ${v.future[s.conjIndex]}?`,
    buildStructure: (s, v) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.future.thai, transcription: TENSE_MARKERS.future.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'ending', thai: ENDINGS.question.thai, transcription: ENDINGS.question.transcription },
    ],
    buildThai: (s, v) => `${s.thai}${TENSE_MARKERS.future.thai}${v.thai}${ENDINGS.question.thai}`,
    buildTranscription: (s, v) => `${s.transcription} ${TENSE_MARKERS.future.transcription} ${v.transcription} ${ENDINGS.question.transcription}`,
  },

  // Continuous: Я сейчас ем
  {
    type: 'continuous',
    russianTemplate: (s, v) => `${getSubjectLabel(s)} сейчас ${v.continuous[s.conjIndex]}`,
    buildStructure: (s, v) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.continuous.thai, transcription: TENSE_MARKERS.continuous.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
    ],
    buildThai: (s, v) => `${s.thai}${TENSE_MARKERS.continuous.thai}${v.thai}`,
    buildTranscription: (s, v) => `${s.transcription} ${TENSE_MARKERS.continuous.transcription} ${v.transcription}`,
  },
];

// ============================================================
// PATTERNS WITH OBJECT — шаблоны с объектом (8 штук)
// ============================================================
export const patternsWithObject: PatternWithObject[] = [
  // Present affirmative with object: Я открываю дверь
  {
    type: 'present_affirmative_obj',
    russianTemplate: (s, v, n) => `${getSubjectLabel(s)} ${v.present[s.conjIndex]} ${n.russianAccusative}`,
    buildStructure: (s, v, n) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'object', thai: n.thai, transcription: n.transcription },
    ],
    buildThai: (s, v, n) => `${s.thai}${v.thai}${n.thai}`,
    buildTranscription: (s, v, n) => `${s.transcription} ${v.transcription} ${n.transcription}`,
  },

  // Present negative with object: Я не открываю дверь
  {
    type: 'present_negative_obj',
    russianTemplate: (s, v, n) => `${getSubjectLabel(s)} не ${v.present[s.conjIndex]} ${n.russianAccusative}`,
    buildStructure: (s, v, n) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.negativePresent.thai, transcription: TENSE_MARKERS.negativePresent.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'object', thai: n.thai, transcription: n.transcription },
    ],
    buildThai: (s, v, n) => `${s.thai}${TENSE_MARKERS.negativePresent.thai}${v.thai}${n.thai}`,
    buildTranscription: (s, v, n) => `${s.transcription} ${TENSE_MARKERS.negativePresent.transcription} ${v.transcription} ${n.transcription}`,
  },

  // Present question with object: Ты открываешь дверь?
  {
    type: 'present_question_obj',
    russianTemplate: (s, v, n) => `${getSubjectLabel(s)} ${v.present[s.conjIndex]} ${n.russianAccusative}?`,
    buildStructure: (s, v, n) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'object', thai: n.thai, transcription: n.transcription },
      { groupId: 'ending', thai: ENDINGS.question.thai, transcription: ENDINGS.question.transcription },
    ],
    buildThai: (s, v, n) => `${s.thai}${v.thai}${n.thai}${ENDINGS.question.thai}`,
    buildTranscription: (s, v, n) => `${s.transcription} ${v.transcription} ${n.transcription} ${ENDINGS.question.transcription}`,
  },

  // Past affirmative with object: Я открыл дверь
  {
    type: 'past_affirmative_obj',
    russianTemplate: (s, v, n) => `${s.russian} ${getPastForm(v, s)} ${n.russianAccusative}`,
    buildStructure: (s, v, n) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'object', thai: n.thai, transcription: n.transcription },
      { groupId: 'ending', thai: ENDINGS.past.thai, transcription: ENDINGS.past.transcription },
    ],
    buildThai: (s, v, n) => `${s.thai}${v.thai}${n.thai}${ENDINGS.past.thai}`,
    buildTranscription: (s, v, n) => `${s.transcription} ${v.transcription} ${n.transcription} ${ENDINGS.past.transcription}`,
  },

  // Past negative with object: Я не открывал дверь
  {
    type: 'past_negative_obj',
    russianTemplate: (s, v, n) => `${s.russian} не ${getPastForm(v, s)} ${n.russianAccusative}`,
    buildStructure: (s, v, n) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.negativePast.thai, transcription: TENSE_MARKERS.negativePast.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'object', thai: n.thai, transcription: n.transcription },
    ],
    buildThai: (s, v, n) => `${s.thai}${TENSE_MARKERS.negativePast.thai}${v.thai}${n.thai}`,
    buildTranscription: (s, v, n) => `${s.transcription} ${TENSE_MARKERS.negativePast.transcription} ${v.transcription} ${n.transcription}`,
  },

  // Future affirmative with object: Я открою дверь
  {
    type: 'future_affirmative_obj',
    russianTemplate: (s, v, n) => `${getSubjectLabel(s)} ${v.future[s.conjIndex]} ${n.russianAccusative}`,
    buildStructure: (s, v, n) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.future.thai, transcription: TENSE_MARKERS.future.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'object', thai: n.thai, transcription: n.transcription },
    ],
    buildThai: (s, v, n) => `${s.thai}${TENSE_MARKERS.future.thai}${v.thai}${n.thai}`,
    buildTranscription: (s, v, n) => `${s.transcription} ${TENSE_MARKERS.future.transcription} ${v.transcription} ${n.transcription}`,
  },

  // Future negative with object: Я не открою дверь
  {
    type: 'future_negative_obj',
    russianTemplate: (s, v, n) => `${getSubjectLabel(s)} не ${v.future[s.conjIndex]} ${n.russianAccusative}`,
    buildStructure: (s, v, n) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.negativeFuture.thai, transcription: TENSE_MARKERS.negativeFuture.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'object', thai: n.thai, transcription: n.transcription },
    ],
    buildThai: (s, v, n) => `${s.thai}${TENSE_MARKERS.negativeFuture.thai}${v.thai}${n.thai}`,
    buildTranscription: (s, v, n) => `${s.transcription} ${TENSE_MARKERS.negativeFuture.transcription} ${v.transcription} ${n.transcription}`,
  },

  // Continuous with object: Я сейчас открываю дверь
  {
    type: 'continuous_obj',
    russianTemplate: (s, v, n) => `${getSubjectLabel(s)} сейчас ${v.continuous[s.conjIndex]} ${n.russianAccusative}`,
    buildStructure: (s, v, n) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.continuous.thai, transcription: TENSE_MARKERS.continuous.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'object', thai: n.thai, transcription: n.transcription },
    ],
    buildThai: (s, v, n) => `${s.thai}${TENSE_MARKERS.continuous.thai}${v.thai}${n.thai}`,
    buildTranscription: (s, v, n) => `${s.transcription} ${TENSE_MARKERS.continuous.transcription} ${v.transcription} ${n.transcription}`,
  },
];
