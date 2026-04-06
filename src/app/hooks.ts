import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { createSelector } from '@reduxjs/toolkit';
import { getCurrentDate } from '../utils/dateUtils';
import type { TestResult, ExerciseEntry, DayProgress } from '../features/progress/progressSlice';
import type { DailyWordProgress } from '../features/words/wordsSlice';
import type { DailyPhraseProgress } from '../features/phrases/phrasesSlice';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const selectDailyProgress = createSelector(
  (state: RootState) => state.progress.dailyProgress,
  (dailyProgress) => dailyProgress
);

const selectTodayProgress = createSelector(
  (state: RootState) => state.progress.dailyProgress,
  (dailyProgress) => {
    const today = getCurrentDate();
    return dailyProgress[today] || null;
  }
);

const selectTodayActivitiesProgress = createSelector(
  (state: RootState) => state.progress.dailyProgress,
  (dailyProgress) => {
    const today = getCurrentDate();
    return dailyProgress[today]?.activities || {};
  }
);

const selectTodayChaptersProgress = createSelector(
  (state: RootState) => state.progress.dailyProgress,
  (dailyProgress) => {
    const today = getCurrentDate();
    return dailyProgress[today]?.chapters || {};
  }
);

const selectTodayTestResults = createSelector(
  (state: RootState) => state.progress.dailyProgress,
  (dailyProgress) => {
    const today = getCurrentDate();
    return dailyProgress[today]?.testResults || [];
  }
);

const selectTodayExercises = createSelector(
  (state: RootState) => state.progress.dailyProgress,
  (dailyProgress) => {
    const today = getCurrentDate();
    return dailyProgress[today]?.exercises || [];
  }
);

const selectFavorites = createSelector(
  (state: RootState) => state.progress.favorites,
  (favorites) => favorites
);

// Get test results by type (all time, sorted by date desc)
export const createSelectTestsByType = (activityId: string) =>
  createSelector(
    (state: RootState) => state.progress.dailyProgress,
    (dailyProgress) => {
      const results: TestResult[] = [];
      Object.values(dailyProgress).forEach((dayProgress) => {
        if (dayProgress.testResults) {
          dayProgress.testResults.forEach((result) => {
            if (result.activityId === activityId) {
              results.push(result);
            }
          });
        }
      });
      return results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }
  );

// Get exercises by type (all time, sorted by date desc)
export const createSelectExercisesByType = (activityId: string) =>
  createSelector(
    (state: RootState) => state.progress.dailyProgress,
    (dailyProgress) => {
      const exercises: ExerciseEntry[] = [];
      Object.values(dailyProgress).forEach((dayProgress) => {
        if (dayProgress.exercises) {
          dayProgress.exercises.forEach((exercise) => {
            if (exercise.activityId === activityId) {
              exercises.push(exercise);
            }
          });
        }
      });
      return exercises.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }
  );

// Get last 7 days of progress
const selectLast7DaysProgress = createSelector(
  (state: RootState) => state.progress.dailyProgress,
  (dailyProgress) => {
    const days: { date: string; progress: DayProgress }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        progress: dailyProgress[dateStr] || { chapters: {}, activities: {}, testResults: [], exercises: [] },
      });
    }
    return days;
  }
);

// Progress hooks
export const useDailyProgress = () => useAppSelector(selectDailyProgress);
export const useTodayProgress = () => useAppSelector(selectTodayProgress);
export const useTodayActivitiesProgress = () => useAppSelector(selectTodayActivitiesProgress);
export const useTodayChaptersProgress = () => useAppSelector(selectTodayChaptersProgress);
export const useTodayTestResults = () => useAppSelector(selectTodayTestResults);
export const useTodayExercises = () => useAppSelector(selectTodayExercises);
export const useFavorites = () => useAppSelector(selectFavorites);
export const useLast7DaysProgress = () => useAppSelector(selectLast7DaysProgress);

// Hook factories for tests and exercises by type
export const useTestsByType = (activityId: string) => useAppSelector(createSelectTestsByType(activityId));
export const useExercisesByType = (activityId: string) => useAppSelector(createSelectExercisesByType(activityId));

// Helper hook for unlocked content (based on lessons)
export const useUnlockedContent = () => {
  const lessonProgress = useAppSelector((state) => state.progress.lessonProgress);
  
  // For now, all lessons are unlocked - this can be enhanced later
  const unlockedChapters = Object.keys(lessonProgress).length > 0 
    ? Object.keys(lessonProgress).map(id => `lesson-${id}`)
    : ['lesson-1']; // Default: first lesson unlocked
  
  return {
    chapters: unlockedChapters,
  };
};

// Helper hook for completed chapters/lessons
export const useCompletedChapters = () => {
  const lessonProgress = useAppSelector((state) => state.progress.lessonProgress);
  
  return Object.entries(lessonProgress)
    .filter(([, progress]) => progress.completed)
    .map(([id]) => `lesson-${id}`);
};

// Hook for today's words stats (time + words learned)
export const useTodayWordsStats = () => {
  const wordsDailyProgress = useAppSelector((state) => state.words.dailyProgress);
  const today = getCurrentDate();
  const todayWordsProgress: DailyWordProgress[] = wordsDailyProgress[today] || [];
  
  const totalTimeSpent = todayWordsProgress.reduce((total, lp) => total + lp.timeSpent, 0);
  const totalWordsLearned = todayWordsProgress.reduce((total, lp) => total + lp.wordsLearned, 0);
  
  return {
    timeSpent: totalTimeSpent,
    wordsLearned: totalWordsLearned,
  };
};

// Hook for today's phrases stats (time + correct phrases)
export const useTodayPhrasesStats = () => {
  const phrasesDailyProgress = useAppSelector((state) => state.phrases.dailyProgress);
  const today = getCurrentDate();
  const todayPhrasesProgress: DailyPhraseProgress[] = phrasesDailyProgress[today] || [];
  
  const totalTimeSpent = todayPhrasesProgress.reduce((total, lp) => total + lp.timeSpent, 0);
  const totalCorrectPhrases = todayPhrasesProgress.reduce((total, lp) => total + lp.correctPhrases, 0);
  const totalWrongPhrases = todayPhrasesProgress.reduce((total, lp) => total + lp.wrongPhrases, 0);
  
  return {
    timeSpent: totalTimeSpent,
    correctPhrases: totalCorrectPhrases,
    wrongPhrases: totalWrongPhrases,
  };
};
