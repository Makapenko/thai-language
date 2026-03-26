import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Word, WordProgress } from '../../data/types';

interface WordsState {
  words: Word[];
  progress: Record<string, WordProgress>;
  currentWordId: string | null;
  isReversedMode: boolean;
  exerciseComplete: boolean;
}

const initialState: WordsState = {
  words: [],
  progress: {},
  currentWordId: null,
  isReversedMode: false,
  exerciseComplete: false,
};

const wordsSlice = createSlice({
  name: 'words',
  initialState,
  reducers: {
    setWords: (state, action: PayloadAction<Word[]>) => {
      state.words = action.payload;
      state.exerciseComplete = false;
    },

    setProgress: (state, action: PayloadAction<Record<string, WordProgress>>) => {
      state.progress = action.payload;
    },

    setCurrentWord: (state, action: PayloadAction<string | null>) => {
      state.currentWordId = action.payload;
    },

    answerCorrect: (state, action: PayloadAction<string>) => {
      const wordId = action.payload;
      const progress = state.progress[wordId] || {
        wordId,
        correctStreak: 0,
        isReversed: false,
        completed: false,
        lastPracticed: Date.now(),
        timesCorrect: 0,
        timesWrong: 0,
      };

      progress.correctStreak += 1;
      progress.timesCorrect += 1;
      progress.lastPracticed = Date.now();

      // After 3 correct, switch to reversed mode
      if (progress.correctStreak === 3) {
        progress.isReversed = true;
      }

      // After 4 correct (3 normal + 1 reversed), mark as completed
      if (progress.correctStreak >= 4) {
        progress.completed = true;
      }

      state.progress[wordId] = progress;
    },

    answerWrong: (state, action: PayloadAction<string>) => {
      const wordId = action.payload;
      const progress = state.progress[wordId] || {
        wordId,
        correctStreak: 0,
        isReversed: false,
        completed: false,
        lastPracticed: Date.now(),
        timesCorrect: 0,
        timesWrong: 0,
      };

      progress.correctStreak = 0;
      progress.isReversed = false;
      progress.timesWrong += 1;
      progress.lastPracticed = Date.now();

      state.progress[wordId] = progress;
    },

    setExerciseComplete: (state, action: PayloadAction<boolean>) => {
      state.exerciseComplete = action.payload;
    },

    resetWordsProgress: (state, action: PayloadAction<number>) => {
      const lessonId = action.payload;
      const wordsInLesson = state.words.filter(w => w.lessonId === lessonId);
      wordsInLesson.forEach(word => {
        delete state.progress[word.id];
      });
      state.exerciseComplete = false;
    },
  },
});

export const {
  setWords,
  setProgress,
  setCurrentWord,
  answerCorrect,
  answerWrong,
  setExerciseComplete,
  resetWordsProgress,
} = wordsSlice.actions;

export default wordsSlice.reducer;

// Selectors
export const selectWords = (state: { words: WordsState }) => state.words.words;
export const selectWordsProgress = (state: { words: WordsState }) => state.words.progress;
export const selectCurrentWordId = (state: { words: WordsState }) => state.words.currentWordId;
export const selectExerciseComplete = (state: { words: WordsState }) => state.words.exerciseComplete;

export const selectWordsByLesson = (lessonId: number) => (state: { words: WordsState }) =>
  state.words.words.filter(w => w.lessonId === lessonId);

export const selectLessonWordsProgress = (lessonId: number) => (state: { words: WordsState }) => {
  const words = state.words.words.filter(w => w.lessonId === lessonId);
  if (words.length === 0) return 0;

  const totalPoints = words.length * 4; // 4 correct answers per word
  const earnedPoints = words.reduce((sum, word) => {
    const progress = state.words.progress[word.id];
    return sum + (progress?.correctStreak || 0);
  }, 0);

  return Math.round((earnedPoints / totalPoints) * 100);
};
