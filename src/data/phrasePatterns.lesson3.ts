import type { Subject, Verb } from './phrasePatterns';
import type { PhraseStructure, SentenceType } from './types';
import { TENSE_MARKERS, ENDINGS } from './phrasePatterns';

// ============================================================
// LOCATION COMPLEMENT (для อยู่)
// ============================================================

export interface LocationComplement {
  thai: string;
  transcription: string;
  russian: string;          // дом
  russianPrepositional: string; // в доме / на работе
}

// ============================================================
// IDENTITY/OBJECT COMPLEMENT (สำหรับ เป็น / คือ)
// ============================================================

export interface IdentityComplement {
  thai: string;
  transcription: string;
  russian: string;          // учитель
  russianInstrumental?: string; // учителем (для เป็น)
}

// ============================================================
// ПATTERN INTERFACES
// ============================================================

interface StateLocationPattern {
  type: SentenceType;
  russianTemplate: (subject: string, verb: string, location: string) => string;
  buildStructure: (subject: Subject, verb: Verb, location: LocationComplement) => PhraseStructure[];
  buildThai: (subject: Subject, verb: Verb, location: LocationComplement) => string;
  buildTranscription: (subject: Subject, verb: Verb, location: LocationComplement) => string;
}

interface StateIdentityPattern {
  type: SentenceType;
  russianTemplate: (subject: string, verb: string, complement: string) => string;
  buildStructure: (subject: Subject, verb: Verb, complement: IdentityComplement) => PhraseStructure[];
  buildThai: (subject: Subject, verb: Verb, complement: IdentityComplement) => string;
  buildTranscription: (subject: Subject, verb: Verb, complement: IdentityComplement) => string;
}

// ============================================================
// HELPERS
// ============================================================

// NOTE: These helper functions are kept for future reference but currently unused
// Get correct Russian location form based on tense
// function _getRussianLocationForm(_verb: Verb, location: LocationComplement, _tenseMarker: string): string {
//   // For อยู่, always use prepositional case
//   return location.russianPrepositional;
// }

// Check if verb is อยู่ — needs special handling
// function _isVerbYuu(_verbThai: string): boolean {
//   return _verbThai === 'อยู่';
// }

// ============================================================
// LOCATION PATTERNS (สำหรับ อยู่ + место) — 10 паттернов
// ============================================================

export const stateLocationPatterns: StateLocationPattern[] = [
  // 1. Present Affirmative: Я дома
  {
    type: 'present_affirmative',
    russianTemplate: (subject, _verb, location) => `${subject} ${location}`,
    buildStructure: (subject, verb, location) => [
      { groupId: 'subjects', thai: subject.thai, transcription: subject.transcription },
      { groupId: 'stateVerbs', thai: verb.thai, transcription: verb.transcription },
      { groupId: 'locationComplements', thai: location.thai, transcription: location.transcription },
    ],
    buildThai: (subject, verb, location) => `${subject.thai}${verb.thai}${location.thai}`,
    buildTranscription: (subject, verb, location) => `${subject.transcription} ${verb.transcription} ${location.transcription}`,
  },

  // 2. Present Negative: Я не дома
  {
    type: 'present_negative',
    russianTemplate: (subject, _verb, location) => `${subject} не ${location}`,
    buildStructure: (subject, verb, location) => [
      { groupId: 'subjects', thai: subject.thai, transcription: subject.transcription },
      { groupId: 'stateVerbs', thai: TENSE_MARKERS.negativePresent.thai, transcription: TENSE_MARKERS.negativePresent.transcription },
      { groupId: 'stateVerbs', thai: verb.thai, transcription: verb.transcription },
      { groupId: 'locationComplements', thai: location.thai, transcription: location.transcription },
    ],
    buildThai: (subject, verb, location) => `${subject.thai}${TENSE_MARKERS.negativePresent.thai}${verb.thai}${location.thai}`,
    buildTranscription: (subject, verb, location) => `${subject.transcription} ${TENSE_MARKERS.negativePresent.transcription} ${verb.transcription} ${location.transcription}`,
  },

  // 3. Present Question: Ты дома?
  {
    type: 'present_question',
    russianTemplate: (subject, _verb, location) => `${subject} ${location}?`,
    buildStructure: (subject, verb, location) => [
      { groupId: 'subjects', thai: subject.thai, transcription: subject.transcription },
      { groupId: 'stateVerbs', thai: verb.thai, transcription: verb.transcription },
      { groupId: 'locationComplements', thai: location.thai, transcription: location.transcription },
      { groupId: 'endings', thai: ENDINGS.question.thai, transcription: ENDINGS.question.transcription },
    ],
    buildThai: (subject, verb, location) => `${subject.thai}${verb.thai}${location.thai}${ENDINGS.question.thai}`,
    buildTranscription: (subject, verb, location) => `${subject.transcription} ${verb.transcription} ${location.transcription} ${ENDINGS.question.transcription}`,
  },

  // 4. Past Affirmative: Я был дома
  {
    type: 'past_affirmative',
    russianTemplate: (subject, _verb, location) => `${subject} был(а) ${location}`,
    buildStructure: (subject, verb, location) => [
      { groupId: 'subjects', thai: subject.thai, transcription: subject.transcription },
      { groupId: 'stateVerbs', thai: verb.thai, transcription: verb.transcription },
      { groupId: 'locationComplements', thai: location.thai, transcription: location.transcription },
      { groupId: 'endings', thai: ENDINGS.past.thai, transcription: ENDINGS.past.transcription },
    ],
    buildThai: (subject, verb, location) => `${subject.thai}${verb.thai}${location.thai}${ENDINGS.past.thai}`,
    buildTranscription: (subject, verb, location) => `${subject.transcription} ${verb.transcription} ${location.transcription} ${ENDINGS.past.transcription}`,
  },

  // 5. Past Negative: Я не был дома
  {
    type: 'past_negative',
    russianTemplate: (subject, _verb, location) => `${subject} не был(а) ${location}`,
    buildStructure: (subject, verb, location) => [
      { groupId: 'subjects', thai: subject.thai, transcription: subject.transcription },
      { groupId: 'stateVerbs', thai: TENSE_MARKERS.negativePast.thai, transcription: TENSE_MARKERS.negativePast.transcription },
      { groupId: 'stateVerbs', thai: verb.thai, transcription: verb.transcription },
      { groupId: 'locationComplements', thai: location.thai, transcription: location.transcription },
    ],
    buildThai: (subject, verb, location) => `${subject.thai}${TENSE_MARKERS.negativePast.thai}${verb.thai}${location.thai}`,
    buildTranscription: (subject, verb, location) => `${subject.transcription} ${TENSE_MARKERS.negativePast.transcription} ${verb.transcription} ${location.transcription}`,
  },

  // 6. Past Question: Ты был дома?
  {
    type: 'past_question',
    russianTemplate: (subject, _verb, location) => `${subject} был(а) ${location}?`,
    buildStructure: (subject, verb, location) => [
      { groupId: 'subjects', thai: subject.thai, transcription: subject.transcription },
      { groupId: 'stateVerbs', thai: verb.thai, transcription: verb.transcription },
      { groupId: 'locationComplements', thai: location.thai, transcription: location.transcription },
      { groupId: 'endings', thai: ENDINGS.pastQuestion.thai, transcription: ENDINGS.pastQuestion.transcription },
    ],
    buildThai: (subject, verb, location) => `${subject.thai}${verb.thai}${location.thai}${ENDINGS.pastQuestion.thai}`,
    buildTranscription: (subject, verb, location) => `${subject.transcription} ${verb.transcription} ${location.transcription} ${ENDINGS.pastQuestion.transcription}`,
  },

  // 7. Future Affirmative: Я буду дома
  {
    type: 'future_affirmative',
    russianTemplate: (subject, _verb, location) => `${subject} будет ${location}`,
    buildStructure: (subject, verb, location) => [
      { groupId: 'subjects', thai: subject.thai, transcription: subject.transcription },
      { groupId: 'stateVerbs', thai: TENSE_MARKERS.future.thai, transcription: TENSE_MARKERS.future.transcription },
      { groupId: 'stateVerbs', thai: verb.thai, transcription: verb.transcription },
      { groupId: 'locationComplements', thai: location.thai, transcription: location.transcription },
    ],
    buildThai: (subject, verb, location) => `${subject.thai}${TENSE_MARKERS.future.thai}${verb.thai}${location.thai}`,
    buildTranscription: (subject, verb, location) => `${subject.transcription} ${TENSE_MARKERS.future.transcription} ${verb.transcription} ${location.transcription}`,
  },

  // 8. Future Negative: Я не буду дома
  {
    type: 'future_negative',
    russianTemplate: (subject, _verb, location) => `${subject} не будет ${location}`,
    buildStructure: (subject, verb, location) => [
      { groupId: 'subjects', thai: subject.thai, transcription: subject.transcription },
      { groupId: 'stateVerbs', thai: TENSE_MARKERS.negativeFuture.thai, transcription: TENSE_MARKERS.negativeFuture.transcription },
      { groupId: 'stateVerbs', thai: verb.thai, transcription: verb.transcription },
      { groupId: 'locationComplements', thai: location.thai, transcription: location.transcription },
    ],
    buildThai: (subject, verb, location) => `${subject.thai}${TENSE_MARKERS.negativeFuture.thai}${verb.thai}${location.thai}`,
    buildTranscription: (subject, verb, location) => `${subject.transcription} ${TENSE_MARKERS.negativeFuture.transcription} ${verb.transcription} ${location.transcription}`,
  },

  // 9. Future Question: Ты будешь дома?
  {
    type: 'future_question',
    russianTemplate: (subject, _verb, location) => `${subject} будет ${location}?`,
    buildStructure: (subject, verb, location) => [
      { groupId: 'subjects', thai: subject.thai, transcription: subject.transcription },
      { groupId: 'stateVerbs', thai: TENSE_MARKERS.future.thai, transcription: TENSE_MARKERS.future.transcription },
      { groupId: 'stateVerbs', thai: verb.thai, transcription: verb.transcription },
      { groupId: 'locationComplements', thai: location.thai, transcription: location.transcription },
      { groupId: 'endings', thai: ENDINGS.question.thai, transcription: ENDINGS.question.transcription },
    ],
    buildThai: (subject, verb, location) => `${subject.thai}${TENSE_MARKERS.future.thai}${verb.thai}${location.thai}${ENDINGS.question.thai}`,
    buildTranscription: (subject, verb, location) => `${subject.transcription} ${TENSE_MARKERS.future.transcription} ${verb.transcription} ${location.transcription} ${ENDINGS.question.transcription}`,
  },

  // 10. Continuous: Я сейчас дома
  {
    type: 'continuous',
    russianTemplate: (subject, _verb, location) => `${subject} сейчас ${location}`,
    buildStructure: (subject, verb, location) => [
      { groupId: 'subjects', thai: subject.thai, transcription: subject.transcription },
      { groupId: 'stateVerbs', thai: TENSE_MARKERS.continuous.thai, transcription: TENSE_MARKERS.continuous.transcription },
      { groupId: 'stateVerbs', thai: verb.thai, transcription: verb.transcription },
      { groupId: 'locationComplements', thai: location.thai, transcription: location.transcription },
    ],
    buildThai: (subject, verb, location) => `${subject.thai}${TENSE_MARKERS.continuous.thai}${verb.thai}${location.thai}`,
    buildTranscription: (subject, verb, location) => `${subject.transcription} ${TENSE_MARKERS.continuous.transcription} ${verb.transcription} ${location.transcription}`,
  },
];

// ============================================================
// IDENTITY PATTERNS (สำหรับ เป็น / คือ + кем/что) — 3 паттерна
// (без времён, только утверждение/отрицание/вопрос)
// ============================================================

export const stateIdentityPatterns: StateIdentityPattern[] = [
  // 1. Affirmative: Я учитель
  {
    type: 'present_affirmative',
    russianTemplate: (subject, _verb, complement) => {
      // สำหรับ เป็น используем творительный падеж если есть
      if (_verb === 'เป็น' && complement.includes('учител')) {
        return `${subject} — учитель`;
      }
      return `${subject} — ${complement}`;
    },
    buildStructure: (subject, verb, complement) => [
      { groupId: 'subjects', thai: subject.thai, transcription: subject.transcription },
      { groupId: 'stateVerbs', thai: verb.thai, transcription: verb.transcription },
      { groupId: 'identityComplements', thai: complement.thai, transcription: complement.transcription },
    ],
    buildThai: (subject, verb, complement) => `${subject.thai}${verb.thai}${complement.thai}`,
    buildTranscription: (subject, verb, complement) => `${subject.transcription} ${verb.transcription} ${complement.transcription}`,
  },

  // 2. Negative: Я не учитель
  {
    type: 'present_negative',
    russianTemplate: (subject, _verb, complement) => `${subject} не ${complement}`,
    buildStructure: (subject, verb, complement) => [
      { groupId: 'subjects', thai: subject.thai, transcription: subject.transcription },
      { groupId: 'stateVerbs', thai: TENSE_MARKERS.negativePresent.thai, transcription: TENSE_MARKERS.negativePresent.transcription },
      { groupId: 'stateVerbs', thai: verb.thai, transcription: verb.transcription },
      { groupId: 'identityComplements', thai: complement.thai, transcription: complement.transcription },
    ],
    buildThai: (subject, verb, complement) => `${subject.thai}${TENSE_MARKERS.negativePresent.thai}${verb.thai}${complement.thai}`,
    buildTranscription: (subject, verb, complement) => `${subject.transcription} ${TENSE_MARKERS.negativePresent.transcription} ${verb.transcription} ${complement.transcription}`,
  },

  // 3. Question: Ты учитель?
  {
    type: 'present_question',
    russianTemplate: (subject, _verb, complement) => `${subject} — ${complement}?`,
    buildStructure: (subject, verb, complement) => [
      { groupId: 'subjects', thai: subject.thai, transcription: subject.transcription },
      { groupId: 'stateVerbs', thai: verb.thai, transcription: verb.transcription },
      { groupId: 'identityComplements', thai: complement.thai, transcription: complement.transcription },
      { groupId: 'endings', thai: ENDINGS.question.thai, transcription: ENDINGS.question.transcription },
    ],
    buildThai: (subject, verb, complement) => `${subject.thai}${verb.thai}${complement.thai}${ENDINGS.question.thai}`,
    buildTranscription: (subject, verb, complement) => `${subject.transcription} ${verb.transcription} ${complement.transcription} ${ENDINGS.question.transcription}`,
  },
];
