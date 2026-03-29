import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { createSelector } from '@reduxjs/toolkit';
import { getCurrentDate } from '../utils/dateUtils';

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

// Progress hooks
export const useDailyProgress = () => useAppSelector(selectDailyProgress);
export const useTodayProgress = () => useAppSelector(selectTodayProgress);
export const useTodayActivitiesProgress = () => useAppSelector(selectTodayActivitiesProgress);
export const useTodayChaptersProgress = () => useAppSelector(selectTodayChaptersProgress);
