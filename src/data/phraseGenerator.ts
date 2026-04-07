import type { Phrase, SentenceType } from './types';
import { patterns, patternsWithObject } from './phrasePatterns';

// Re-export types for backward compatibility
export type { Subject, Verb, Noun } from './phrasePatterns';

// Re-export from phrasePatterns for consumers
export { TENSE_MARKERS, ENDINGS, patterns, patternsWithObject } from './phrasePatterns';

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
