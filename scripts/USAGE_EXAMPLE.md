# Пример использования аудио в приложении

## 1. Генерация аудиофайлов

```bash
npm run generate-audio
```

После выполнения в `public/audio/words/` появятся файлы:
- `w1-1.mp3` - ผม (я)
- `w1-12.mp3` - ทำงาน (работать)
- и т.д.

## 2. Воспроизведение отдельного слова

```typescript
import { speakThai } from '@/utils/speech';

// При клике на слово
function handleWordClick() {
  speakThai('ผม', 'words/w1-1.mp3');
}
```

## 3. Воспроизведение фразы

```typescript
import { speakThaiPhrase, stopPhrasePlayback } from '@/utils/speech';

// Фраза: "ผมทำงาน" (я работаю)
async function playPhrase() {
  await speakThaiPhrase(
    [
      'words/w1-1.mp3',    // ผม
      'words/w1-12.mp3'    // ทำงาน
    ],
    300  // пауза 300мс между словами
  );
}

// Остановка
function stopPhrase() {
  stopPhrasePlayback();
}
```

## 4. Интеграция с данными урока

Если у вас есть структура фразы с ссылками на слова:

```typescript
import { lesson1Phrases } from '@/data/lesson1';
import { speakThaiPhrase } from '@/utils/speech';

interface PhraseStructure {
  groupId: string;
  wordId: string;  // ID слова
  thai: string;
}

interface Phrase {
  id: string;
  russian: string;
  thai: string;
  structure: PhraseStructure[];
}

// Компонент PhraseCard
function PhraseCard({ phrase }: { phrase: Phrase }) {
  const handlePlay = async () => {
    // Преобразуем структуру фразы в массив аудиофайлов
    const audioFiles = phrase.structure.map(
      part => `words/${part.wordId}.mp3`
    );
    
    await speakThaiPhrase(audioFiles, 300);
  };

  return (
    <div>
      <p>{phrase.thai}</p>
      <p>{phrase.russian}</p>
      <button onClick={handlePlay}>🔊 Play</button>
    </div>
  );
}
```

## 5. Пример с ProgressBar

```typescript
import { useState } from 'react';
import { speakThaiPhrase, stopPhrasePlayback } from '@/utils/speech';

function PhrasePlayer({ phrase }: { phrase: Phrase }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);

  const handlePlay = async () => {
    if (isPlaying) {
      stopPhrasePlayback();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    setCurrentWordIndex(0);

    const audioFiles = phrase.structure.map(
      part => `words/${part.wordId}.mp3`
    );

    // Проигрываем с обновлением прогресса
    for (let i = 0; i < audioFiles.length; i++) {
      setCurrentWordIndex(i);
      
      const audio = new Audio(`/audio/${audioFiles[i]}`);
      await new Promise<void>(resolve => {
        audio.onended = () => resolve();
        audio.play();
      });
      
      // Пауза между словами
      if (i < audioFiles.length - 1) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    setIsPlaying(false);
    setCurrentWordIndex(-1);
  };

  return (
    <div>
      <div className="phrase">{phrase.thai}</div>
      
      {/* Прогресс по словам */}
      <div className="word-progress">
        {phrase.structure.map((part, index) => (
          <span
            key={part.wordId}
            className={index === currentWordIndex ? 'active' : ''}
          >
            {part.thai}
          </span>
        ))}
      </div>
      
      <button onClick={handlePlay}>
        {isPlaying ? '⏹ Stop' : '🔊 Play'}
      </button>
    </div>
  );
}
```

## 6. Настройка скорости воспроизведения

```typescript
// Быстрее (меньше пауза)
await speakThaiPhrase(audioFiles, 150);  // 150мс между словами

// Медленнее (больше пауза)
await speakThaiPhrase(audioFiles, 500);  // 500мс между словами

// Для обучения (очень медленно)
await speakThaiPhrase(audioFiles, 800);  // 800мс между словами
```

## 7. Предварительная загрузка аудио

```typescript
// Предзагрузка аудиофайлов для фразы
function preloadPhraseAudio(phrase: Phrase): HTMLAudioElement[] {
  return phrase.structure.map(part => {
    const audio = new Audio(`/audio/words/${part.wordId}.mp3`);
    audio.load();
    return audio;
  });
}

// Использование
const phrase = lesson1Phrases[0];
const preloadedAudio = preloadPhraseAudio(phrase);
// Теперь аудио загружены в кэш браузера
```
