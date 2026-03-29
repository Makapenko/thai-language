import type { StorageData, WordProgress, LessonProgress, UserSettings, PhraseProgress } from '../../data/types';
import { DEFAULT_STORAGE } from '../../data/types';
import type { DailyWordsData } from '../words/wordsSlice';
import type { DailyPhrasesData } from '../phrases/phrasesSlice';
import type { DailyProgress } from './progressSlice';

const STORAGE_KEY = 'thai-language-app';

// Extended storage interface
export interface ExtendedStorageData extends StorageData {
  dailyWordsProgress?: DailyWordsData;
  dailyPhrasesProgress?: DailyPhrasesData;
  dailyProgress?: DailyProgress;
  unlockedWordIds?: string[];
}

// Storage interface for future API migration
export interface StorageService {
  load(): Promise<ExtendedStorageData>;
  save(data: Partial<ExtendedStorageData>): Promise<void>;
  saveWordProgress(progress: Record<string, WordProgress>): Promise<void>;
  savePhraseProgress(progress: Record<string, PhraseProgress>): Promise<void>;
  saveLessonProgress(progress: LessonProgress): Promise<void>;
  saveSettings(settings: UserSettings): Promise<void>;
  saveDailyWordsProgress(progress: DailyWordsData): Promise<void>;
  saveDailyPhrasesProgress(progress: DailyPhrasesData): Promise<void>;
  saveDailyProgress(progress: DailyProgress): Promise<void>;
  saveUnlockedWordIds(ids: string[]): Promise<void>;
  clear(): Promise<void>;
  reset(): Promise<void>;
}

// localStorage implementation
class LocalStorageService implements StorageService {
  async load(): Promise<ExtendedStorageData> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_STORAGE as ExtendedStorageData;

      const data = JSON.parse(raw) as ExtendedStorageData;

      // Handle version migrations here if needed
      if (!data.version || data.version < (DEFAULT_STORAGE.version || 1)) {
        return this.migrateData(data);
      }

      return {
        ...(DEFAULT_STORAGE as ExtendedStorageData),
        ...data,
      };
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return DEFAULT_STORAGE as ExtendedStorageData;
    }
  }

  private migrateData(data: ExtendedStorageData): ExtendedStorageData {
    if (!data.version) {
      data.version = 1;
    }

    return {
      ...(DEFAULT_STORAGE as ExtendedStorageData),
      ...data,
      version: DEFAULT_STORAGE.version,
    };
  }

  async save(data: Partial<ExtendedStorageData>): Promise<void> {
    try {
      const current = await this.load();
      const updated: ExtendedStorageData = {
        ...current,
        ...data,
        version: DEFAULT_STORAGE.version,
        lastSync: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  async saveWordProgress(progress: Record<string, WordProgress>): Promise<void> {
    const current = await this.load();
    await this.save({
      wordProgress: {
        ...current.wordProgress,
        ...progress,
      },
    });
  }

  async savePhraseProgress(progress: Record<string, PhraseProgress>): Promise<void> {
    const current = await this.load();
    await this.save({
      phraseProgress: {
        ...current.phraseProgress,
        ...progress,
      },
    });
  }

  async saveLessonProgress(progress: LessonProgress): Promise<void> {
    const current = await this.load();
    await this.save({
      lessonProgress: {
        ...current.lessonProgress,
        [progress.lessonId]: progress,
      },
    });
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    await this.save({ settings });
  }

  async saveDailyWordsProgress(progress: DailyWordsData): Promise<void> {
    await this.save({ dailyWordsProgress: progress });
  }

  async saveDailyPhrasesProgress(progress: DailyPhrasesData): Promise<void> {
    await this.save({ dailyPhrasesProgress: progress });
  }

  async saveDailyProgress(progress: DailyProgress): Promise<void> {
    await this.save({ dailyProgress: progress });
  }

  async saveUnlockedWordIds(ids: string[]): Promise<void> {
    await this.save({ unlockedWordIds: ids });
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }

  async reset(): Promise<void> {
    await this.clear();
  }
}

// Export singleton instance
export const storage: StorageService = new LocalStorageService();

// Export storage key for debugging/testing
export const getStorageKey = (): string => STORAGE_KEY;
