import type { PhraseStructure, SentenceType } from './types';
import { capitalizeFirst } from '../utils/capitalizeFirst';

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
// ObjectPronoun — местоимения в роли дополнения (меня, тебя, его и т.д.)
// ============================================================
export interface ObjectPronoun {
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

interface PatternWithPronounObject {
  type: SentenceType;
  russianTemplate: (subject: Subject, verb: Verb, objectPronoun: ObjectPronoun) => string;
  buildStructure: (subject: Subject, verb: Verb, objectPronoun: ObjectPronoun) => PhraseStructure[];
  buildThai: (subject: Subject, verb: Verb, objectPronoun: ObjectPronoun) => string;
  buildTranscription: (subject: Subject, verb: Verb, objectPronoun: ObjectPronoun) => string;
}

// ============================================================
// Helper: get subject label with gender marker
// Only "я" needs a marker (муж./жен.) since both ผม and ฉัน translate to "я"
// Other pronouns (он, она, мы, вы, они) are self-explanatory
// ============================================================
function getSubjectLabel(subject: Subject): string {
  if (subject.russian.startsWith('я')) {
    // Если уже есть пометка (грубое, форм. и т.д.) — использовать как есть
    if (subject.russian.includes('(')) {
      return subject.russian;
    }
    // Иначе добавить гендерную пометку
    switch (subject.gender) {
      case 'masc':
        return 'я (муж.)';
      case 'fem':
        return 'я (жен.)';
      default:
        return 'я';
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
    russianTemplate: (s, v) => capitalizeFirst(`${getSubjectLabel(s)} ${v.present[s.conjIndex]}`),
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
    russianTemplate: (s, v) => capitalizeFirst(`${getSubjectLabel(s)} не ${v.present[s.conjIndex]}`),
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
    russianTemplate: (s, v) => capitalizeFirst(`${getSubjectLabel(s)} ${v.present[s.conjIndex]}?`),
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
    russianTemplate: (s, v) => capitalizeFirst(`${s.russian} ${getPastForm(v, s)}`),
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
    russianTemplate: (s, v) => capitalizeFirst(`${s.russian} не ${getPastForm(v, s)}`),
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
    russianTemplate: (s, v) => capitalizeFirst(`${s.russian} ${getPastForm(v, s)}?`),
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
    russianTemplate: (s, v) => capitalizeFirst(`${getSubjectLabel(s)} ${v.future[s.conjIndex]}`),
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
    russianTemplate: (s, v) => capitalizeFirst(`${getSubjectLabel(s)} не ${v.future[s.conjIndex]}`),
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
    russianTemplate: (s, v) => capitalizeFirst(`${getSubjectLabel(s)} ${v.future[s.conjIndex]}?`),
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
    russianTemplate: (s, v) => capitalizeFirst(`${getSubjectLabel(s)} сейчас ${v.continuous[s.conjIndex]}`),
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
    russianTemplate: (s, v, n) => capitalizeFirst(`${getSubjectLabel(s)} ${v.present[s.conjIndex]} ${n.russianAccusative}`),
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
    russianTemplate: (s, v, n) => capitalizeFirst(`${getSubjectLabel(s)} не ${v.present[s.conjIndex]} ${n.russianAccusative}`),
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
    russianTemplate: (s, v, n) => capitalizeFirst(`${getSubjectLabel(s)} ${v.present[s.conjIndex]} ${n.russianAccusative}?`),
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
    russianTemplate: (s, v, n) => capitalizeFirst(`${s.russian} ${getPastForm(v, s)} ${n.russianAccusative}`),
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
    russianTemplate: (s, v, n) => capitalizeFirst(`${s.russian} не ${getPastForm(v, s)} ${n.russianAccusative}`),
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
    russianTemplate: (s, v, n) => capitalizeFirst(`${getSubjectLabel(s)} ${v.future[s.conjIndex]} ${n.russianAccusative}`),
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
    russianTemplate: (s, v, n) => capitalizeFirst(`${getSubjectLabel(s)} не ${v.future[s.conjIndex]} ${n.russianAccusative}`),
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
    russianTemplate: (s, v, n) => capitalizeFirst(`${getSubjectLabel(s)} сейчас ${v.continuous[s.conjIndex]} ${n.russianAccusative}`),
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

// ============================================================
// PATTERNS WITH PRONOUN OBJECT — шаблоны с местоимениями-объектами (8 штук)
// ============================================================
export const patternsWithPronounObject: PatternWithPronounObject[] = [
  // Present affirmative with pronoun object: Я вижу тебя
  {
    type: 'present_affirmative_obj_pron',
    russianTemplate: (s, v, o) => capitalizeFirst(`${getSubjectLabel(s)} ${v.present[s.conjIndex]} ${o.russianAccusative}`),
    buildStructure: (s, v, o) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'objectPronoun', thai: o.thai, transcription: o.transcription },
    ],
    buildThai: (s, v, o) => `${s.thai}${v.thai}${o.thai}`,
    buildTranscription: (s, v, o) => `${s.transcription} ${v.transcription} ${o.transcription}`,
  },

  // Present negative with pronoun object: Я не вижу тебя
  {
    type: 'present_negative_obj_pron',
    russianTemplate: (s, v, o) => capitalizeFirst(`${getSubjectLabel(s)} не ${v.present[s.conjIndex]} ${o.russianAccusative}`),
    buildStructure: (s, v, o) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.negativePresent.thai, transcription: TENSE_MARKERS.negativePresent.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'objectPronoun', thai: o.thai, transcription: o.transcription },
    ],
    buildThai: (s, v, o) => `${s.thai}${TENSE_MARKERS.negativePresent.thai}${v.thai}${o.thai}`,
    buildTranscription: (s, v, o) => `${s.transcription} ${TENSE_MARKERS.negativePresent.transcription} ${v.transcription} ${o.transcription}`,
  },

  // Present question with pronoun object: Ты видишь меня?
  {
    type: 'present_question_obj_pron',
    russianTemplate: (s, v, o) => capitalizeFirst(`${getSubjectLabel(s)} ${v.present[s.conjIndex]} ${o.russianAccusative}?`),
    buildStructure: (s, v, o) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'objectPronoun', thai: o.thai, transcription: o.transcription },
      { groupId: 'ending', thai: ENDINGS.question.thai, transcription: ENDINGS.question.transcription },
    ],
    buildThai: (s, v, o) => `${s.thai}${v.thai}${o.thai}${ENDINGS.question.thai}`,
    buildTranscription: (s, v, o) => `${s.transcription} ${v.transcription} ${o.transcription} ${ENDINGS.question.transcription}`,
  },

  // Past affirmative with pronoun object: Я видел тебя
  {
    type: 'past_affirmative_obj_pron',
    russianTemplate: (s, v, o) => capitalizeFirst(`${s.russian} ${getPastForm(v, s)} ${o.russianAccusative}`),
    buildStructure: (s, v, o) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'objectPronoun', thai: o.thai, transcription: o.transcription },
      { groupId: 'ending', thai: ENDINGS.past.thai, transcription: ENDINGS.past.transcription },
    ],
    buildThai: (s, v, o) => `${s.thai}${v.thai}${o.thai}${ENDINGS.past.thai}`,
    buildTranscription: (s, v, o) => `${s.transcription} ${v.transcription} ${o.transcription} ${ENDINGS.past.transcription}`,
  },

  // Past negative with pronoun object: Я не видел тебя
  {
    type: 'past_negative_obj_pron',
    russianTemplate: (s, v, o) => capitalizeFirst(`${s.russian} не ${getPastForm(v, s)} ${o.russianAccusative}`),
    buildStructure: (s, v, o) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.negativePast.thai, transcription: TENSE_MARKERS.negativePast.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'objectPronoun', thai: o.thai, transcription: o.transcription },
    ],
    buildThai: (s, v, o) => `${s.thai}${TENSE_MARKERS.negativePast.thai}${v.thai}${o.thai}`,
    buildTranscription: (s, v, o) => `${s.transcription} ${TENSE_MARKERS.negativePast.transcription} ${v.transcription} ${o.transcription}`,
  },

  // Future affirmative with pronoun object: Я увижу тебя
  {
    type: 'future_affirmative_obj_pron',
    russianTemplate: (s, v, o) => capitalizeFirst(`${getSubjectLabel(s)} ${v.future[s.conjIndex]} ${o.russianAccusative}`),
    buildStructure: (s, v, o) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.future.thai, transcription: TENSE_MARKERS.future.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'objectPronoun', thai: o.thai, transcription: o.transcription },
    ],
    buildThai: (s, v, o) => `${s.thai}${TENSE_MARKERS.future.thai}${v.thai}${o.thai}`,
    buildTranscription: (s, v, o) => `${s.transcription} ${TENSE_MARKERS.future.transcription} ${v.transcription} ${o.transcription}`,
  },

  // Future negative with pronoun object: Я не увижу тебя
  {
    type: 'future_negative_obj_pron',
    russianTemplate: (s, v, o) => capitalizeFirst(`${getSubjectLabel(s)} не ${v.future[s.conjIndex]} ${o.russianAccusative}`),
    buildStructure: (s, v, o) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.negativeFuture.thai, transcription: TENSE_MARKERS.negativeFuture.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'objectPronoun', thai: o.thai, transcription: o.transcription },
    ],
    buildThai: (s, v, o) => `${s.thai}${TENSE_MARKERS.negativeFuture.thai}${v.thai}${o.thai}`,
    buildTranscription: (s, v, o) => `${s.transcription} ${TENSE_MARKERS.negativeFuture.transcription} ${v.transcription} ${o.transcription}`,
  },

  // Continuous with pronoun object: Я сейчас вижу тебя
  {
    type: 'continuous_obj_pron',
    russianTemplate: (s, v, o) => capitalizeFirst(`${getSubjectLabel(s)} сейчас ${v.continuous[s.conjIndex]} ${o.russianAccusative}`),
    buildStructure: (s, v, o) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.continuous.thai, transcription: TENSE_MARKERS.continuous.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'objectPronoun', thai: o.thai, transcription: o.transcription },
    ],
    buildThai: (s, v, o) => `${s.thai}${TENSE_MARKERS.continuous.thai}${v.thai}${o.thai}`,
    buildTranscription: (s, v, o) => `${s.transcription} ${TENSE_MARKERS.continuous.transcription} ${v.transcription} ${o.transcription}`,
  },
];
