import type { Phrase, WordGroup } from '../types';
import { pronouns, stateVerbs, locationComplements, identityComplements } from '../vocabulary/lessons/lesson3';
import { stateLocationPatterns, stateIdentityPatterns } from '../phrasePatterns.lesson3';
import { shufflePhrases } from '../phraseGenerator';

// ============================================================
// HELPER: generate phrases from subjects x verbs x complements x patterns
// ============================================================

function generateStateLocationPhrases(
  subjects: typeof pronouns,
  verbs: typeof stateVerbs,
  locations: typeof locationComplements,
  patterns: typeof stateLocationPatterns,
  lessonId: number,
  idPrefix: string
): Phrase[] {
  const phrases: Phrase[] = [];
  let counter = 1;

  for (const subject of subjects) {
    for (const verb of verbs) {
      // Only อยู่ makes sense with locations
      if (verb.thai !== 'อยู่') continue;

      for (const location of locations) {
        for (const pattern of patterns) {
          const structure = pattern.buildStructure(subject, verb, location);
          const thai = pattern.buildThai(subject, verb, location);
          const transcription = pattern.buildTranscription(subject, verb, location);
          const russian = pattern.russianTemplate(subject.russian, verb.infinitive, location.russianPrepositional);

          phrases.push({
            id: `${idPrefix}-${counter}`,
            russian,
            thai,
            transcription,
            structure,
            lessonId,
          });
          counter++;
        }
      }
    }
  }

  return phrases;
}

function generateStateIdentityPhrases(
  subjects: typeof pronouns,
  verbs: typeof stateVerbs,
  complements: typeof identityComplements,
  patterns: typeof stateIdentityPatterns,
  lessonId: number,
  idPrefix: string
): Phrase[] {
  const phrases: Phrase[] = [];
  let counter = 1;

  for (const subject of subjects) {
    for (const verb of verbs) {
      // เป็น and คือ only
      if (verb.thai === 'อยู่') continue;

      for (const complement of complements) {
        for (const pattern of patterns) {
          const structure = pattern.buildStructure(subject, verb, complement);
          const thai = pattern.buildThai(subject, verb, complement);
          const transcription = pattern.buildTranscription(subject, verb, complement);

          let russian: string;
          if (pattern.type === 'present_affirmative') {
            russian = `${subject.russian} — ${complement.russian}`;
          } else if (pattern.type === 'present_negative') {
            russian = `${subject.russian} не ${complement.russian}`;
          } else {
            russian = `${subject.russian} — ${complement.russian}?`;
          }

          phrases.push({
            id: `${idPrefix}-${counter}`,
            russian,
            thai,
            transcription,
            structure,
            lessonId,
          });
          counter++;
        }
      }
    }
  }

  return phrases;
}

// ============================================================
// LESSON 3 PHRASES
// ============================================================

// 1. อยู่ + location (10 patterns x 11 subjects x 1 verb x 13 locations = ~1430)
export const lesson3LocationPhrases: Phrase[] = generateStateLocationPhrases(
  pronouns,
  stateVerbs,
  locationComplements,
  stateLocationPatterns,
  3,
  'p3l'
);

// 2. เป็น/คือ + identity (3 patterns x 11 subjects x 2 verbs x 9 complements = ~594)
export const lesson3IdentityPhrases: Phrase[] = generateStateIdentityPhrases(
  pronouns,
  stateVerbs,
  identityComplements,
  stateIdentityPatterns,
  3,
  'p3i'
);

// All phrases combined
export const lesson3AllPhrases: Phrase[] = shufflePhrases([
  ...lesson3LocationPhrases,
  ...lesson3IdentityPhrases,
]);

// ============================================================
// WORD GROUPS (для конструктора фраз)
// ============================================================

export const lesson3WordGroups: WordGroup[] = [
  {
    id: 'subjects',
    name: 'Кто?',
    options: pronouns.map(s => ({
      thai: s.thai,
      transcription: s.transcription,
      russian: s.russian,
    })),
  },
  {
    id: 'stateVerbs',
    name: 'Глагол',
    options: stateVerbs.map(v => ({
      thai: v.thai,
      transcription: v.transcription,
      russian: v.infinitive,
    })),
  },
  {
    id: 'locationComplements',
    name: 'Место',
    options: locationComplements.map(l => ({
      thai: l.thai,
      transcription: l.transcription,
      russian: l.russianPrepositional,
    })),
  },
  {
    id: 'identityComplements',
    name: 'Кем/Что?',
    options: identityComplements.map(c => ({
      thai: c.thai,
      transcription: c.transcription,
      russian: c.russian,
    })),
  },
  {
    id: 'tense',
    name: 'Время',
    options: [
      { thai: '', transcription: '', russian: 'настоящее' },
      { thai: 'จะ', transcription: 'jà', russian: 'будущее' },
      { thai: 'กำลัง', transcription: 'gam-lang', russian: 'сейчас' },
      { thai: 'ไม่', transcription: 'mâi', russian: 'не' },
      { thai: 'จะไม่', transcription: 'jà mâi', russian: 'не буду' },
      { thai: 'ไม่ได้', transcription: 'mâi-dâi', russian: 'не (прош.)' },
    ],
  },
  {
    id: 'endings',
    name: 'Окончание',
    options: [
      { thai: '', transcription: '', russian: '' },
      { thai: 'แล้ว', transcription: 'láew', russian: 'уже' },
      { thai: 'ไหม', transcription: 'mǎi', russian: '?' },
      { thai: 'ครับ', transcription: 'kráp', russian: '(вежл. муж.)' },
      { thai: 'ค่ะ', transcription: 'kâ', russian: '(вежл. жен.)' },
    ],
  },
];
