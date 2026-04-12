import type { Phrase, SentenceType } from './types';
import { patterns, patternsWithObject, patternsWithPronounObject } from './phrasePatterns';
import { questionPatterns } from './phrasePatterns.lesson2';
import type { QuestionWord } from './phrasePatterns.lesson2';
import { patternsWithLocation } from './phrasePatterns.location';
import { isVerbObjectCompatible } from './vocabulary/verbObjectCompatibility';
import type { Location } from './vocabulary/locations';

// Re-export types for backward compatibility
export type { Subject, Verb, Noun, ObjectPronoun } from './phrasePatterns';
export type { Location } from './vocabulary/locations';

// Re-export question types for lesson 2
export type { QuestionWord } from './phrasePatterns.lesson2';

// Re-export name helpers for lesson 2
export { nameToSubject, nameToObjectPronoun } from './vocabulary/names';
export type { Name } from './vocabulary/names';

// Re-export from phrasePatterns for consumers
export { TENSE_MARKERS, ENDINGS, patterns, patternsWithObject, patternsWithPronounObject } from './phrasePatterns';

// Re-export question patterns for consumers
export { questionPatterns } from './phrasePatterns.lesson2';

// Import types for internal use
import type { Subject, Verb, Noun, ObjectPronoun } from './phrasePatterns';

// ============================================================
// Register compatibility table
// ============================================================
const compatibleRegisters: Record<string, string[]> = {
  'formal': ['formal', 'neutral'],
  'neutral': ['formal', 'neutral', 'informal'],
  'informal': ['neutral', 'informal', 'rude'],
  'rude': ['informal', 'rude'],
};

/**
 * Check if subject and object pronoun registers are compatible
 */
function isRegisterCompatible(subject: Subject, objectPronoun: ObjectPronoun): boolean {
  // If subject has no register defined, assume neutral (allow all)
  const subjectRegister = subject.register || 'neutral';
  const allowedRegisters = compatibleRegisters[subjectRegister];
  return allowedRegisters.includes(objectPronoun.register);
}

/**
 * Check if the combination is reflexive (subject === object)
 * Uses conjIndex to determine if both represent the same grammatical person
 */
function isReflexive(subject: Subject, objectPronoun: ObjectPronoun): boolean {
  // Direct Thai text match
  if (subject.thai === objectPronoun.thai) {
    return true;
  }
  
  // Check if they represent the same grammatical person via conjIndex
  // conjIndex: 0 = I/me, 1 = you/thou, 2 = he/him/she/her, 3 = we/us, 4 = you (pl)/you, 5 = they/them
  if (subject.conjIndex === objectPronoun.conjIndex) {
    // Additional check: make sure they're actually the same person in Russian
    const subjectPerson = subject.russian.split('(')[0].trim();
    const objectPerson = objectPronoun.russian.split('(')[0].trim();
    
    // Map Russian pronouns to persons
    const subjectIsFirstPerson = subjectPerson === 'я';
    const objectIsFirstPerson = objectPerson === 'я';
    const subjectIsSecondPerson = subjectPerson === 'ты' || subjectPerson === 'вы';
    const objectIsSecondPerson = objectPerson === 'ты' || objectPerson === 'вы';
    const subjectIsThirdPerson = ['он', 'она', 'они'].includes(subjectPerson);
    const objectIsThirdPerson = ['он', 'она', 'они'].includes(objectPerson);
    
    // If both are same person AND same conjIndex, it's reflexive
    if ((subjectIsFirstPerson && objectIsFirstPerson) ||
        (subjectIsSecondPerson && objectIsSecondPerson) ||
        (subjectIsThirdPerson && objectIsThirdPerson)) {
      return true;
    }
  }
  
  return false;
}

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
          // Семантическая проверка: пропускаем несовместимые пары глагол-существительное
          if (!isVerbObjectCompatible(verb.thai, noun.thai)) {
            continue;
          }

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

// Generate question phrases from subjects, verbs, question words, and question pattern types
// Каждый паттерн использует только своё вопросительное слово (привязка по questionWordThai)
// verbFilters — опционально: фильтр глаголов для конкретных типов паттернов
// subjectFilter — опционально: фильтр подлежащих для конкретных типов паттернов
export function generateQuestionPhrases(
  subjects: Subject[],
  verbs: Verb[],
  questionWords: QuestionWord[],
  patternTypes: SentenceType[],
  lessonId: number,
  idPrefix: string = 'q',
  options?: {
    verbFilters?: { patternType: SentenceType; filterFn: (verb: Verb) => boolean }[];
    subjectFilter?: { patternType: SentenceType; filterFn: (subject: Subject) => boolean }[];
  }
): Phrase[] {
  const phrases: Phrase[] = [];
  let counter = 1;

  const selectedPatterns = questionPatterns.filter(p => patternTypes.includes(p.type));

  for (const pattern of selectedPatterns) {
    // Фильтруем: берём только вопросительное слово, которое соответствует этому паттерну
    const filteredQWs = questionWords.filter(qw => qw.thai === pattern.questionWordThai);

    // Применяем фильтр глаголов, если он задан для этого типа паттерна
    const verbFilter = options?.verbFilters?.find(f => f.patternType === pattern.type);
    const filteredVerbs = verbFilter ? verbs.filter(verbFilter.filterFn) : verbs;

    // Применяем фильтр подлежащих, если задан
    const subjFilter = options?.subjectFilter?.find(f => f.patternType === pattern.type);
    const filteredSubjects = subjFilter ? subjects.filter(subjFilter.filterFn) : subjects;

    for (const subject of filteredSubjects) {
      for (const verb of filteredVerbs) {
        for (const qw of filteredQWs) {
          phrases.push({
            id: `${idPrefix}${lessonId}-${counter++}`,
            russian: pattern.russianTemplate(subject, verb, qw),
            thai: pattern.buildThai(subject, verb, qw),
            transcription: pattern.buildTranscription(subject, verb, qw),
            structure: pattern.buildStructure(subject, verb, qw),
            lessonId,
          });
        }
      }
    }
  }

  return phrases;
}

// Generate phrases with pronoun objects from subjects, verbs, object pronouns, and pattern types
export function generatePhrasesWithPronounObjects(
  subjects: Subject[],
  verbs: Verb[],
  objectPronouns: ObjectPronoun[],
  patternTypes: SentenceType[],
  lessonId: number,
  idPrefix: string = 'pop'
): Phrase[] {
  const phrases: Phrase[] = [];
  let counter = 1;

  const selectedPatterns = patternsWithPronounObject.filter(p => patternTypes.includes(p.type));

  for (const pattern of selectedPatterns) {
    for (const subject of subjects) {
      for (const verb of verbs) {
        for (const objectPronoun of objectPronouns) {
          // Skip reflexive combinations (subject === object)
          if (isReflexive(subject, objectPronoun)) {
            continue;
          }

          // Skip register-incompatible combinations
          if (!isRegisterCompatible(subject, objectPronoun)) {
            continue;
          }

          phrases.push({
            id: `${idPrefix}${lessonId}-${counter++}`,
            russian: pattern.russianTemplate(subject, verb, objectPronoun),
            thai: pattern.buildThai(subject, verb, objectPronoun),
            transcription: pattern.buildTranscription(subject, verb, objectPronoun),
            structure: pattern.buildStructure(subject, verb, objectPronoun),
            lessonId,
          });
        }
      }
    }
  }

  return phrases;
}

// Generate phrases with locations from subjects, verbs, locations, and pattern types
export function generatePhrasesWithLocations(
  subjects: Subject[],
  verbs: Verb[],
  locations: Location[],
  patternTypes: SentenceType[],
  lessonId: number,
  idPrefix: string = 'pl'
): Phrase[] {
  const phrases: Phrase[] = [];
  let counter = 1;

  const selectedPatterns = patternsWithLocation.filter(p => patternTypes.includes(p.type));

  for (const pattern of selectedPatterns) {
    for (const subject of subjects) {
      for (const verb of verbs) {
        for (const location of locations) {
          phrases.push({
            id: `${idPrefix}${lessonId}-${counter++}`,
            russian: pattern.russianTemplate(subject, verb, location),
            thai: pattern.buildThai(subject, verb, location),
            transcription: pattern.buildTranscription(subject, verb, location),
            structure: pattern.buildStructure(subject, verb, location),
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
