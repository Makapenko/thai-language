import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Word, WordProgress } from '../../data/types';

interface WordsState {
  words: Word[];
  progress: Record<string, WordProgress>;
  currentWordId: string | null;
  isReversedMode: boolean;
  exerciseComplete: boolean;
  unlockedWordIds: string[]; // IDs of words that are currently unlocked for practice
}

const initialState: WordsState = {
  words: [],
  progress: {},
  currentWordId: null,
  isReversedMode: false,
  exerciseComplete: false,
  unlockedWordIds: [],
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

      // After 3 correct, switch to reversed mode and unlock next word
      if (progress.correctStreak === 3) {
        progress.isReversed = true;
        // Unlock the next word
        const allWordIds = state.words.map(w => w.id);
        for (const id of allWordIds) {
          if (!state.unlockedWordIds.includes(id)) {
            state.unlockedWordIds.push(id);
            break;
          }
        }
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

    setUnlockedWords: (state, action: PayloadAction<string[]>) => {
      state.unlockedWordIds = action.payload;
    },

    unlockNextWord: (state) => {
      // Unlock the next word that hasn't been unlocked yet
      const allWordIds = state.words.map(w => w.id);
      for (const wordId of allWordIds) {
        if (!state.unlockedWordIds.includes(wordId)) {
          state.unlockedWordIds.push(wordId);
          break;
        }
      }
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
  setUnlockedWords,
  unlockNextWord,
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

  // Total points based on ALL words in the lesson (4 correct answers per word)
  const totalPoints = words.length * 4;
  
  // Calculate earned points from all words
  const earnedPoints = words.reduce((sum, word) => {
    const progress = state.words.progress[word.id];
    return sum + (progress?.correctStreak || 0);
  }, 0);

  // Return percentage with one decimal place
  return parseFloat(((earnedPoints / totalPoints) * 100).toFixed(1));
};

// Check if all words in the lesson are completed
export const selectLessonWordsComplete = (lessonId: number) => (state: { words: WordsState }) => {
  const words = state.words.words.filter(w => w.lessonId === lessonId);
  if (words.length === 0) return false;

  // Check if all unlocked words are completed
  const unlockedWords = words.filter(w => state.words.unlockedWordIds.includes(w.id));
  if (unlockedWords.length === 0) return false;

  // Check if all words are unlocked and completed
  const allWordsUnlocked = unlockedWords.length === words.length;
  const allCompleted = unlockedWords.every(w => {
    const progress = state.words.progress[w.id];
    return progress?.completed === true;
  });

  return allWordsUnlocked && allCompleted;
};

export const selectUnlockedWords = (state: { words: WordsState }) =>
  state.words.unlockedWordIds;

export const selectUnlockedWordsByLesson = (lessonId: number) => (state: { words: WordsState }) => {
  const words = state.words.words.filter(w => w.lessonId === lessonId);
  return words.filter(w => state.words.unlockedWordIds.includes(w.id));
};
