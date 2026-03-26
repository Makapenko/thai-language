import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectWordsProgress } from '../features/words/wordsSlice';
import { selectAllLessonProgress, loadProgress } from '../features/progress/progressSlice';
import { storage } from '../features/progress/storage';

// Debounce helper
function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function useStorageSync() {
  const dispatch = useAppDispatch();
  const wordsProgress = useAppSelector(selectWordsProgress);
  const lessonProgress = useAppSelector(selectAllLessonProgress);
  const isInitialized = useRef(false);

  // Load progress on mount
  useEffect(() => {
    async function loadFromStorage() {
      const data = await storage.load();
      dispatch(loadProgress(data));
      isInitialized.current = true;
    }
    loadFromStorage();
  }, [dispatch]);

  // Save words progress on change
  useEffect(() => {
    if (!isInitialized.current) return;

    const save = debounce(async () => {
      await storage.saveWordProgress(wordsProgress);
    }, 500);

    save();
  }, [wordsProgress]);

  // Save lesson progress on change
  useEffect(() => {
    if (!isInitialized.current) return;

    const save = debounce(async () => {
      await storage.save({ lessonProgress });
    }, 500);

    save();
  }, [lessonProgress]);
}
