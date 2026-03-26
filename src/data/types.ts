// Word categories
export type WordCategory = 'pronoun' | 'verb' | 'particle' | 'noun' | 'adjective' | 'adverb';

// Word definition
export interface Word {
  id: string;
  thai: string;
  transcription: string;
  russian: string;
  category: WordCategory;
  lessonId: number;
  audioFile?: string;  // 'words/w1-1.mp3' — path to local audio file
}

// Progress tracking for a single word
export interface WordProgress {
  wordId: string;
  correctStreak: number;     // 0-4, resets on error
  isReversed: boolean;       // true = show Thai -> Russian
  completed: boolean;        // true after 4 correct answers
  lastPracticed: number;     // timestamp
  timesCorrect: number;
  timesWrong: number;
}

// Word group for phrase builder
export interface WordGroup {
  id: string;
  name: string;
  options: WordOption[];
}

export interface WordOption {
  thai: string;
  transcription: string;
  russian: string;
}

// Phrase for phrase builder exercise
export interface Phrase {
  id: string;
  russian: string;
  thai: string;
  transcription: string;
  structure: PhraseStructure[];
  lessonId: number;
  audioFile?: string;  // 'phrases/p1-1.mp3' — path to local audio file
}

export interface PhraseStructure {
  groupId: string;
  thai: string;
  transcription: string;
}

// Phrase exercise state
export interface PhraseExercise {
  phraseId: string;
  status: 'pending' | 'correct' | 'wrong' | 'retry';
}

// Sentence pattern for phrase generation
export type SentenceType =
  | 'present_affirmative'      // Я ем
  | 'present_negative'         // Я не ем
  | 'present_question'         // Ты ешь?
  | 'past_affirmative'         // Я поел
  | 'past_negative'            // Я не ел
  | 'past_question'            // Ты поел?
  | 'future_affirmative'       // Я буду есть
  | 'future_negative'          // Я не буду есть
  | 'future_question'          // Ты будешь есть?
  | 'continuous'               // Я сейчас ем
  // With object (noun)
  | 'present_affirmative_obj'  // Я открываю дверь
  | 'present_negative_obj'     // Я не открываю дверь
  | 'present_question_obj'     // Ты открываешь дверь?
  | 'past_affirmative_obj'     // Я открыл дверь
  | 'past_negative_obj'        // Я не открывал дверь
  | 'future_affirmative_obj'   // Я открою дверь
  | 'future_negative_obj'      // Я не открою дверь
  | 'continuous_obj';          // Я сейчас открываю дверь

export interface SentencePattern {
  type: SentenceType;
  template: string[];  // e.g., ['subject', 'tense', 'verb', 'ending']
  russianTemplate: (subject: string, verb: string) => string;
}

// Verb with conjugation info for Russian
export interface VerbForGeneration {
  thai: string;
  transcription: string;
  russian: {
    infinitive: string;      // есть
    present: string;         // ем/ешь/ест/едим/едите/едят
    past: string;            // ел/ела/ели
    future: string;          // буду есть
    continuous: string;      // ем (сейчас)
    presentQuestion: string; // ешь?
    pastQuestion: string;    // ел?/поел?
    futureQuestion: string;  // будешь есть?
  };
}

// Subject with Russian conjugation forms
export interface SubjectForGeneration {
  thai: string;
  transcription: string;
  russian: string;
  conjugationIndex: number;  // 0=я, 1=ты, 2=он/она, 3=мы, 4=вы, 5=они
}

// Lesson definition
export interface Lesson {
  id: number;
  title: string;
  description: string;
  sections: LessonSection[];
}

export interface LessonSection {
  id: string;
  type: 'theory' | 'words' | 'phrases' | 'tones';
  title: string;
  description?: string;
}

// Theory section types
export interface TheorySection {
  title: string;
  content: string;
  example?: TheoryExample;
  table?: TheoryTable;
  note?: string;
}

export interface TheoryExample {
  thai: string;
  transcription: string;
  russian: string;
}

export interface TheoryTable {
  headers: string[];
  rows: TheoryTableRow[];
}

export interface TheoryTableRow {
  cells: string[];
}

export interface TheoryData {
  title: string;
  sections: TheorySection[];
  table: MainTheoryTable;
}

export interface MainTheoryTableCell {
  thai: string;
  transcription: string;
  russian: string;
}

export interface MainTheoryTableRow {
  label: string;
  cells: MainTheoryTableCell[];
}

export interface MainTheoryTable {
  headers: string[];
  rows: MainTheoryTableRow[];
}

// Lesson progress
export interface LessonProgress {
  lessonId: number;
  wordsProgress: number;       // 0-100%
  phrasesCompleted: number;    // Number of phrases completed
  phrasesTotal: number;        // Total phrases in lesson
  phrasesCorrect: number;
  phrasesWrong: number;
  completed: boolean;
  lastPracticed: number;
}

// User settings
export interface UserSettings {
  speechRate: number;          // 0.5 - 2
  speechEnabled: boolean;
  theme: 'light' | 'dark';
}

// Full storage structure
export interface StorageData {
  version: number;
  wordProgress: Record<string, WordProgress>;
  lessonProgress: Record<number, LessonProgress>;
  settings: UserSettings;
  lastSync?: number;
}

// Default values
export const DEFAULT_SETTINGS: UserSettings = {
  speechRate: 0.8,
  speechEnabled: true,
  theme: 'light',
};

export const DEFAULT_STORAGE: StorageData = {
  version: 1,
  wordProgress: {},
  lessonProgress: {},
  settings: DEFAULT_SETTINGS,
};
