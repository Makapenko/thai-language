# Thai Language Learning App

Приложение для изучения тайского языка по методу "Полиглот 16 часов".

## Технологии

- **React 18** + **TypeScript**
- **Redux Toolkit** — состояние приложения
- **CSS Modules** — стилизация, без UI фреймворков
- **Vite** — сборка
- **Web Speech API** — озвучка тайских слов
- **localStorage** — хранение прогресса (структура готова под будущий бэкенд)

## Структура проекта

```
src/
├── app/
│   ├── store.ts              # Redux store
│   └── hooks.ts              # Типизированные хуки
├── features/
│   ├── lessons/
│   │   ├── lessonsSlice.ts   # Состояние уроков
│   │   ├── Lesson.tsx        # Страница урока
│   │   └── lessons.module.css
│   ├── words/
│   │   ├── wordsSlice.ts     # Прогресс по словам
│   │   ├── WordExercise.tsx  # Упражнение "Новые слова"
│   │   └── words.module.css
│   ├── phrases/
│   │   ├── phrasesSlice.ts   # Прогресс по фразам
│   │   ├── PhraseBuilder.tsx # Конструктор фраз
│   │   └── phrases.module.css
│   └── progress/
│       ├── progressSlice.ts  # Общий прогресс
│       └── storage.ts        # Абстракция над localStorage/API
├── components/
│   ├── Button/
│   ├── ProgressBar/
│   ├── Card/
│   └── Layout/
├── data/
│   ├── lesson1.ts            # Данные первого урока
│   └── types.ts              # Типы данных
├── utils/
│   ├── speech.ts             # Web Speech API обёртка
│   └── shuffle.ts            # Перемешивание вариантов
├── styles/
│   ├── variables.css         # CSS переменные (цвета, размеры)
│   ├── reset.css             # CSS reset
│   └── global.css            # Глобальные стили
├── App.tsx
└── main.tsx
```

## Дизайн

### Адаптивность

- **Mobile-first** подход
- Breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### Цветовая схема

```css
:root {
  /* Основные */
  --color-primary: #4A90D9;      /* Синий - основной акцент */
  --color-success: #4CAF50;      /* Зелёный - правильный ответ */
  --color-error: #F44336;        /* Красный - ошибка */
  --color-warning: #FF9800;      /* Оранжевый - предупреждение */

  /* Фон */
  --color-bg: #F5F5F5;
  --color-bg-card: #FFFFFF;

  /* Текст */
  --color-text: #212121;
  --color-text-secondary: #757575;

  /* Тайский текст */
  --color-thai: #1976D2;         /* Выделение тайского текста */
}
```

### Типографика

```css
:root {
  --font-main: 'Inter', -apple-system, sans-serif;
  --font-thai: 'Noto Sans Thai', sans-serif;  /* Для тайских символов */

  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.25rem;    /* 20px */
  --font-size-xl: 1.5rem;     /* 24px */
  --font-size-thai: 1.5rem;   /* Тайский текст крупнее */
}
```

## Структура данных

### Слово (Word)

```typescript
interface Word {
  id: string;
  thai: string;           // ผม
  transcription: string;  // pǒm
  russian: string;        // я (муж.)
  audioUrl?: string;      // Опционально, для записанных файлов
  category: 'pronoun' | 'verb' | 'particle' | 'noun' | 'adjective';
}
```

### Прогресс по слову (WordProgress)

```typescript
interface WordProgress {
  wordId: string;
  correctStreak: number;  // 0-4, сбрасывается при ошибке
  lastPracticed: number;  // timestamp
  timesCorrect: number;   // Всего правильных ответов
  timesWrong: number;     // Всего ошибок
}
```

### Фраза для конструктора (Phrase)

```typescript
interface Phrase {
  id: string;
  russian: string;        // "Она будет работать"
  thai: string;           // "เขาจะทำงาน"
  transcription: string;  // "kǎo jà tam-ngaan"
  parts: PhrasePart[];    // Части для сборки
}

interface PhrasePart {
  groupId: string;        // 'subject' | 'time' | 'verb' | 'ending'
  thai: string;
  transcription: string;
}
```

### Группа слов для конструктора (WordGroup)

```typescript
interface WordGroup {
  id: string;             // 'subject', 'time', 'verb', 'ending'
  name: string;           // "Подлежащее"
  options: WordOption[];
}

interface WordOption {
  thai: string;
  transcription: string;
  russian: string;
}
```

### Прогресс урока (LessonProgress)

```typescript
interface LessonProgress {
  lessonId: number;
  wordsProgress: number;      // 0-100%
  phrasesProgress: number;    // 0-100
  phrasesCorrect: number;     // Количество правильных
  phrasesWrong: number;       // Количество ошибок
  completed: boolean;
  lastPracticed: number;
}
```

## Механика упражнений

### 1. Новые слова

- Показывается слово на русском
- 6 вариантов ответа на тайском
- Правильный ответ: `correctStreak++`
- Неправильный: `correctStreak = 0`
- После 3 правильных: показ наоборот (тайский → русский)
- После 4 правильных: слово считается выученным
- Прогресс = (сумма correctStreak всех слов) / (количество слов × 4) × 100%

### 2. Конструктор фраз

- 100 фраз на урок
- Показывается русская фраза
- 2 группы кнопок по 4 слова
- Выбор слова → группа меняется на следующую
- Правильно собрал → зелёная полоска
- Неправильно → красная полоска, повтор фразы (1 раз)
- Клик по слову → озвучка
- Полная фраза → озвучка целиком

## Хранение данных

### localStorage структура

```typescript
interface StorageData {
  version: number;                    // Версия схемы данных
  wordProgress: Record<string, WordProgress>;
  phraseProgress: Record<string, PhraseProgress>;
  lessonProgress: Record<number, LessonProgress>;
  settings: UserSettings;
  lastSync?: number;                  // Для будущей синхронизации
}

interface UserSettings {
  speechRate: number;     // Скорость озвучки 0.5-2
  speechEnabled: boolean;
  theme: 'light' | 'dark';
}
```

### Абстракция для будущего API

```typescript
// storage.ts
interface StorageService {
  getProgress(): Promise<StorageData>;
  saveProgress(data: Partial<StorageData>): Promise<void>;
  sync(): Promise<void>;  // Для будущей синхронизации
}

// Сейчас используем localStorage, потом заменим на API
export const storage: StorageService = localStorageService;
```

---

## Добавление нового типа упражнений

При добавлении нового типа упражнений (например, "Тоны", "Аудирование", "Письмо") следуй инструкции:
**[docs/PROGRESS_SYSTEM.md](docs/PROGRESS_SYSTEM.md)**

Краткий чеклист:
1. Создать тип прогресса (например, `ToneProgress`)
2. Добавить в `StorageData`
3. Создать Redux Slice с `initializeProgress`
4. Добавить метод `saveXxxProgress` в `storage.ts`
5. Добавить синхронизацию в `useStorageSync.ts`
6. Обновить `DEFAULT_STORAGE`

## Web Speech API

```typescript
// speech.ts
export function speakThai(text: string, rate = 1): void {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'th-TH';
  utterance.rate = rate;
  speechSynthesis.speak(utterance);
}

export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window;
}
```

## Команды

```bash
npm install     # Установка зависимостей
npm run dev     # Запуск dev сервера
npm run build   # Сборка для продакшена
npm run preview # Превью билда
npm run lint    # Проверка кода
```

## TODO

- [x] Инициализация проекта (Vite + React + TS)
- [x] Настройка Redux Toolkit
- [x] Базовые компоненты (Button, Card, ProgressBar)
- [x] Страница списка уроков
- [x] Страница урока (описание)
- [x] Упражнение "Новые слова"
- [x] Конструктор фраз
- [x] Web Speech API интеграция
- [ ] Адаптивный дизайн
- [x] Данные первого урока
- [x] Сохранение прогресса в localStorage
- [ ] [Прегенерация аудиофайлов](docs/audio-pregeneration.md) — ускорение озвучки тайских слов и фраз
