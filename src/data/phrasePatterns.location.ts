import type { PhraseStructure, SentenceType } from './types';
import { capitalizeFirst } from '../utils/capitalizeFirst';
import { TENSE_MARKERS, ENDINGS } from './phrasePatterns';
import type { Subject, Verb } from './phrasePatterns';
import type { Location } from './vocabulary/locations';

// Verbs that use "around" case (เที่ยว — travel around)
const aroundVerbs = ['เที่ยว'];

/**
 * Get the correct Russian location form based on the verb
 */
function getRussianLocationForm(verb: Verb, location: Location): string {
  if (verb.thai === 'อยู่') {
    return location.russianPrepositional; // "в Бангкоке"
  }
  if (aroundVerbs.includes(verb.thai)) {
    return location.russianAround; // "по Бангкоку"
  }
  return location.russianDirectional; // "в Бангкок"
}

/**
 * Get the Thai location part — just the city/country name (for audio lookup)
 * The prefix ที่ is appended to the verb in buildThai
 */
function getThaiLocationPart(verb: Verb, location: Location): string {
  return location.thai; // just the city name: กรุงเทพ
}

/**
 * Get the Thai transcription for the location part
 */
function getTranscriptionLocationPart(_verb: Verb, location: Location): string {
  return location.transcription;
}

/**
 * Check if verb requires the ที่ prefix (อยู่ = live/reside)
 */
function needsPrefix(verb: Verb): boolean {
  return verb.thai === 'อยู่';
}

/**
 * Get the verb Thai text with optional ที่ prefix
 */
function getVerbThai(verb: Verb): string {
  if (needsPrefix(verb)) {
    return `${verb.thai}ที่`; // อยู่ที่
  }
  return verb.thai;
}

/**
 * Get the verb transcription with optional ที่ transcription
 */
function getVerbTranscription(verb: Verb): string {
  if (needsPrefix(verb)) {
    return `${verb.transcription} tîi`; // yùu tîi
  }
  return verb.transcription;
}

// ============================================================
// Helper: get subject label (same as phrasePatterns.ts)
// ============================================================
function getSubjectLabel(subject: Subject): string {
  if (subject.russian.startsWith('я')) {
    if (subject.russian.includes('(')) {
      return subject.russian;
    }
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
// Helper: get past tense form based on subject's gender (same as phrasePatterns.ts)
// ============================================================
function getPastForm(verb: Verb, subject: Subject): string {
  if (verb.past.length === 1) return verb.past[0];
  switch (subject.gender) {
    case 'fem':
      return verb.past[1];
    case 'plural':
      return verb.past[2];
    default:
      return verb.past[0];
  }
}

// ============================================================
// Location pattern interface
// ============================================================
interface PatternWithLocation {
  type: SentenceType;
  russianTemplate: (subject: Subject, verb: Verb, location: Location) => string;
  buildStructure: (subject: Subject, verb: Verb, location: Location) => PhraseStructure[];
  buildThai: (subject: Subject, verb: Verb, location: Location) => string;
  buildTranscription: (subject: Subject, verb: Verb, location: Location) => string;
}

// ============================================================
// LOCATION PATTERNS — шаблоны с локациями (10 штук)
// For verbs: อยู่ (жить), ไป (ехать), มา (приходить), เที่ยว (путешествовать), บิน (летать)
// ============================================================
export const patternsWithLocation: PatternWithLocation[] = [
  // Present affirmative with location: Я живу в Бангкоке / Я еду в Бангкок
  {
    type: 'present_affirmative_loc',
    russianTemplate: (s, v, loc) => capitalizeFirst(`${getSubjectLabel(s)} ${v.present[s.conjIndex]} ${getRussianLocationForm(v, loc)}`),
    buildStructure: (s, v, loc) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: getVerbThai(v), transcription: getVerbTranscription(v) },
      { groupId: 'location', thai: getThaiLocationPart(v, loc), transcription: getTranscriptionLocationPart(v, loc) },
    ],
    buildThai: (s, v, loc) => `${s.thai}${getVerbThai(v)}${getThaiLocationPart(v, loc)}`,
    buildTranscription: (s, v, loc) => `${s.transcription} ${getVerbTranscription(v)} ${getTranscriptionLocationPart(v, loc)}`,
  },

  // Present negative with location: Я не живу в Бангкоке
  {
    type: 'present_negative_loc',
    russianTemplate: (s, v, loc) => capitalizeFirst(`${getSubjectLabel(s)} не ${v.present[s.conjIndex]} ${getRussianLocationForm(v, loc)}`),
    buildStructure: (s, v, loc) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.negativePresent.thai, transcription: TENSE_MARKERS.negativePresent.transcription },
      { groupId: 'verb', thai: getVerbThai(v), transcription: getVerbTranscription(v) },
      { groupId: 'location', thai: getThaiLocationPart(v, loc), transcription: getTranscriptionLocationPart(v, loc) },
    ],
    buildThai: (s, v, loc) => `${s.thai}${TENSE_MARKERS.negativePresent.thai}${getVerbThai(v)}${getThaiLocationPart(v, loc)}`,
    buildTranscription: (s, v, loc) => `${s.transcription} ${TENSE_MARKERS.negativePresent.transcription} ${getVerbTranscription(v)} ${getTranscriptionLocationPart(v, loc)}`,
  },

  // Present question with location: Ты живёшь в Бангкоке?
  {
    type: 'present_question_loc',
    russianTemplate: (s, v, loc) => capitalizeFirst(`${getSubjectLabel(s)} ${v.present[s.conjIndex]} ${getRussianLocationForm(v, loc)}?`),
    buildStructure: (s, v, loc) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: getVerbThai(v), transcription: getVerbTranscription(v) },
      { groupId: 'location', thai: getThaiLocationPart(v, loc), transcription: getTranscriptionLocationPart(v, loc) },
      { groupId: 'ending', thai: ENDINGS.question.thai, transcription: ENDINGS.question.transcription },
    ],
    buildThai: (s, v, loc) => `${s.thai}${getVerbThai(v)}${getThaiLocationPart(v, loc)}${ENDINGS.question.thai}`,
    buildTranscription: (s, v, loc) => `${s.transcription} ${getVerbTranscription(v)} ${getTranscriptionLocationPart(v, loc)} ${ENDINGS.question.transcription}`,
  },

  // Past affirmative with location: Я жил в Бангкоке / Я поехал в Бангкок
  {
    type: 'past_affirmative_loc',
    russianTemplate: (s, v, loc) => capitalizeFirst(`${s.russian} ${getPastForm(v, s)} ${getRussianLocationForm(v, loc)}`),
    buildStructure: (s, v, loc) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: getVerbThai(v), transcription: getVerbTranscription(v) },
      { groupId: 'location', thai: getThaiLocationPart(v, loc), transcription: getTranscriptionLocationPart(v, loc) },
      { groupId: 'ending', thai: ENDINGS.past.thai, transcription: ENDINGS.past.transcription },
    ],
    buildThai: (s, v, loc) => `${s.thai}${getVerbThai(v)}${getThaiLocationPart(v, loc)}${ENDINGS.past.thai}`,
    buildTranscription: (s, v, loc) => `${s.transcription} ${getVerbTranscription(v)} ${getTranscriptionLocationPart(v, loc)} ${ENDINGS.past.transcription}`,
  },

  // Past negative with location: Я не жил в Бангкоке / Я не ездил в Бангкок
  {
    type: 'past_negative_loc',
    russianTemplate: (s, v, loc) => capitalizeFirst(`${s.russian} не ${getPastForm(v, s)} ${getRussianLocationForm(v, loc)}`),
    buildStructure: (s, v, loc) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.negativePast.thai, transcription: TENSE_MARKERS.negativePast.transcription },
      { groupId: 'verb', thai: getVerbThai(v), transcription: getVerbTranscription(v) },
      { groupId: 'location', thai: getThaiLocationPart(v, loc), transcription: getTranscriptionLocationPart(v, loc) },
    ],
    buildThai: (s, v, loc) => `${s.thai}${TENSE_MARKERS.negativePast.thai}${getVerbThai(v)}${getThaiLocationPart(v, loc)}`,
    buildTranscription: (s, v, loc) => `${s.transcription} ${TENSE_MARKERS.negativePast.transcription} ${getVerbTranscription(v)} ${getTranscriptionLocationPart(v, loc)}`,
  },

  // Past question with location: Ты жил в Бангкоке? / Ты поехал в Бангкок?
  {
    type: 'past_question_loc',
    russianTemplate: (s, v, loc) => capitalizeFirst(`${s.russian} ${getPastForm(v, s)} ${getRussianLocationForm(v, loc)}?`),
    buildStructure: (s, v, loc) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: getVerbThai(v), transcription: getVerbTranscription(v) },
      { groupId: 'location', thai: getThaiLocationPart(v, loc), transcription: getTranscriptionLocationPart(v, loc) },
      { groupId: 'ending', thai: ENDINGS.past.thai, transcription: ENDINGS.past.transcription },
      { groupId: 'ending', thai: ENDINGS.question.thai, transcription: ENDINGS.question.transcription },
    ],
    buildThai: (s, v, loc) => `${s.thai}${getVerbThai(v)}${getThaiLocationPart(v, loc)}${ENDINGS.past.thai}${ENDINGS.question.thai}`,
    buildTranscription: (s, v, loc) => `${s.transcription} ${getVerbTranscription(v)} ${getTranscriptionLocationPart(v, loc)} ${ENDINGS.past.transcription} ${ENDINGS.question.transcription}`,
  },

  // Future affirmative with location: Я буду жить в Бангкоке / Я поеду в Бангкок
  {
    type: 'future_affirmative_loc',
    russianTemplate: (s, v, loc) => capitalizeFirst(`${getSubjectLabel(s)} ${v.future[s.conjIndex]} ${getRussianLocationForm(v, loc)}`),
    buildStructure: (s, v, loc) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.future.thai, transcription: TENSE_MARKERS.future.transcription },
      { groupId: 'verb', thai: getVerbThai(v), transcription: getVerbTranscription(v) },
      { groupId: 'location', thai: getThaiLocationPart(v, loc), transcription: getTranscriptionLocationPart(v, loc) },
    ],
    buildThai: (s, v, loc) => `${s.thai}${TENSE_MARKERS.future.thai}${getVerbThai(v)}${getThaiLocationPart(v, loc)}`,
    buildTranscription: (s, v, loc) => `${s.transcription} ${TENSE_MARKERS.future.transcription} ${getVerbTranscription(v)} ${getTranscriptionLocationPart(v, loc)}`,
  },

  // Future negative with location: Я не буду жить в Бангкоке / Я не поеду в Бангкок
  {
    type: 'future_negative_loc',
    russianTemplate: (s, v, loc) => capitalizeFirst(`${getSubjectLabel(s)} не ${v.future[s.conjIndex]} ${getRussianLocationForm(v, loc)}`),
    buildStructure: (s, v, loc) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.negativeFuture.thai, transcription: TENSE_MARKERS.negativeFuture.transcription },
      { groupId: 'verb', thai: getVerbThai(v), transcription: getVerbTranscription(v) },
      { groupId: 'location', thai: getThaiLocationPart(v, loc), transcription: getTranscriptionLocationPart(v, loc) },
    ],
    buildThai: (s, v, loc) => `${s.thai}${TENSE_MARKERS.negativeFuture.thai}${getVerbThai(v)}${getThaiLocationPart(v, loc)}`,
    buildTranscription: (s, v, loc) => `${s.transcription} ${TENSE_MARKERS.negativeFuture.transcription} ${getVerbTranscription(v)} ${getTranscriptionLocationPart(v, loc)}`,
  },

  // Future question with location: Ты будешь жить в Бангкоке? / Ты поедешь в Бангкок?
  {
    type: 'future_question_loc',
    russianTemplate: (s, v, loc) => capitalizeFirst(`${getSubjectLabel(s)} ${v.future[s.conjIndex]} ${getRussianLocationForm(v, loc)}?`),
    buildStructure: (s, v, loc) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.future.thai, transcription: TENSE_MARKERS.future.transcription },
      { groupId: 'verb', thai: getVerbThai(v), transcription: getVerbTranscription(v) },
      { groupId: 'location', thai: getThaiLocationPart(v, loc), transcription: getTranscriptionLocationPart(v, loc) },
      { groupId: 'ending', thai: ENDINGS.question.thai, transcription: ENDINGS.question.transcription },
    ],
    buildThai: (s, v, loc) => `${s.thai}${TENSE_MARKERS.future.thai}${getVerbThai(v)}${getThaiLocationPart(v, loc)}${ENDINGS.question.thai}`,
    buildTranscription: (s, v, loc) => `${s.transcription} ${TENSE_MARKERS.future.transcription} ${getVerbTranscription(v)} ${getTranscriptionLocationPart(v, loc)} ${ENDINGS.question.transcription}`,
  },

  // Continuous with location: Я сейчас живу в Бангкоке / Я сейчас еду в Бангкок
  {
    type: 'continuous_loc',
    russianTemplate: (s, v, loc) => capitalizeFirst(`${getSubjectLabel(s)} сейчас ${v.continuous[s.conjIndex]} ${getRussianLocationForm(v, loc)}`),
    buildStructure: (s, v, loc) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.continuous.thai, transcription: TENSE_MARKERS.continuous.transcription },
      { groupId: 'verb', thai: getVerbThai(v), transcription: getVerbTranscription(v) },
      { groupId: 'location', thai: getThaiLocationPart(v, loc), transcription: getTranscriptionLocationPart(v, loc) },
    ],
    buildThai: (s, v, loc) => `${s.thai}${TENSE_MARKERS.continuous.thai}${getVerbThai(v)}${getThaiLocationPart(v, loc)}`,
    buildTranscription: (s, v, loc) => `${s.transcription} ${TENSE_MARKERS.continuous.transcription} ${getVerbTranscription(v)} ${getTranscriptionLocationPart(v, loc)}`,
  },
];
