import type { StorageData, WordProgress, LessonProgress, UserSettings } from '../../data/types';
import { DEFAULT_STORAGE } from '../../data/types';

const STORAGE_KEY = 'thai-language-app';

// Storage interface for future API migration
export interface StorageService {
  load(): Promise<StorageData>;
  save(data: Partial<StorageData>): Promise<void>;
  saveWordProgress(progress: Record<string, WordProgress>): Promise<void>;
  saveLessonProgress(progress: LessonProgress): Promise<void>;
  saveSettings(settings: UserSettings): Promise<void>;
  clear(): Promise<void>;
}

// localStorage implementation
class LocalStorageService implements StorageService {
  async load(): Promise<StorageData> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_STORAGE;

      const data = JSON.parse(raw) as StorageData;

      // Handle version migrations here if needed
      if (data.version !== DEFAULT_STORAGE.version) {
        // Migrate data if needed
        data.version = DEFAULT_STORAGE.version;
      }

      return {
        ...DEFAULT_STORAGE,
        ...data,
      };
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return DEFAULT_STORAGE;
    }
  }

  async save(data: Partial<StorageData>): Promise<void> {
    try {
      const current = await this.load();
      const updated: StorageData = {
        ...current,
        ...data,
        version: DEFAULT_STORAGE.version,
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

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Export singleton instance
export const storage: StorageService = new LocalStorageService();
