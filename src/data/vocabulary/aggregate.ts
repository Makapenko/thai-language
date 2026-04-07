import type { Subject, Verb, Noun } from '../phrasePatterns';
import { lesson1Vocab } from './lessons/lesson1';
import { lesson2Vocab } from './lessons/lesson2';

// Тип для словаря одного урока
interface LessonVocab {
  pronouns?: Subject[];
  verbs?: Verb[];
  nouns?: Noun[];
  particles?: Array<{ thai: string; transcription: string; russian: string; type: string }>;
  questionWords?: Array<{ thai: string; transcription: string; russian: string }>;
}

// Все уроки словаря — добавлять новые по мере создания
const allVocabLessons: LessonVocab[] = [
  lesson1Vocab,
  lesson2Vocab,
  // lesson3Vocab,  // и т.д.
];

export interface CumulativeVocab {
  pronouns: Subject[];
  verbs: Verb[];
  nouns: Noun[];
  particles: Array<{ thai: string; transcription: string; russian: string; type: string }>;
  questionWords: Array<{ thai: string; transcription: string; russian: string }>;
}

/**
 * Собирает все слова из уроков 1..upToLesson.
 * Урок N получает накопительный словарь: свои слова + все предыдущие.
 */
export function getCumulativeVocab(upToLesson: number): CumulativeVocab {
  const pronouns: Subject[] = [];
  const verbs: Verb[] = [];
  const nouns: Noun[] = [];
  const particles: Array<{ thai: string; transcription: string; russian: string; type: string }> = [];
  const questionWords: Array<{ thai: string; transcription: string; russian: string }> = [];

  const count = Math.min(upToLesson, allVocabLessons.length);

  for (let i = 0; i < count; i++) {
    const vocab = allVocabLessons[i];
    if (vocab.pronouns) pronouns.push(...vocab.pronouns);
    if (vocab.verbs) verbs.push(...vocab.verbs);
    if (vocab.nouns) nouns.push(...vocab.nouns);
    if (vocab.particles) particles.push(...vocab.particles);
    if (vocab.questionWords) questionWords.push(...vocab.questionWords);
  }

  return { pronouns, verbs, nouns, particles, questionWords };
}
