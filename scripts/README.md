# Audio Generation Script

Скрипт для предварительной загрузки аудиофайлов тайских **слов** через Sound of Text API.

## 🚀 Быстрый старт

```bash
# Сгенерировать все аудиофайлы слов (фразы не нужны)
npm run generate-audio

# Проверить статус
npm run check-audio
```

## 💡 Концепция

**Фразы воспроизводятся путём последовательного проигрывания аудиофайлов отдельных слов.**

Пример:
- Фраза: "ผมทำงาน" (я работаю)
- Воспроизводится как: `w1-1.mp3` → `w1-12.mp3`
- С паузой 300мс между словами

### Преимущества

| Параметр | Старый подход | Новый подход |
|----------|--------------|--------------|
| Файлов | 4451 (111 слов + 4340 фраз) | **111** (только слова) |
| Время генерации | ~5 часов | **~8 минут** |
| Место на диске | ~50 МБ | **~1 МБ** |
| Гибкость | Фиксированные фразы | Любые комбинации |

## Как это работает

1. **Генерация**: Скрипт скачивает только слова из `src/data/lesson1/words.ts`
2. **Сохранение**: MP3 файлы в `public/audio/words/`
3. **Воспроизведение фраз**: Функция `speakThaiPhrase()` проигрывает слова последовательно

## Использование в приложении

### Воспроизведение слова

```typescript
import { speakThai } from './utils/speech';

// Мгновенное воспроизведение из локального файла
await speakThai('ผม', 'words/w1-1.mp3');
```

### Воспроизведение фразы

```typescript
import { speakThaiPhrase, stopPhrasePlayback } from './utils/speech';

// Фраза "ผมทำงาน" (я работаю)
await speakThaiPhrase([
  'words/w1-1.mp3',   // ผม
  'words/w1-12.mp3'   // ทำงาน
], 300); // 300ms пауза между словами

// Остановка воспроизведения фразы
stopPhrasePlayback();
```

### Из данных урока

```typescript
import { lesson1Phrases } from './data/lesson1';
import { speakThaiPhrase } from './utils/speech';

// Предположим, у фразы есть структура с wordId
const phrase = lesson1Phrases[0];
const wordAudioFiles = phrase.structure.map(
  part => `words/${part.wordId}.mp3`
);

await speakThaiPhrase(wordAudioFiles);
```

## Конфигурация

В `scripts/generate-audio.ts`:

```typescript
const REQUEST_DELAY = 4000;        // Задержка между запросами (мс)
const POLL_INTERVAL = 800;         // Интервал опроса статуса (мс)
const MAX_POLL_ATTEMPTS = 50;      // Макс. количество попыток опроса
const MAX_RETRIES = 5;             // Макс. количество повторных попыток
const RETRY_BASE_DELAY = 3000;     // Базовая задержка для backoff
```

В `src/utils/speech.ts`:

```typescript
const DEFAULT_WORD_PAUSE = 300;    // Пауза между словами в фразе (мс)
```

## Обработка ошибок

- **HTTP 429 (Rate Limit)**: Автоматическая задержка с exponential backoff
- **Таймаут**: 5 попыток с возрастающей задержкой (3с, 6с, 12с, 24с, 48с)
- **Неудачные файлы**: Сохраняются в список для повторной попытки
- **Пропуск существующих**: Файлы которые уже есть не перезаписываются

## Время выполнения

- ~15 запросов в минуту
- 111 слов = ~8 минут
- Можно прерывать и продолжать

## Структура файлов

```
public/
  audio/
    words/
      w1-1.mp3    # ผม
      w1-2.mp3    # ฉัน
      w1-3.mp3    # คุณ
      w1-7.mp3    # กิน
      w1-12.mp3   # ทำงาน
      ...
```

## Команды

```bash
# Проверить какие файлы отсутствуют
npm run check-audio

# Сгенерировать недостающие файлы
npm run generate-audio
```

## Пример прогресса

```
🎵 Thai Audio Generator (Words Only)

Output directory: /path/to/public/audio/words

Rate limit: ~15 requests/minute (4000ms delay)

💡 Phrases will be played by combining individual word audio files

📚 Generating words audio...
   Total: 111

[1/111] ✓ Skip: w1-1.mp3 already exists
[2/111] ✓ Skip: w1-2.mp3 already exists
[3/111] [1/5] Generating: คุณ → w1-3.mp3
✓ Generated: w1-3.mp3
...

✅ Words: 111/111 generated

============================================================
📊 Summary:
  Total:    111
  Success:  111
  Failed:   0
  Time est: ~8 minutes
============================================================

✅ All audio files generated successfully!
```
