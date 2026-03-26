import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Lesson } from '../../data/types';

interface LessonsState {
  lessons: Lesson[];
  currentLessonId: number | null;
  currentSectionId: string | null;
}

const initialState: LessonsState = {
  lessons: [],
  currentLessonId: null,
  currentSectionId: null,
};

const lessonsSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    setLessons: (state, action: PayloadAction<Lesson[]>) => {
      state.lessons = action.payload;
    },

    setCurrentLesson: (state, action: PayloadAction<number | null>) => {
      state.currentLessonId = action.payload;
      state.currentSectionId = null;
    },

    setCurrentSection: (state, action: PayloadAction<string | null>) => {
      state.currentSectionId = action.payload;
    },
  },
});

export const { setLessons, setCurrentLesson, setCurrentSection } = lessonsSlice.actions;

export default lessonsSlice.reducer;

// Selectors
export const selectLessons = (state: { lessons: LessonsState }) => state.lessons.lessons;
export const selectCurrentLessonId = (state: { lessons: LessonsState }) => state.lessons.currentLessonId;
export const selectCurrentSectionId = (state: { lessons: LessonsState }) => state.lessons.currentSectionId;

export const selectCurrentLesson = (state: { lessons: LessonsState }) => {
  return state.lessons.lessons.find(l => l.id === state.lessons.currentLessonId) || null;
};

export const selectCurrentSection = (state: { lessons: LessonsState }) => {
  const lesson = state.lessons.lessons.find(l => l.id === state.lessons.currentLessonId);
  if (!lesson) return null;
  return lesson.sections.find(s => s.id === state.lessons.currentSectionId) || null;
};
