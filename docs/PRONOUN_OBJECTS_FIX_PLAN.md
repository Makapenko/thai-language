# План: Добавление типа предложений "Подлежащее + Сказуемое + Дополнение (местоимение)"

## Описание задачи

Добавить новый тип генерируемых предложений для урока 2 - предложения с местоимениями-дополнениями (объектами). 

Примеры из запроса:
- ฉันเห็นคุณ (chǎn hěn khun) — Я вижу тебя
- เขาช่วยฉัน (khǎo chûay chǎn) — Он помогает мне
- เรารอพวกเขา (rao rɔ̌ɔ phûak-khǎo) — Мы ждём их
- คุณโทรหาเขา (kun too hǎa khǎo) — Ты звонишь ему

Это предложения структуры: **подлежащее + глагол + дополнение (местоимение)**

## Анализ текущего кода

### Структура данных

1. **Местоимения (subjects/objects):**
   - Урок 1: `src/data/vocabulary/lessons/lesson1.ts` — `pronouns` (Subject[])
     - ผม (я муж.), ฉัน (я жен.), คุณ (ты/вы), เขา (он/она), เรา (мы), พวกเขา (они), มัน (оно/это)
   - Урок 2: `src/data/vocabulary/lessons/lesson2.ts` — `pronouns` (Subject[])
     - ดิฉัน, ท่าน, เธอ, กู, มึง

2. **Глаголы:**
   - Урок 1: `src/data/vocabulary/lessons/lesson1.ts` — `verbs` (Verb[])
   - Нужно отфильтровать глаголы, которые могут принимать объекты-местоимения (транзитивные)

3. **Существующие типы предложений:**
   - `patterns` — без объектов (10 типов)
   - `patternsWithObject` — с объектами-существительными (8 типов) 
   - `questionPatterns` — вопросительные (7 типов)
   - **Нужно добавить:** новый тип для объектов-местоимений

4. **Генерация фраз:**
   - `generatePhrases` — без объектов
   - `generatePhrasesWithObjects` — с объектами-существительными
   - `generateQuestionPhrases` — вопросительные
   - **Нужно добавить:** `generatePhrasesWithPronounObjects`

5. **Слово-группы для UI:**
   - `lesson2WordGroups` в `src/data/lesson2/phrases.ts`
   - **Нужно добавить:** группу `objectPronoun` с местоимениями-дополнениями

### Ключевые файлы для редактирования

1. `src/data/types.ts` — добавить новые SentenceType
2. `src/data/phrasePatterns.ts` — добавить новые паттерны
3. `src/data/phraseGenerator.ts` — добавить новую функцию генерации
4. `src/data/vocabulary/lessons/lesson1.ts` — добавить информацию о дополнениях
5. `src/data/lesson1/phrases.ts` — определить местоимения-дополнения
6. `src/data/lesson2/phrases.ts` — создать новый массив фраз и добавить в UI
7. `src/pages/PhrasesPage.tsx` — добавить чекбокс для нового типа

## План выполнения

### Шаг 1: Определить местоимения-дополнения

**Файлы:** `src/data/vocabulary/lessons/lesson1.ts` `src/data/vocabulary/lessons/lesson2.ts` 

Необходимо создать массив местоимений в роли дополнений (object pronouns):

```typescript
export const objectPronouns: ObjectPronoun[] = [
  { thai: 'ผม', transcription: 'pǒm', russian: 'меня (муж.)', russianAccusative: 'меня' },
  { thai: 'ฉัน', transcription: 'chǎn', russian: 'меня (жен.)', russianAccusative: 'меня' },
  { thai: 'คุณ', transcription: 'kun', russian: 'тебя/вас', russianAccusative: 'тебя/вас' },
  { thai: 'เขา', transcription: 'kǎo', russian: 'его/её', russianAccusative: 'его/её' },
  { thai: 'เรา', transcription: 'rao', russian: 'нас', russianAccusative: 'нас' },
  { thai: 'พวกเขา', transcription: 'pûak-kǎo', russian: 'их', russianAccusative: 'их' },
];
```

**Важно:** Те же местоимения используются и как подлежащее, и как дополнение в тайском.

### Шаг 2: Определить совместимые глаголы

Создать список транзитивных глаголов, которые могут принимать местоимения-дополнения:

Подходящие глаголы из урока 1:
- เห็น (видеть)
- ช่วย (помогать)
- รอ (ждать)
- โทร (звонить)
- รัก (любить)
- รู้ (знать)
- พบ (встречать)
- ให้ (давать)
- ถาม (спрашивать)
- ตอบ (отвечать)
- และ другие транзитивные глаголы

Можно использовать словарь совместимости из `src/data/vocabulary/verbObjectCompatibility.ts` или создать отдельный список.

### Шаг 3: Добавить новые SentenceType

**Файл:** `src/data/types.ts`

Добавить в `SentenceType`:

```typescript
// With object pronoun (Lesson 2)
| 'present_affirmative_obj_pron'   // Я вижу тебя
| 'present_negative_obj_pron'      // Я не вижу тебя
| 'present_question_obj_pron'      // Ты видишь меня?
| 'past_affirmative_obj_pron'      // Я видел тебя
| 'past_negative_obj_pron'         // Я не видел тебя
| 'future_affirmative_obj_pron'    // Я увижу тебя
| 'future_negative_obj_pron'       // Я не увижу тебя
| 'continuous_obj_pron'            // Я сейчас вижу тебя
```

### Шаг 4: Создать паттерны для предложений с местоимениями-дополнениями

**Файл:** `src/data/phrasePatterns.ts` или `src/data/phrasePatterns.lesson2.ts`

Создать интерфейс `PatternWithPronounObject`:

```typescript
interface PatternWithPronounObject {
  type: SentenceType;
  russianTemplate: (subject: Subject, verb: Verb, objectPronoun: ObjectPronoun) => string;
  buildStructure: (subject: Subject, verb: Verb, objectPronoun: ObjectPronoun) => PhraseStructure[];
  buildThai: (subject: Subject, verb: Verb, objectPronoun: ObjectPronoun) => string;
  buildTranscription: (subject: Subject, verb: Verb, objectPronoun: ObjectPronoun) => string;
}
```

Создать массив `patternsWithPronounObject` аналогично `patternsWithObject`, но вместо `Noun` использовать `ObjectPronoun`.

Пример паттерна:

```typescript
{
  type: 'present_affirmative_obj_pron',
  russianTemplate: (s, v, o) => capitalizeFirst(`${getSubjectLabel(s)} ${v.present[s.conjIndex]} ${o.russianAccusative}`),
  buildStructure: (s, v, o) => [
    { groupId: 'subject', thai: s.thai, transcription: s.transcription },
    { groupId: 'verb', thai: v.thai, transcription: v.transcription },
    { groupId: 'objectPronoun', thai: o.thai, transcription: o.transcription },
  ],
  buildThai: (s, v, o) => `${s.thai}${v.thai}${o.thai}`,
  buildTranscription: (s, v, o) => `${s.transcription} ${v.transcription} ${o.transcription}`,
}
```

### Шаг 5: Добавить функцию генерации

**Файл:** `src/data/phraseGenerator.ts`

Создать функцию `generatePhrasesWithPronounObjects`:

```typescript
export function generatePhrasesWithPronounObjects(
  subjects: Subject[],
  verbs: Verb[],
  objectPronouns: ObjectPronoun[],
  patternTypes: SentenceType[],
  lessonId: number,
  idPrefix: string = 'pop'
): Phrase[] {
  // Аналогично generatePhrasesWithObjects
  // Но без семантической проверки (или с отдельной проверкой)
}
```

### Шаг 6: Создать массив фраз для урока 2

**Файл:** `src/data/lesson2/phrases.ts`

1. Импортировать новые паттерны и функцию генерации
2. Определить местоимения-дополнения (из урока 1 + урока 2)
3. Отфильтровать подходящие глаголы
4. Сгенерировать фразы:

```typescript
export const lesson2PhrasesWithPronounObjects: Phrase[] = generatePhrasesWithPronounObjects(
  lesson2Pronouns,  // подлежащие из урока 2
  compatibleVerbs,  // глаголы, принимающие дополнения
  allObjectPronouns, // местоимения-дополнения (урок 1 + урок 2)
  [
    'present_affirmative_obj_pron',
    'present_negative_obj_pron',
    'present_question_obj_pron',
    'past_affirmative_obj_pron',
    'past_negative_obj_pron',
    'future_affirmative_obj_pron',
    'future_negative_obj_pron',
    'continuous_obj_pron',
  ],
  2
);
```

5. Добавить в `lesson2AllPhrases`

### Шаг 7: Обновить WordGroups для урока 2

**Файл:** `src/data/lesson2/phrases.ts`

Добавить новую группу в `lesson2WordGroups`:

```typescript
{
  id: 'objectPronoun',
  name: 'Объект (мест.)',
  options: allObjectPronouns.map(p => ({ 
    thai: p.thai, 
    transcription: p.transcription, 
    russian: p.russianAccusative 
  })),
}
```

### Шаг 8: Добавить чекбокс в UI

**Файл:** `src/pages/PhrasesPage.tsx`

1. Обновить начальное состояние `checked`:

```typescript
const [checked, setChecked] = useState<Record<string, boolean>>({
  standard: true,
  withObjects: true,
  withPronounObjects: true,  // НОВОЕ
  questions: true,
});
```

2. Обновить `PHRASE_TYPE_LABELS`:

```typescript
const PHRASE_TYPE_LABELS: Record<string, string> = {
  standard: 'Стандартные',
  withObjects: 'С объектами',
  withPronounObjects: 'С местоимениями-объектами',  // НОВОЕ
  questions: 'Вопросительные',
};
```

3. Обновить логику фильтрации в `useEffect`:

```typescript
if (selectedTypes.includes('withPronounObjects')) {
  filteredPhrases.push(...lesson2PhrasesWithPronounObjects);
}
```

4. Обновить тип `selectedTypes`:

```typescript
const [selectedTypes, setSelectedTypes] = useState<string[]>(['standard', 'withObjects', 'withPronounObjects', 'questions']);
```

### Шаг 9: Обновить экспорт и импорты

**Файл:** `src/data/lesson2/phrases.ts`

Экспортировать новый массив:

```typescript
export {
  lesson2Phrases,
  lesson2PhrasesWithObjects,
  lesson2PhrasesWithPronounObjects,  // НОВОЕ
  lesson2QuestionPhrases,
  lesson2WordGroups,
};
```

**Файл:** `src/pages/PhrasesPage.tsx`

Импортировать новый массив:

```typescript
import {
  lesson2WordGroups,
  lesson2Phrases,
  lesson2PhrasesWithObjects,
  lesson2PhrasesWithPronounObjects,  // НОВОЕ
  lesson2QuestionPhrases,
} from '../data/lesson2/phrases';
```

### Шаг 10: Тестирование

1. Запустить dev-сервер: `npm run dev`
2. Перейти на `http://localhost:5173/lesson/2/phrases`
3. Убедиться что:
   - Появился новый чекбокс "С местоимениями-объектами"
   - Предложения генерируются правильно
   - Структура предложений верная (3 элемента: подлежащее, глагол, дополнение)
   - Перевод на русский корректный
   - Транскрипция отображается правильно

## Технические детали

### Структура нового паттерна

Пример для "Я вижу тебя":

```typescript
{
  id: 'pop2-1',
  russian: 'Я (жен.) вижу тебя',
  thai: 'ฉันเห็นคุณ',
  transcription: 'chǎn hěn kun',
  structure: [
    { groupId: 'subject', thai: 'ฉัน', transcription: 'chǎn' },
    { groupId: 'verb', thai: 'เห็น', transcription: 'hěn' },
    { groupId: 'objectPronoun', thai: 'คุณ', transcription: 'kun' },
  ],
  lessonId: 2,
}
```

### Оценка объёма данных

- 5 местоимений из урока 2 (подлежащие)
- ~15-20 транзитивных глаголов
- 10+ местоимений-дополнений (из обоих уроков)
- 8 паттернов

Примерное количество: 5 × 15 × 10 × 8 = **6000 предложений**

Это приемлемо для тренировки.

## Потенциальные проблемы и решения

### 1. Дубликаты местоимений

Одни и те же слова используются и как подлежащее, и как дополнение. Нужно убедиться что UI корректно отображает обе роли.

**Решение:** Использовать отдельную группу `objectPronoun` в `wordGroups`.

### 2. Многозначные местоимения

Местоимение `เขา` означает и "он", и "она". `คุณ` — "ты" и "вы".

**Решение:** В `objectPronouns` созданы отдельные записи для каждого значения:
```typescript
{ thai: 'เขา', russian: 'он', russianAccusative: 'его' },
{ thai: 'เขา', russian: 'она', russianAccusative: 'её' },
```

### 3. Совместимость глаголов и местоимений

Некоторые глаголы могут некорректно сочетаться с определёнными местоимениями.

**Решение:** Отфильтрованы глаголы, которые естественно работают с людьми как дополнениями:
- Видеть, любить, знать, встречать, давать и т.д.
- Исключены глаголы типа "открывать дверь", "резать стол"

### 4. Неправильные переводы дополнений

Проблема: "Я (жен., форм.) сейчас помогаю его/это" — некорректный перевод.

**Решение:** В `russianAccusative` используются чёткие формы без слэша:
- 'меня', 'тебя', 'его', 'её', 'нас', 'вас', 'их'
- Для многозначных местоимений созданы отдельные записи

## Файлы для изменения (итого)

1. `src/data/types.ts` — добавить 8 новых SentenceType
2. `src/data/phrasePatterns.ts` — добавить интерфейс и массив паттернов
3. `src/data/phraseGenerator.ts` — добавить функцию генерации
4. `src/data/vocabulary/lessons/lesson1.ts` — определить объект-местоимения (если нужно)
5. `src/data/lesson2/phrases.ts` — создать массив фраз, обновить wordGroups
6. `src/data/lesson2/phrases.ts` — экспортировать новый массив
7. `src/pages/PhrasesPage.tsx` — добавить чекбокс и логику фильтрации
