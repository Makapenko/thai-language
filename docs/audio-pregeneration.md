# Прегенерация аудиофайлов для TTS

## Проблема

Текущая реализация использует Sound of Text API для озвучки тайских слов и фраз в реальном времени. Это работает, но медленно (~1-2 сек задержка на каждую фразу).

## Решение

Предварительно сгенерировать все аудиофайлы и хранить их локально в проекте.

## Структура файлов

```
public/
  audio/
    words/
      w001.mp3  # ผม
      w002.mp3  # คุณ
      w003.mp3  # เขา
      ...
    phrases/
      p001.mp3  # ผมทำงาน
      p002.mp3  # คุณทำงาน
      ...
```

## Изменения в типах данных

```typescript
// В src/data/types.ts
interface Word {
  id: string;
  thai: string;
  transcription: string;
  russian: string;
  audioFile?: string;  // 'words/w001.mp3' — путь к локальному файлу
  category: 'pronoun' | 'verb' | 'particle' | 'noun' | 'adjective';
}

interface Phrase {
  id: string;
  russian: string;
  thai: string;
  transcription: string;
  audioFile?: string;  // 'phrases/p001.mp3'
  parts: PhrasePart[];
}
```

## Логика воспроизведения

```typescript
// В src/utils/speech.ts
export async function speakThai(text: string, audioFile?: string): Promise<void> {
  stopSpeech();

  // Если есть локальный файл — используем его (мгновенно)
  if (audioFile) {
    currentAudio = new Audio(`/audio/${audioFile}`);
    await currentAudio.play();
    return;
  }

  // Fallback на Sound of Text API (медленно, но работает)
  await speakThaiViaApi(text);
}
```

## Скрипт генерации

Создать Node.js скрипт `scripts/generate-audio.ts`:

1. Читает все слова и фразы из `src/data/lesson1.ts`
2. Для каждого текста:
   - Проверяет, существует ли уже файл
   - Если нет — запрашивает через Sound of Text API
   - Сохраняет MP3 в `public/audio/`
3. Обновляет данные урока с путями к файлам

### Примерный код скрипта

```typescript
import { lesson1 } from '../src/data/lesson1';
import fs from 'fs';
import path from 'path';

const API_BASE = 'https://api.soundoftext.com';
const OUTPUT_DIR = './public/audio';

async function generateAudio(text: string, filename: string): Promise<void> {
  const filepath = path.join(OUTPUT_DIR, filename);

  if (fs.existsSync(filepath)) {
    console.log(`Skip: ${filename} already exists`);
    return;
  }

  // 1. Request sound creation
  const createRes = await fetch(`${API_BASE}/sounds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      engine: 'Google',
      data: { text, voice: 'th-TH' }
    })
  });
  const { id } = await createRes.json();

  // 2. Poll for completion
  let soundUrl: string | null = null;
  for (let i = 0; i < 30; i++) {
    const statusRes = await fetch(`${API_BASE}/sounds/${id}`);
    const status = await statusRes.json();
    if (status.status === 'Done') {
      soundUrl = status.location;
      break;
    }
    await new Promise(r => setTimeout(r, 500));
  }

  if (!soundUrl) throw new Error(`Timeout for: ${text}`);

  // 3. Download and save
  const audioRes = await fetch(soundUrl);
  const buffer = await audioRes.arrayBuffer();
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, Buffer.from(buffer));

  console.log(`Generated: ${filename}`);

  // Rate limiting
  await new Promise(r => setTimeout(r, 1000));
}

async function main() {
  // Generate word audio
  for (const word of lesson1.words) {
    await generateAudio(word.thai, `words/${word.id}.mp3`);
  }

  // Generate phrase audio
  for (const phrase of lesson1.phrases) {
    await generateAudio(phrase.thai, `phrases/${phrase.id}.mp3`);
  }
}

main();
```

## Оценка размера

- ~5-15 КБ на короткую фразу
- ~20 слов × 10 КБ = ~200 КБ
- ~100 фраз × 10 КБ = ~1 МБ
- **Итого на урок: ~1.2 МБ** — вполне приемлемо

## Преимущества

- Мгновенное воспроизведение (без задержки)
- Работает офлайн
- Не зависит от внешних API
- Можно заменить на более качественные записи

## План реализации

1. [ ] Создать директорию `public/audio/`
2. [ ] Написать скрипт `scripts/generate-audio.ts`
3. [ ] Добавить npm команду `npm run generate-audio`
4. [ ] Сгенерировать аудио для урока 1
5. [ ] Обновить `speech.ts` для поддержки локальных файлов
6. [ ] Добавить `audioFile` поле в данные уроков
