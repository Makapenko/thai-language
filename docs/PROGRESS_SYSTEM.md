# Система сохранения прогресса

## Архитектура

Система сохраняет прогресс пользователя в `localStorage` и поддерживает:
- Несколько уроков
- Различные типы упражнений (слова, фразы, и будущие типы)
- Автосохранение с debounce 500мс
- Миграцию данных между версиями

## Структура данных

```typescript
StorageData {
  version: number;
  wordProgress: Record<string, WordProgress>;      // Прогресс слов
  phraseProgress: Record<string, PhraseProgress>;  // Прогресс фраз
  lessonProgress: Record<number, LessonProgress>;  // Прогресс уроков
  settings: UserSettings;                          // Настройки пользователя
}
```

## Компоненты системы

### 1. Storage Service
**Файл:** `src/features/progress/storage.ts`

Singleton-сервис для работы с localStorage:
- `load()` — загрузить все данные
- `save(data)` — сохранить данные
- `saveWordProgress(progress)` — сохранить прогресс слов
- `savePhraseProgress(progress)` — сохранить прогресс фраз
- `saveLessonProgress(progress)` — сохранить прогресс урока
- `saveSettings(settings)` — сохранить настройки

### 2. Redux Slices

**progressSlice** (`src/features/progress/progressSlice.ts`)
- `lessonProgress` — прогресс по урокам
- `settings` — настройки пользователя
- `initializeProgress` — инициализация из localStorage

**wordsSlice** (`src/features/words/wordsSlice.ts`)
- `progress` — прогресс каждого слова (correctStreak, completed, и т.д.)
- `initializeProgress` — загрузка из localStorage

**phrasesSlice** (`src/features/phrases/phrasesSlice.ts`)
- `progress` — прогресс каждой фразы
- `PhraseProgress` — тип прогресса
- `initializeProgress` — загрузка из localStorage

### 3. Sync Hook
**Файл:** `src/hooks/useStorageSync.ts`

Хук `useStorageSync()`:
- Загружает весь прогресс при монтировании приложения
- Автоматически сохраняет изменения с debounce 500мс
- Подключается в `App.tsx`

---

## Добавление нового типа упражнений

Для добавления нового типа упражнений (например, "Тоны", "Аудирование", "Письмо"):

### Шаг 1: Создайте тип прогресса

```typescript
// src/data/types.ts
export interface ToneProgress {
  exerciseId: string;
  correctStreak: number;
  completed: boolean;
  lastPracticed: number;
  timesCorrect: number;
  timesWrong: number;
}
```

### Шаг 2: Добавьте в StorageData

```typescript
// src/data/types.ts
export interface StorageData {
  version: number;
  wordProgress: Record<string, WordProgress>;
  phraseProgress: Record<string, PhraseProgress>;
  toneProgress: Record<string, ToneProgress>;  // ← Добавить
  lessonProgress: Record<number, LessonProgress>;
  settings: UserSettings;
}
```

### Шаг 3: Создайте Redux Slice

```typescript
// src/features/tones/tonesSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface TonesState {
  exercises: ToneExercise[];
  progress: Record<string, ToneProgress>;
  // ...
}

const tonesSlice = createSlice({
  name: 'tones',
  initialState,
  reducers: {
    initializeProgress: (state, action: PayloadAction<Record<string, ToneProgress>>) => {
      state.progress = action.payload;
    },
    // ... другие reducer'ы
  },
});

export const { initializeProgress, ... } = tonesSlice.actions;
```

### Шаг 4: Добавьте метод в Storage Service

```typescript
// src/features/progress/storage.ts
export interface StorageService {
  // ...
  saveToneProgress(progress: Record<string, ToneProgress>): Promise<void>;
}

class LocalStorageService implements StorageService {
  // ...
  async saveToneProgress(progress: Record<string, ToneProgress>): Promise<void> {
    const current = await this.load();
    await this.save({
      toneProgress: {
        ...current.toneProgress,
        ...progress,
      },
    });
  }
}
```

### Шаг 5: Добавьте синхронизацию в useStorageSync

```typescript
// src/hooks/useStorageSync.ts
import { selectToneProgress } from '../features/tones/tonesSlice';
import { initializeProgress as initTonesProgress } from '../features/tones/tonesSlice';

export function useStorageSync() {
  const dispatch = useAppDispatch();
  const toneProgress = useAppSelector(selectToneProgress);
  
  useEffect(() => {
    async function loadFromStorage() {
      const data = await storage.load();
      dispatch(initProgress(data));
      dispatch(initWordsProgress(data.wordProgress || {}));
      dispatch(initPhrasesProgress(data.phraseProgress || {}));
      dispatch(initTonesProgress(data.toneProgress || {}));  // ← Добавить
    }
    loadFromStorage();
  }, [dispatch]);

  // Сохранение при изменении
  useEffect(() => {
    if (!isInitialized.current) return;
    const save = debounce(async () => {
      await storage.saveToneProgress(toneProgress);  // ← Добавить
    }, 500);
    save();
  }, [toneProgress]);
}
```

### Шаг 6: Обновите DEFAULT_STORAGE

```typescript
// src/data/types.ts
export const DEFAULT_STORAGE: StorageData = {
  version: 1,
  wordProgress: {},
  phraseProgress: {},
  toneProgress: {},  // ← Добавить
  lessonProgress: {},
  settings: DEFAULT_SETTINGS,
};
```

---

## Миграция данных

При изменении структуры `StorageData`:

1. Увеличьте `version` в `DEFAULT_STORAGE`
2. Добавьте логику миграции в `storage.ts`:

```typescript
private migrateData(data: StorageData): StorageData {
  if (data.version < 2) {
    // Миграция версии 1 -> 2
    data.toneProgress = {};
  }
  
  return {
    ...DEFAULT_STORAGE,
    ...data,
    version: DEFAULT_STORAGE.version,
  };
}
```

---

## Отладка

### Просмотр сохранённых данных

```javascript
// В консоли браузера
const data = JSON.parse(localStorage.getItem('thai-language-app'));
console.log(data);
```

### Сброс прогресса

```javascript
// В консоли браузера
localStorage.removeItem('thai-language-app');
location.reload();
```

### Ключ хранения

```typescript
import { getStorageKey } from './features/progress/storage';
console.log(getStorageKey()); // 'thai-language-app'
```
