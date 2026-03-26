import type { Phrase, PhraseStructure, SentenceType } from './types';

// Tense markers in Thai
const TENSE_MARKERS = {
  none: { thai: '', transcription: '' },
  future: { thai: 'จะ', transcription: 'jà' },
  continuous: { thai: 'กำลัง', transcription: 'gam-lang' },
  negativePresent: { thai: 'ไม่', transcription: 'mâi' },
  negativeFuture: { thai: 'จะไม่', transcription: 'jà mâi' },
  negativePast: { thai: 'ไม่ได้', transcription: 'mâi-dâi' },
} as const;

// Endings in Thai
const ENDINGS = {
  none: { thai: '', transcription: '' },
  past: { thai: 'แล้ว', transcription: 'láew' },
  question: { thai: 'ไหม', transcription: 'mǎi' },
  pastQuestion: { thai: 'แล้วไหม', transcription: 'láew mǎi' },
} as const;

// Subject pronouns with conjugation info
export interface Subject {
  thai: string;
  transcription: string;
  russian: string;
  // Conjugation forms: [я, ты, он/она, мы, вы, они]
  conjIndex: 0 | 1 | 2 | 3 | 4 | 5;
  // Gender for past tense agreement: 'masc', 'fem', 'plural'
  gender: 'masc' | 'fem' | 'plural';
}

// Verb with all Russian conjugation forms
export interface Verb {
  thai: string;
  transcription: string;
  // Russian forms indexed by conjIndex
  // [я, ты, он/она, мы, вы, они]
  present: string[];
  past: string[];       // [masc, fem, plural] or just [common]
  future: string[];     // буду + infinitive forms
  continuous: string[]; // same as present for most verbs
  infinitive: string;
}

// Noun (object) for phrases with objects
export interface Noun {
  thai: string;
  transcription: string;
  russian: string;          // nominative: дверь
  russianAccusative: string; // accusative: дверь (for most nouns same as nominative)
}

// Pattern definition (without object)
interface Pattern {
  type: SentenceType;
  russianTemplate: (subject: Subject, verb: Verb) => string;
  buildStructure: (subject: Subject, verb: Verb) => PhraseStructure[];
  buildThai: (subject: Subject, verb: Verb) => string;
  buildTranscription: (subject: Subject, verb: Verb) => string;
}

// Pattern definition with object (noun)
interface PatternWithObject {
  type: SentenceType;
  russianTemplate: (subject: Subject, verb: Verb, noun: Noun) => string;
  buildStructure: (subject: Subject, verb: Verb, noun: Noun) => PhraseStructure[];
  buildThai: (subject: Subject, verb: Verb, noun: Noun) => string;
  buildTranscription: (subject: Subject, verb: Verb, noun: Noun) => string;
}

// Helper to get past tense form based on subject's gender
function getPastForm(verb: Verb, subject: Subject): string {
  // For verbs with only one past form
  if (verb.past.length === 1) return verb.past[0];

  // [masc, fem, plural]
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

// Sentence patterns
const patterns: Pattern[] = [
  // Present affirmative: Я ем
  {
    type: 'present_affirmative',
    russianTemplate: (s, v) => `${s.russian} ${v.present[s.conjIndex]}`,
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
    russianTemplate: (s, v) => `${s.russian} не ${v.present[s.conjIndex]}`,
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
    russianTemplate: (s, v) => `${s.russian} ${v.present[s.conjIndex]}?`,
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
    russianTemplate: (s, v) => `${s.russian} ${v.future[s.conjIndex]}`,
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
    russianTemplate: (s, v) => `${s.russian} не ${v.future[s.conjIndex]}`,
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
    russianTemplate: (s, v) => `${s.russian} ${v.future[s.conjIndex]}?`,
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
    russianTemplate: (s, v) => `${s.russian} сейчас ${v.continuous[s.conjIndex]}`,
    buildStructure: (s, v) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.continuous.thai, transcription: TENSE_MARKERS.continuous.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
    ],
    buildThai: (s, v) => `${s.thai}${TENSE_MARKERS.continuous.thai}${v.thai}`,
    buildTranscription: (s, v) => `${s.transcription} ${TENSE_MARKERS.continuous.transcription} ${v.transcription}`,
  },
];

// Patterns with object (noun)
const patternsWithObject: PatternWithObject[] = [
  // Present affirmative with object: Я открываю дверь
  {
    type: 'present_affirmative_obj',
    russianTemplate: (s, v, n) => `${s.russian} ${v.present[s.conjIndex]} ${n.russianAccusative}`,
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
    russianTemplate: (s, v, n) => `${s.russian} не ${v.present[s.conjIndex]} ${n.russianAccusative}`,
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
    russianTemplate: (s, v, n) => `${s.russian} ${v.present[s.conjIndex]} ${n.russianAccusative}?`,
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
    russianTemplate: (s, v, n) => `${s.russian} ${v.future[s.conjIndex]} ${n.russianAccusative}`,
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
    russianTemplate: (s, v, n) => `${s.russian} не ${v.future[s.conjIndex]} ${n.russianAccusative}`,
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
    russianTemplate: (s, v, n) => `${s.russian} сейчас ${v.continuous[s.conjIndex]} ${n.russianAccusative}`,
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

// Generate phrases from subjects, verbs, and pattern types
export function generatePhrases(
  subjects: Subject[],
  verbs: Verb[],
  patternTypes: SentenceType[],
  lessonId: number,
  idPrefix: string = 'p'
): Phrase[] {
  const phrases: Phrase[] = [];
  let counter = 1;

  const selectedPatterns = patterns.filter(p => patternTypes.includes(p.type));

  for (const pattern of selectedPatterns) {
    for (const subject of subjects) {
      for (const verb of verbs) {
        phrases.push({
          id: `${idPrefix}${lessonId}-${counter++}`,
          russian: pattern.russianTemplate(subject, verb),
          thai: pattern.buildThai(subject, verb),
          transcription: pattern.buildTranscription(subject, verb),
          structure: pattern.buildStructure(subject, verb),
          lessonId,
        });
      }
    }
  }

  return phrases;
}

// Generate phrases with objects from subjects, verbs, nouns, and pattern types
export function generatePhrasesWithObjects(
  subjects: Subject[],
  verbs: Verb[],
  nouns: Noun[],
  patternTypes: SentenceType[],
  lessonId: number,
  idPrefix: string = 'po'
): Phrase[] {
  const phrases: Phrase[] = [];
  let counter = 1;

  const selectedPatterns = patternsWithObject.filter(p => patternTypes.includes(p.type));

  for (const pattern of selectedPatterns) {
    for (const subject of subjects) {
      for (const verb of verbs) {
        for (const noun of nouns) {
          phrases.push({
            id: `${idPrefix}${lessonId}-${counter++}`,
            russian: pattern.russianTemplate(subject, verb, noun),
            thai: pattern.buildThai(subject, verb, noun),
            transcription: pattern.buildTranscription(subject, verb, noun),
            structure: pattern.buildStructure(subject, verb, noun),
            lessonId,
          });
        }
      }
    }
  }

  return phrases;
}

// Shuffle array (Fisher-Yates)
export function shufflePhrases<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Get a subset of phrases (for session)
export function selectPhrases(phrases: Phrase[], count: number): Phrase[] {
  const shuffled = shufflePhrases(phrases);
  return shuffled.slice(0, count);
}
