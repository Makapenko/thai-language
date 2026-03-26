import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { LessonProgress, UserSettings, StorageData } from '../../data/types';

interface ProgressState {
  lessonProgress: Record<number, LessonProgress>;
  settings: UserSettings;
  isLoaded: boolean;
}

const initialState: ProgressState = {
  lessonProgress: {},
  settings: {
    speechRate: 0.8,
    speechEnabled: true,
    theme: 'light',
  },
  isLoaded: false,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    loadProgress: (state, action: PayloadAction<Partial<StorageData>>) => {
      if (action.payload.lessonProgress) {
        state.lessonProgress = action.payload.lessonProgress;
      }
      if (action.payload.settings) {
        state.settings = action.payload.settings;
      }
      state.isLoaded = true;
    },

    updateLessonProgress: (state, action: PayloadAction<LessonProgress>) => {
      state.lessonProgress[action.payload.lessonId] = action.payload;
    },

    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    markLessonComplete: (state, action: PayloadAction<number>) => {
      const lessonId = action.payload;
      if (state.lessonProgress[lessonId]) {
        state.lessonProgress[lessonId].completed = true;
        state.lessonProgress[lessonId].lastPracticed = Date.now();
      }
    },

    resetLessonProgress: (state, action: PayloadAction<number>) => {
      const lessonId = action.payload;
      delete state.lessonProgress[lessonId];
    },
  },
});

export const {
  loadProgress,
  updateLessonProgress,
  updateSettings,
  markLessonComplete,
  resetLessonProgress,
} = progressSlice.actions;

export default progressSlice.reducer;

// Selectors
export const selectLessonProgress = (lessonId: number) => (state: { progress: ProgressState }) =>
  state.progress.lessonProgress[lessonId];

export const selectAllLessonProgress = (state: { progress: ProgressState }) =>
  state.progress.lessonProgress;

export const selectSettings = (state: { progress: ProgressState }) =>
  state.progress.settings;

export const selectIsProgressLoaded = (state: { progress: ProgressState }) =>
  state.progress.isLoaded;
