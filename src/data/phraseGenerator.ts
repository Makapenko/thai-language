import type { Phrase, SentenceType } from './types';
import { patterns, patternsWithObject } from './phrasePatterns';
import { questionPatterns } from './phrasePatterns.lesson2';
import type { QuestionWord } from './phrasePatterns.lesson2';
import { isVerbObjectCompatible } from './vocabulary/verbObjectCompatibility';

// Re-export types for backward compatibility
export type { Subject, Verb, Noun } from './phrasePatterns';

// Re-export question types for lesson 2
export type { QuestionWord } from './phrasePatterns.lesson2';

// Re-export from phrasePatterns for consumers
export { TENSE_MARKERS, ENDINGS, patterns, patternsWithObject } from './phrasePatterns';

// Re-export question patterns for consumers
export { questionPatterns } from './phrasePatterns.lesson2';

// Import types for internal use
import type { Subject, Verb, Noun } from './phrasePatterns';

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
