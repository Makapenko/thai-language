import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectWordsProgress, selectDailyWordsProgress, selectUnlockedWords, initializeDailyProgress as initDailyWordsProgress, setUnlockedWords } from '../features/words/wordsSlice';
import { selectAllLessonProgress, selectSettings, initializeProgress as initProgress, selectDailyProgress as selectDailyReadingProgress, selectFavorites } from '../features/progress/progressSlice';
import { selectPhraseProgress, selectDailyPhrasesProgress, initializeDailyProgress as initDailyPhrasesProgress } from '../features/phrases/phrasesSlice';
import { storage } from '../features/progress/storage';
import { initializeProgress as initWordsProgress } from '../features/words/wordsSlice';
import { initializeProgress as initPhrasesProgress } from '../features/phrases/phrasesSlice';
import { setFavorites } from '../features/progress/progressSlice';

// Debounce helper
function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

/**
 * Hook for synchronizing Redux state with localStorage
 * - Loads progress from localStorage on mount
 * - Saves changes to localStorage with debounce
 */
export function useStorageSync() {
  const dispatch = useAppDispatch();
  const wordsProgress = useAppSelector(selectWordsProgress);
  const lessonProgress = useAppSelector(selectAllLessonProgress);
  const phraseProgress = useAppSelector(selectPhraseProgress);
  const settings = useAppSelector(selectSettings);
  const dailyWordsProgress = useAppSelector(selectDailyWordsProgress);
  const dailyPhrasesProgress = useAppSelector(selectDailyPhrasesProgress);
  const dailyReadingProgress = useAppSelector(selectDailyReadingProgress);
  const unlockedWordIds = useAppSelector(selectUnlockedWords);
  const favorites = useAppSelector(selectFavorites);
  const isInitialized = useRef(false);

  // Load all progress from localStorage on mount (once)
  useEffect(() => {
    async function loadFromStorage() {
      try {
        console.log('[useStorageSync] Loading from storage...');
        const data = await storage.load();
        console.log('[useStorageSync] Loaded data:', {
          wordProgressKeys: Object.keys(data.wordProgress || {}).length,
          unlockedWordIds: data.unlockedWordIds?.length || 0
        });

        // Initialize all slices with persisted data
        dispatch(initProgress({
          ...data,
          dailyProgress: data.dailyProgress || {},
          favorites: data.favorites || [],
        }));
        dispatch(initWordsProgress(data.wordProgress || {}));
        dispatch(initPhrasesProgress(data.phraseProgress || {}));
        dispatch(initDailyWordsProgress(data.dailyWordsProgress || {}));
        dispatch(initDailyPhrasesProgress(data.dailyPhrasesProgress || {}));

        // Restore favorites from localStorage
        if (data.favorites && data.favorites.length > 0) {
          console.log('[useStorageSync] Restoring favorites from localStorage:', data.favorites);
          dispatch(setFavorites(data.favorites));
        }

        // Restore unlocked words from localStorage or from progress
        // Priority: localStorage data > computed from progress
        // Note: We restore ALL lesson unlocked words here, and WordsPage will call
        // restoreUnlockedWords(lessonId) if needed for the current lesson
        if (data.unlockedWordIds && data.unlockedWordIds.length > 0) {
          console.log('[useStorageSync] Restoring unlockedWordIds from localStorage:', data.unlockedWordIds);
          dispatch(setUnlockedWords(data.unlockedWordIds));
        }
        // Note: If no unlockedWordIds in localStorage, WordsPage will call restoreUnlockedWords(lessonId)

        isInitialized.current = true;
        console.log('[useStorageSync] Initialization complete');
      } catch (error) {
        console.error('Failed to load progress from localStorage:', error);
      }
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

  // Save phrase progress on change
  useEffect(() => {
    if (!isInitialized.current) return;

    const save = debounce(async () => {
      await storage.savePhraseProgress(phraseProgress);
    }, 500);

    save();
  }, [phraseProgress]);

  // Save settings on change
  useEffect(() => {
    if (!isInitialized.current) return;

    const save = debounce(async () => {
      await storage.saveSettings(settings);
    }, 500);

    save();
  }, [settings]);

  // Save daily words progress on change
  useEffect(() => {
    if (!isInitialized.current) return;

    const save = debounce(async () => {
      await storage.saveDailyWordsProgress(dailyWordsProgress);
    }, 1000);

    save();
  }, [dailyWordsProgress]);

  // Save daily phrases progress on change
  useEffect(() => {
    if (!isInitialized.current) return;

    const save = debounce(async () => {
      await storage.saveDailyPhrasesProgress(dailyPhrasesProgress);
    }, 1000);

    save();
  }, [dailyPhrasesProgress]);

  // Save daily reading progress on change
  useEffect(() => {
    if (!isInitialized.current) return;

    const save = debounce(async () => {
      await storage.saveDailyProgress(dailyReadingProgress);
    }, 1000);

    save();
  }, [dailyReadingProgress]);

  // Save unlocked word IDs on change
  useEffect(() => {
    if (!isInitialized.current) return;

    const save = debounce(async () => {
      await storage.saveUnlockedWordIds(unlockedWordIds);
    }, 1000);

    save();
  }, [unlockedWordIds]);

  // Save favorites on change
  useEffect(() => {
    if (!isInitialized.current) return;

    const save = debounce(async () => {
      await storage.saveFavorites(favorites);
    }, 1000);

    save();
  }, [favorites]);
}
