/**
 * Activity IDs for the Thai language learning app
 * Used for tracking daily progress
 */

export const THAI_ACTIVITY_IDS = {
  // Word exercises
  WORD_EXERCISES: 'word-exercises',
  
  // Phrase exercises
  PHRASE_EXERCISES: 'phrase-exercises',
} as const;

export type ThaiActivityId = (typeof THAI_ACTIVITY_IDS)[keyof typeof THAI_ACTIVITY_IDS];

// Daily goal constants (in seconds)
export const DAILY_GOALS = {
  WORDS_TIME: 300,           // 5 minutes for words
  WORDS_COUNT: 10,           // 10 words learned to level 4
  PHRASES_TIME: 300,         // 5 minutes for phrases
  PHRASES_COUNT: 10,         // 10 correct phrases
} as const;
