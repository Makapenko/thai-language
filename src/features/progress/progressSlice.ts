import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { LessonProgress, UserSettings, StorageData, WordProgress } from '../../data/types';
import { getCurrentDate, getCurrentISOTimestamp } from '../../utils/dateUtils';

// Daily progress types
export interface ChapterProgress {
  id: string;
  timeSpent: number;
  completed?: boolean;
  completedAt?: string;
}

export interface ActivityProgress {
  id: string;
  timeSpent: number;
  completedAt?: string;
}

// Test result
export interface TestResult {
  activityId: string;
  score: number;
  maxScore: number;
  completedAt: string;
  content?: Record<string, any>;
}

// Exercise entry
export interface ExerciseEntry {
  activityId: string;
  completedAt: string;
  timeSpent?: number;
  score?: number;
  content?: Record<string, any>;
}

export interface DayProgress {
  chapters: Record<string, ChapterProgress>;
  activities: Record<string, ActivityProgress>;
  testResults: TestResult[];
  exercises: ExerciseEntry[];
}

export interface DailyProgress {
  [date: string]: DayProgress;
}

interface ProgressState {
  lessonProgress: Record<number, LessonProgress>;
  settings: UserSettings;
  isLoaded: boolean;
  dailyProgress: DailyProgress;
  favorites: string[]; // Array of activity IDs
}

const today = getCurrentDate();

const createEmptyDayProgress = (): DayProgress => ({
  chapters: {},
  activities: {},
  testResults: [],
  exercises: [],
});

const initialState: ProgressState = {
  lessonProgress: {},
  settings: {
    speechRate: 0.8,
    speechEnabled: true,
    theme: 'light',
  },
  isLoaded: false,
  dailyProgress: {
    [today]: createEmptyDayProgress(),
  },
  favorites: [],
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    /**
     * Initialize progress from localStorage on app start
     */
    initializeProgress: (state, action: PayloadAction<StorageData & { dailyProgress?: DailyProgress; favorites?: string[] }>) => {
      state.lessonProgress = action.payload.lessonProgress || {};
      state.settings = action.payload.settings || initialState.settings;
      state.dailyProgress = action.payload.dailyProgress || { [today]: createEmptyDayProgress() };
      state.favorites = action.payload.favorites || [];
      state.isLoaded = true;
    },

    /**
     * Load partial progress data (for migrations or updates)
     */
    loadProgress: (state, action: PayloadAction<Partial<StorageData> & { dailyProgress?: DailyProgress; favorites?: string[] }>) => {
      if (action.payload.lessonProgress) {
        state.lessonProgress = {
          ...state.lessonProgress,
          ...action.payload.lessonProgress,
        };
      }
      if (action.payload.settings) {
        state.settings = { ...state.settings, ...action.payload.settings };
      }
      if (action.payload.dailyProgress) {
        state.dailyProgress = {
          ...state.dailyProgress,
          ...action.payload.dailyProgress,
        };
      }
      if (action.payload.favorites) {
        state.favorites = action.payload.favorites;
      }
      state.isLoaded = true;
    },

    /**
     * Initialize word progress from localStorage
     */
    initializeWordProgress: (_state, _action: PayloadAction<Record<string, WordProgress>>) => {
      // Word progress is managed in wordsSlice
    },

    updateLessonProgress: (state, action: PayloadAction<LessonProgress>) => {
      state.lessonProgress[action.payload.lessonId] = {
        ...state.lessonProgress[action.payload.lessonId],
        ...action.payload,
      };
    },

    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    markLessonComplete: (state, action: PayloadAction<number>) => {
      const lessonId = action.payload;
      if (state.lessonProgress[lessonId]) {
        state.lessonProgress[lessonId].completed = true;
        state.lessonProgress[lessonId].lastPracticed = Date.now();
      } else {
        state.lessonProgress[lessonId] = {
          lessonId,
          wordsProgress: 0,
          phrasesCompleted: 0,
          phrasesTotal: 0,
          phrasesCorrect: 0,
          phrasesWrong: 0,
          completed: true,
          lastPracticed: Date.now(),
        };
      }
    },

    resetLessonProgress: (state, action: PayloadAction<number>) => {
      const lessonId = action.payload;
      delete state.lessonProgress[lessonId];
    },

    /**
     * Reset all progress
     */
    resetAllProgress: (state) => {
      state.lessonProgress = {};
      state.isLoaded = true;
    },

    /**
     * Update chapter (lesson section) reading time
     */
    updateChapterProgress: (state, action: PayloadAction<{ chapterId: string; timeSpent: number }>) => {
      const { chapterId, timeSpent } = action.payload;
      const currentDate = getCurrentDate();

      if (!state.dailyProgress[currentDate]) {
        state.dailyProgress[currentDate] = createEmptyDayProgress();
      }

      state.dailyProgress[currentDate].chapters[chapterId] = {
        id: chapterId,
        timeSpent,
      };
    },

    /**
     * Update activity time
     */
    updateActivityProgress: (state, action: PayloadAction<{ activityId: string; timeSpent: number }>) => {
      const { activityId, timeSpent } = action.payload;
      const currentDate = getCurrentDate();

      if (!state.dailyProgress[currentDate]) {
        state.dailyProgress[currentDate] = createEmptyDayProgress();
      }

      const existing = state.dailyProgress[currentDate].activities[activityId];
      state.dailyProgress[currentDate].activities[activityId] = {
        id: activityId,
        timeSpent: (existing?.timeSpent || 0) + timeSpent,
        completedAt: getCurrentISOTimestamp(),
      };
    },

    /**
     * Mark chapter as completed
     */
    completeChapter: (state, action: PayloadAction<string>) => {
      const chapterId = action.payload;
      const currentDate = getCurrentDate();

      if (!state.dailyProgress[currentDate]) {
        state.dailyProgress[currentDate] = createEmptyDayProgress();
      }

      const currentProgress = state.dailyProgress[currentDate].chapters[chapterId] || {
        id: chapterId,
        timeSpent: 0,
      };

      state.dailyProgress[currentDate].chapters[chapterId] = {
        ...currentProgress,
        completed: true,
        completedAt: getCurrentISOTimestamp(),
      };
    },

    /**
     * Save test result
     */
    saveTestResult: (state, action: PayloadAction<TestResult>) => {
      const testResult = action.payload;
      const currentDate = getCurrentDate();

      if (!state.dailyProgress[currentDate]) {
        state.dailyProgress[currentDate] = createEmptyDayProgress();
      }

      state.dailyProgress[currentDate].testResults.push(testResult);
    },

    /**
     * Save exercise entry
     */
    saveExercise: (state, action: PayloadAction<ExerciseEntry>) => {
      const exercise = action.payload;
      const currentDate = getCurrentDate();

      if (!state.dailyProgress[currentDate]) {
        state.dailyProgress[currentDate] = createEmptyDayProgress();
      }

      state.dailyProgress[currentDate].exercises.push(exercise);
    },

    /**
     * Toggle favorite
     */
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const activityId = action.payload;
      const index = state.favorites.indexOf(activityId);
      if (index >= 0) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(activityId);
      }
    },

    /**
     * Set favorites
     */
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.favorites = action.payload;
    },
  },
});

export const {
  initializeProgress,
  loadProgress,
  updateLessonProgress,
  updateSettings,
  markLessonComplete,
  resetLessonProgress,
  resetAllProgress,
  initializeWordProgress,
  updateChapterProgress,
  updateActivityProgress,
  completeChapter,
  saveTestResult,
  saveExercise,
  toggleFavorite,
  setFavorites,
} = progressSlice.actions;

export default progressSlice.reducer;

// Selectors
export const selectLessonProgress = (lessonId: number) => (state: { progress: ProgressState }) =>
  state.progress.lessonProgress[lessonId];

export const selectAllLessonProgress = createSelector(
  (state: { progress: ProgressState }) => state.progress.lessonProgress,
  (lessonProgress) => lessonProgress
);

export const selectSettings = createSelector(
  (state: { progress: ProgressState }) => state.progress.settings,
  (settings) => settings
);

export const selectIsProgressLoaded = (state: { progress: ProgressState }) =>
  state.progress.isLoaded;

export const selectDailyProgress = createSelector(
  (state: { progress: ProgressState }) => state.progress.dailyProgress,
  (dailyProgress) => dailyProgress
);

export const selectTodayProgress = createSelector(
  [(state: { progress: ProgressState }) => state.progress.dailyProgress],
  (dailyProgress) => {
    const today = getCurrentDate();
    return dailyProgress[today] || null;
  }
);

export const selectTodayActivitiesProgress = createSelector(
  [(state: { progress: ProgressState }) => state.progress.dailyProgress],
  (dailyProgress) => {
    const today = getCurrentDate();
    return dailyProgress[today]?.activities || {};
  }
);

export const selectTodayChaptersProgress = createSelector(
  [(state: { progress: ProgressState }) => state.progress.dailyProgress],
  (dailyProgress) => {
    const today = getCurrentDate();
    return dailyProgress[today]?.chapters || {};
  }
);

export const selectTodayTestResults = createSelector(
  [(state: { progress: ProgressState }) => state.progress.dailyProgress],
  (dailyProgress) => {
    const today = getCurrentDate();
    return dailyProgress[today]?.testResults || [];
  }
);

export const selectTodayExercises = createSelector(
  [(state: { progress: ProgressState }) => state.progress.dailyProgress],
  (dailyProgress) => {
    const today = getCurrentDate();
    return dailyProgress[today]?.exercises || [];
  }
);

export const selectFavorites = createSelector(
  (state: { progress: ProgressState }) => state.progress.favorites,
  (favorites) => favorites
);

export const selectTimeSpentByActivity = createSelector(
  [(state: { progress: ProgressState }) => state.progress.dailyProgress],
  (dailyProgress) => {
    const result: Record<string, number> = {};

    Object.values(dailyProgress).forEach((dayProgress: DayProgress) => {
      if (dayProgress.activities) {
        Object.entries(dayProgress.activities).forEach(([activityId, activityProgress]) => {
          if (!result[activityId]) {
            result[activityId] = 0;
          }
          result[activityId] += activityProgress.timeSpent || 0;
        });
      }
    });

    return result;
  }
);

export const selectTimeSpentByChapter = createSelector(
  [(state: { progress: ProgressState }) => state.progress.dailyProgress],
  (dailyProgress) => {
    const result: Record<string, number> = {};

    Object.values(dailyProgress).forEach((dayProgress: DayProgress) => {
      Object.entries(dayProgress.chapters || {}).forEach(([chapterId, chapterProgress]) => {
        if (!result[chapterId]) {
          result[chapterId] = 0;
        }
        result[chapterId] += chapterProgress.timeSpent || 0;
      });
    });

    return result;
  }
);

// Get test results by activity ID (all time)
export const selectTestResultsByType = (activityId: string) =>
  createSelector(
    [(state: { progress: ProgressState }) => state.progress.dailyProgress],
    (dailyProgress) => {
      const results: TestResult[] = [];
      Object.values(dailyProgress).forEach((dayProgress: DayProgress) => {
        if (dayProgress.testResults) {
          dayProgress.testResults.forEach((result) => {
            if (result.activityId === activityId) {
              results.push(result);
            }
          });
        }
      });
      // Sort by date descending (most recent first)
      return results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }
  );

// Get exercises by activity ID (all time)
export const selectExercisesByType = (activityId: string) =>
  createSelector(
    [(state: { progress: ProgressState }) => state.progress.dailyProgress],
    (dailyProgress) => {
      const exercises: ExerciseEntry[] = [];
      Object.values(dailyProgress).forEach((dayProgress: DayProgress) => {
        if (dayProgress.exercises) {
          dayProgress.exercises.forEach((exercise) => {
            if (exercise.activityId === activityId) {
              exercises.push(exercise);
            }
          });
        }
      });
      // Sort by date descending (most recent first)
      return exercises.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }
  );

// Get last 7 days of progress for history bar
export const selectLast7DaysProgress = createSelector(
  [(state: { progress: ProgressState }) => state.progress.dailyProgress],
  (dailyProgress) => {
    const days: DayProgress[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push(dailyProgress[dateStr] || createEmptyDayProgress());
    }
    return days;
  }
);
