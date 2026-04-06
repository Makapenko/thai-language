import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Word, WordProgress } from '../../data/types';
import { getCurrentDate } from '../../utils/dateUtils';

// Daily word progress tracking
export interface DailyWordProgress {
  lessonId: number;
  wordsLearned: number; // Words reached level 4 (completed)
  timeSpent: number;
}

export interface DailyWordsData {
  [date: string]: DailyWordProgress[];
}

interface WordsState {
  words: Word[];
  progress: Record<string, WordProgress>;
  currentWordId: string | null;
  isReversedMode: boolean;
  exerciseComplete: boolean;
  unlockedWordIds: string[];
  dailyProgress: DailyWordsData;
}

const today = getCurrentDate();

const initialState: WordsState = {
  words: [],
  progress: {},
  currentWordId: null,
  isReversedMode: false,
  exerciseComplete: false,
  unlockedWordIds: [],
  dailyProgress: {
    [today]: [],
  },
};

const wordsSlice = createSlice({
  name: 'words',
  initialState,
  reducers: {
    setWords: (state, action: PayloadAction<Word[]>) => {
      state.words = action.payload;
      state.exerciseComplete = false;
    },

    initializeProgress: (state, action: PayloadAction<Record<string, WordProgress>>) => {
      state.progress = action.payload;
      // Note: unlockedWordIds will be restored after words are loaded
      // via restoreUnlockedWords action
    },

    initializeDailyProgress: (state, action: PayloadAction<DailyWordsData>) => {
      state.dailyProgress = action.payload;
    },

    restoreUnlockedWords: (state) => {
      if (state.words.length === 0) return;

      // Don't overwrite if unlockedWordIds already has data (e.g., from localStorage)
      if (state.unlockedWordIds.length > 0) {
        // Check if the unlocked words are valid for current words
        const allWordIds = state.words.map(w => w.id);
        const hasValidUnlockedWords = state.unlockedWordIds.some(id => allWordIds.includes(id));
        if (hasValidUnlockedWords) {
          console.log('[wordsSlice] restoreUnlockedWords: skipping, already has valid unlocked words');
          return;
        }
      }

      const allWordIds = state.words.map(w => w.id);

      // Start with the first word always unlocked
      const unlockedSet = new Set<string>([allWordIds[0]]);

      // For each word, if it has correctStreak >= 3, unlock the next word
      for (let i = 0; i < allWordIds.length - 1; i++) {
        const wordId = allWordIds[i];
        const wordProgress = state.progress[wordId];

        // If this word has been practiced and has correctStreak >= 3, unlock the next word
        if (wordProgress && wordProgress.correctStreak >= 3) {
          unlockedSet.add(allWordIds[i + 1]);
        }

        // Also if word is completed, unlock the next word
        if (wordProgress && wordProgress.completed) {
          unlockedSet.add(allWordIds[i + 1]);
        }
      }

      state.unlockedWordIds = Array.from(unlockedSet);
      console.log('[wordsSlice] restoreUnlockedWords: set unlockedWordIds to', state.unlockedWordIds);
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

      const wasCompleted = progress.completed;
      progress.correctStreak += 1;
      progress.timesCorrect += 1;
      progress.lastPracticed = Date.now();

      // After 3 correct, switch to reversed mode and unlock next word
      if (progress.correctStreak === 3) {
        progress.isReversed = true;
        const allWordIds = state.words.map(w => w.id);
        for (const id of allWordIds) {
          if (!state.unlockedWordIds.includes(id)) {
            state.unlockedWordIds.push(id);
            break;
          }
        }
      }

      // After 4 correct, mark as completed
      if (progress.correctStreak >= 4) {
        progress.completed = true;
      }

      state.progress[wordId] = progress;

      // Track daily progress - word completed today
      if (!wasCompleted && progress.completed) {
        const today = getCurrentDate();
        if (!state.dailyProgress[today]) {
          state.dailyProgress[today] = [];
        }

        const word = state.words.find(w => w.id === wordId);
        if (word) {
          const existingLessonProgress = state.dailyProgress[today].find(
            p => p.lessonId === word.lessonId
          );

          if (existingLessonProgress) {
            existingLessonProgress.wordsLearned += 1;
          } else {
            state.dailyProgress[today].push({
              lessonId: word.lessonId,
              wordsLearned: 1,
              timeSpent: 0,
            });
          }
          console.log(`[Words] Word ${wordId} completed! Daily progress updated for ${today}:`, state.dailyProgress[today]);
        }
      }
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
      const allWordIds = state.words.map(w => w.id);
      for (const wordId of allWordIds) {
        if (!state.unlockedWordIds.includes(wordId)) {
          state.unlockedWordIds.push(wordId);
          break;
        }
      }
    },

    updateWordsTimeSpent: (state, action: PayloadAction<{ lessonId: number; seconds: number }>) => {
      const { lessonId, seconds } = action.payload;
      const today = getCurrentDate();

      if (!state.dailyProgress[today]) {
        state.dailyProgress[today] = [];
      }

      const existingLessonProgress = state.dailyProgress[today].find(
        p => p.lessonId === lessonId
      );

      if (existingLessonProgress) {
        // Timer already accumulates time, so we just update with the current value
        existingLessonProgress.timeSpent = seconds;
      } else {
        state.dailyProgress[today].push({
          lessonId,
          wordsLearned: 0,
          timeSpent: seconds,
        });
      }
    },
  },
});

export const {
  setWords,
  initializeProgress,
  initializeDailyProgress,
  setProgress,
  setCurrentWord,
  answerCorrect,
  answerWrong,
  setExerciseComplete,
  resetWordsProgress,
  setUnlockedWords,
  unlockNextWord,
  updateWordsTimeSpent,
  restoreUnlockedWords,
} = wordsSlice.actions;

export const persistUnlockedWordIds = (ids: string[]) => ({
  type: 'words/persistUnlockedWordIds',
  payload: ids,
});

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

  const totalPoints = words.length * 4;
  const earnedPoints = words.reduce((sum, word) => {
    const progress = state.words.progress[word.id];
    return sum + (progress?.correctStreak || 0);
  }, 0);

  return parseFloat(((earnedPoints / totalPoints) * 100).toFixed(1));
};

export const selectLessonWordsComplete = (lessonId: number) => (state: { words: WordsState }) => {
  const words = state.words.words.filter(w => w.lessonId === lessonId);
  if (words.length === 0) return false;

  const unlockedWords = words.filter(w => state.words.unlockedWordIds.includes(w.id));
  if (unlockedWords.length === 0) return false;

  const allWordsUnlocked = unlockedWords.length === words.length;
  const allCompleted = unlockedWords.every(w => {
    const progress = state.words.progress[w.id];
    return progress?.completed === true;
  });

  return allWordsUnlocked && allCompleted;
};

export const selectUnlockedWords = createSelector(
  (state: { words: WordsState }) => state.words.unlockedWordIds,
  (unlockedWordIds) => unlockedWordIds
);

export const selectUnlockedWordsByLesson = (lessonId: number) => createSelector(
  [(state: { words: WordsState }) => state.words.words, (state: { words: WordsState }) => state.words.unlockedWordIds],
  (words, unlockedWordIds) => words.filter((w: Word) => w.lessonId === lessonId && unlockedWordIds.includes(w.id))
);

export const selectDailyWordsProgress = (state: { words: WordsState }) =>
  state.words.dailyProgress;

export const selectTodayWordsProgress = createSelector(
  [(state: { words: WordsState }) => state.words.dailyProgress],
  (dailyProgress) => {
    const today = getCurrentDate();
    return dailyProgress[today] || [];
  }
);

export const selectWordsProgressByDate = (date: string) => (state: { words: WordsState }) =>
  state.words.dailyProgress[date] || [];

export const selectWordsProgressByLesson = (_lessonId: number) => (state: { words: WordsState }) =>
  state.words.dailyProgress;
