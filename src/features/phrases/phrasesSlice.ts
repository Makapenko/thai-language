import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Phrase, WordGroup, PhraseExercise } from '../../data/types';
import { getCurrentDate } from '../../utils/dateUtils';

export interface PhraseProgress {
  phraseId: string;
  correctStreak: number;
  completed: boolean;
  lastPracticed: number;
  timesCorrect: number;
  timesWrong: number;
}

// Daily phrase progress tracking
export interface DailyPhraseProgress {
  lessonId: number;
  correctPhrases: number;
  wrongPhrases: number;
  timeSpent: number;
}

export interface DailyPhrasesData {
  [date: string]: DailyPhraseProgress[];
}

interface PhrasesState {
  phrases: Phrase[];
  wordGroups: WordGroup[];
  exercises: PhraseExercise[];
  progress: Record<string, PhraseProgress>;
  currentPhraseIndex: number;
  selectedParts: string[];
  currentGroupIndex: number;
  isRetrying: boolean;
  justAdvanced: boolean; // True after second mistake - phrase already advanced
  exerciseComplete: boolean;
  dailyProgress: DailyPhrasesData;
}

const today = getCurrentDate();

const initialState: PhrasesState = {
  phrases: [],
  wordGroups: [],
  exercises: [],
  progress: {},
  currentPhraseIndex: 0,
  selectedParts: [],
  currentGroupIndex: 0,
  isRetrying: false,
  justAdvanced: false,
  exerciseComplete: false,
  dailyProgress: {
    [today]: [],
  },
};

const phrasesSlice = createSlice({
  name: 'phrases',
  initialState,
  reducers: {
    setPhrases: (state, action: PayloadAction<Phrase[]>) => {
      state.phrases = action.payload;
      state.exercises = []; // Start empty - markers will be added as user answers
      state.currentPhraseIndex = 0;
      state.selectedParts = [];
      state.currentGroupIndex = 0;
      state.isRetrying = false;
      state.justAdvanced = false;
      state.exerciseComplete = false;
    },

    setWordGroups: (state, action: PayloadAction<WordGroup[]>) => {
      state.wordGroups = action.payload;
    },

    initializeProgress: (state, action: PayloadAction<Record<string, PhraseProgress>>) => {
      state.progress = action.payload;
    },

    initializeDailyProgress: (state, action: PayloadAction<DailyPhrasesData>) => {
      state.dailyProgress = action.payload;
    },

    updatePhraseProgress: (state, action: PayloadAction<{ phraseId: string; isCorrect: boolean }>) => {
      const { phraseId, isCorrect } = action.payload;
      const current = state.progress[phraseId] || {
        phraseId,
        correctStreak: 0,
        completed: false,
        lastPracticed: Date.now(),
        timesCorrect: 0,
        timesWrong: 0,
      };

      if (isCorrect) {
        current.correctStreak += 1;
        current.timesCorrect += 1;
        if (current.correctStreak >= 3) {
          current.completed = true;
        }
      } else {
        current.correctStreak = 0;
        current.timesWrong += 1;
      }

      current.lastPracticed = Date.now();
      state.progress[phraseId] = current;
    },

    selectPart: (state, action: PayloadAction<string>) => {
      state.selectedParts.push(action.payload);
      state.currentGroupIndex += 1;
    },

    clearSelectedParts: (state) => {
      state.selectedParts = [];
      state.currentGroupIndex = 0;
    },

    submitPhrase: (state) => {
      const currentPhrase = state.phrases[state.currentPhraseIndex];
      if (!currentPhrase) return;

      const correctAnswer = currentPhrase.structure.map(s => s.thai).join('');
      const userAnswer = state.selectedParts.join('');
      const isCorrect = correctAnswer === userAnswer;

      if (isCorrect) {
        // Correct answer - add a green marker
        state.exercises.push({
          phraseId: currentPhrase.id,
          status: 'correct',
        });
        state.isRetrying = false;

        // Track daily progress - correct phrase
        const today = getCurrentDate();
        if (!state.dailyProgress[today]) {
          state.dailyProgress[today] = [];
        }

        const existingLessonProgress = state.dailyProgress[today].find(
          p => p.lessonId === currentPhrase.lessonId
        );

        if (existingLessonProgress) {
          existingLessonProgress.correctPhrases += 1;
        } else {
          state.dailyProgress[today].push({
            lessonId: currentPhrase.lessonId,
            correctPhrases: 1,
            wrongPhrases: 0,
            timeSpent: 0,
          });
        }
        console.log(`[Phrases] Correct phrase! Daily progress updated for ${today}:`, state.dailyProgress[today]);
      } else {
        // Wrong answer
        if (state.isRetrying) {
          // Second mistake - don't add another marker, just move to next phrase
          state.isRetrying = false;
          state.justAdvanced = true; // Flag: phrase already advanced
          // Advance to next phrase
          if (state.currentPhraseIndex < state.phrases.length - 1) {
            state.currentPhraseIndex += 1;
          } else {
            state.exerciseComplete = true;
          }
          state.selectedParts = [];
          state.currentGroupIndex = 0;
        } else {
          // First mistake - add a red marker and allow retry
          state.exercises.push({
            phraseId: currentPhrase.id,
            status: 'wrong',
          });
          state.isRetrying = true;

          // Track daily progress - wrong phrase
          const today = getCurrentDate();
          if (!state.dailyProgress[today]) {
            state.dailyProgress[today] = [];
          }

          const existingLessonProgress = state.dailyProgress[today].find(
            p => p.lessonId === currentPhrase.lessonId
          );

          if (existingLessonProgress) {
            existingLessonProgress.wrongPhrases += 1;
          } else {
            state.dailyProgress[today].push({
              lessonId: currentPhrase.lessonId,
              correctPhrases: 0,
              wrongPhrases: 1,
              timeSpent: 0,
            });
          }
          console.log(`[Phrases] Wrong phrase! Daily progress updated for ${today}:`, state.dailyProgress[today]);
        }
      }
    },

    nextPhrase: (state) => {
      state.selectedParts = [];
      state.currentGroupIndex = 0;
      state.isRetrying = false;
      state.justAdvanced = false;

      if (state.currentPhraseIndex < state.phrases.length - 1) {
        state.currentPhraseIndex += 1;
      } else {
        state.exerciseComplete = true;
      }
    },

    goToPhrase: (state, action: PayloadAction<number>) => {
      state.currentPhraseIndex = action.payload;
      state.selectedParts = [];
      state.currentGroupIndex = 0;
      state.isRetrying = false;
      state.justAdvanced = false;
    },

    resetPhrasesExercise: (state) => {
      state.exercises = []; // Reset to empty
      state.currentPhraseIndex = 0;
      state.selectedParts = [];
      state.currentGroupIndex = 0;
      state.isRetrying = false;
      state.justAdvanced = false;
      state.exerciseComplete = false;
    },

    updatePhrasesTimeSpent: (state, action: PayloadAction<{ lessonId: number; seconds: number }>) => {
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
          correctPhrases: 0,
          wrongPhrases: 0,
          timeSpent: seconds,
        });
      }
    },
  },
});

export const {
  setPhrases,
  setWordGroups,
  initializeProgress,
  initializeDailyProgress,
  updatePhraseProgress,
  selectPart,
  clearSelectedParts,
  submitPhrase,
  nextPhrase,
  goToPhrase,
  resetPhrasesExercise,
  updatePhrasesTimeSpent,
} = phrasesSlice.actions;

export default phrasesSlice.reducer;

// Selectors
export const selectPhrases = (state: { phrases: PhrasesState }) => state.phrases.phrases;
export const selectWordGroups = (state: { phrases: PhrasesState }) => state.phrases.wordGroups;
export const selectExercises = (state: { phrases: PhrasesState }) => state.phrases.exercises;
export const selectCurrentPhraseIndex = (state: { phrases: PhrasesState }) => state.phrases.currentPhraseIndex;
export const selectSelectedParts = (state: { phrases: PhrasesState }) => state.phrases.selectedParts;
export const selectCurrentGroupIndex = (state: { phrases: PhrasesState }) => state.phrases.currentGroupIndex;
export const selectIsRetrying = (state: { phrases: PhrasesState }) => state.phrases.isRetrying;
export const selectJustAdvanced = (state: { phrases: PhrasesState }) => state.phrases.justAdvanced;
export const selectPhrasesExerciseComplete = (state: { phrases: PhrasesState }) => state.phrases.exerciseComplete;

export const selectCurrentPhrase = (state: { phrases: PhrasesState }) => {
  return state.phrases.phrases[state.phrases.currentPhraseIndex] || null;
};

export const selectPhrasesStats = (state: { phrases: PhrasesState }) => {
  const exercises = state.phrases.exercises;
  return {
    total: exercises.length,
    correct: exercises.filter(e => e.status === 'correct').length,
    wrong: exercises.filter(e => e.status === 'wrong').length,
  };
};

export const selectPhraseProgress = createSelector(
  (state: { phrases: PhrasesState }) => state.phrases.progress,
  (progress) => progress
);

export const selectPhraseProgressByLesson = (lessonId: number) => createSelector(
  [(state: { phrases: PhrasesState }) => state.phrases.phrases, (state: { phrases: PhrasesState }) => state.phrases.progress],
  (phrases, progress) => {
    const phrasesInLesson = phrases.filter((p: Phrase) => p.lessonId === lessonId);
    const phraseIds = new Set(phrasesInLesson.map((p: Phrase) => p.id));
    return Object.values(progress).filter(p => phraseIds.has(p.phraseId));
  }
);

export const selectDailyPhrasesProgress = (state: { phrases: PhrasesState }) =>
  state.phrases.dailyProgress;

export const selectTodayPhrasesProgress = createSelector(
  [(state: { phrases: PhrasesState }) => state.phrases.dailyProgress],
  (dailyProgress) => {
    const today = getCurrentDate();
    return dailyProgress[today] || [];
  }
);

export const selectPhrasesProgressByDate = (date: string) => (state: { phrases: PhrasesState }) =>
  state.phrases.dailyProgress[date] || [];
