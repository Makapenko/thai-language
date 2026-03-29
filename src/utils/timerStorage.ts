import { getCurrentDate } from './dateUtils';
import { store } from '../app/store';
import { updateChapterProgress, updateActivityProgress } from '../features/progress/progressSlice';

interface TimeData {
  [componentId: string]: number;
}

interface DailyTimeProgress {
  [date: string]: TimeData;
}

const TIMER_STORAGE_KEY = 'thai_timer_data';

// List of lesson section IDs (chapters)
const LESSON_SECTION_IDS = new Set([
  'theory',
  'words',
  'phrases',
  'tones',
]);

/**
 * Get all stored time data from localStorage
 * @returns Object with time data by date and component
 */
const getAllStoredData = (): DailyTimeProgress => {
  const storedData = localStorage.getItem(TIMER_STORAGE_KEY);
  if (!storedData) {
    return {};
  }

  try {
    const data = JSON.parse(storedData);
    return data;
  } catch (e) {
    console.error('Error parsing time data:', e);
    return {};
  }
};

/**
 * Save all time data to localStorage
 * @param data Object with time data by date and component
 */
const saveAllData = (data: DailyTimeProgress): void => {
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving time data:', e);
  }
};

/**
 * Check if componentId is a lesson section (chapter)
 */
const isLessonSection = (componentId: string): boolean => {
  // Check if it matches pattern like "lesson-1-theory", "lesson-1-words", etc.
  return LESSON_SECTION_IDS.has(componentId) || /^lesson-\d+-/.test(componentId);
};

/**
 * Get stored time for a specific component for today
 * @param componentId Component identifier (activity or lesson)
 * @returns Number of seconds spent in the component
 */
export const getStoredTime = (componentId: string): number => {
  const today = getCurrentDate();
  const dailyProgress = getAllStoredData();
  return dailyProgress[today]?.[componentId] || 0;
};

/**
 * Save time spent in a specific component for today
 * @param componentId Component identifier (activity or lesson)
 * @param seconds Number of seconds spent in the component
 */
export const saveTime = (componentId: string, seconds: number): void => {
  const today = getCurrentDate();
  const dailyProgress = getAllStoredData();

  // Update time for current date and component
  dailyProgress[today] = {
    ...dailyProgress[today],
    [componentId]: seconds,
  };

  saveAllData(dailyProgress);

  // Sync with Redux
  if (isLessonSection(componentId)) {
    store.dispatch(updateChapterProgress({ chapterId: componentId, timeSpent: seconds }));
  } else {
    store.dispatch(updateActivityProgress({ activityId: componentId, timeSpent: seconds }));
  }
};

/**
 * Get all time records for today
 * @returns Object with time data for all components for today
 */
export const getAllTimeForToday = (): TimeData => {
  const today = getCurrentDate();
  const dailyProgress = getAllStoredData();
  return dailyProgress[today] || {};
};
