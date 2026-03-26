import { configureStore } from '@reduxjs/toolkit';
import wordsReducer from '../features/words/wordsSlice';
import phrasesReducer from '../features/phrases/phrasesSlice';
import lessonsReducer from '../features/lessons/lessonsSlice';
import progressReducer from '../features/progress/progressSlice';

export const store = configureStore({
  reducer: {
    words: wordsReducer,
    phrases: phrasesReducer,
    lessons: lessonsReducer,
    progress: progressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
