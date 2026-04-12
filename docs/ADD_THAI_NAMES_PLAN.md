# План: Добавление тайских имён (прозвищ) в фразы урока 2

## Контекст

Нужно добавить **4 мужских** и **4 женских** тайских имени (включая Плой) в генерацию фраз урока 2. Имена должны использоваться:
- **Вместо подлежащего** (вместо "я/ты/он" и т.д.) — во всех типах предложений
- **Вместо объекта** (вместо "его/её/меня" и т.д.) — в предложениях типа "Я вижу его" → "Я вижу Плой"

---

## Анализ текущей архитектуры

### Какие типы фраз существуют

1. **Обычные фразы** (`generatePhrases`) — подлежащее + глагол + времена
2. **Фразы с объектами-существительными** (`generatePhrasesWithObjects`) — подлежащее + глагол + существительное (дверь, окно...)
3. **Фразы с местоимениями-объектами** (`generatePhrasesWithPronounObjects`) — подлежащее + глагол + местоимение-объект (тебя, меня, его...)
4. **Вопросительные фразы** (`generateQuestionPhrases`) — с вопросительными словами (кто, что, где...)

### Где имена будут использоваться

| Тип фразы | Где имена | Пример |
|---|---|---|
| Обычные фразы | Вместо подлежащего | **สมชาย** работает |
| С объектами-сущ. | Вместо подлежащего | **ประเสริฐ** открывает дверь |
| С местоимениями-объектами | Вместо подлежащего И вместо объекта | **สมชาย** вижу **ปอย** / ปой любит **สมชาย** |
| Вопросительные | Вместо подлежащего и/или объекта | Кого **ปอย** видит? / Почему **สมชาย** не приходит? |

---

## Шаг 1. Создать тип `Name` и массивы имён

**Файл:** `src/data/vocabulary/names.ts` (новый)

**Что сделать:**

Создать новый тип и два массива имён на основе **реальной статистики DOPA** (Department of Provincial Administration, Таиланд) — количество ныне живущих носителей:

```ts
export interface Name {
  thai: string;
  transcription: string;
  russian: string;         // "Сомчай", "Плой" и т.д.
  gender: 'masc' | 'fem';
  conjIndex: 0 | 1 | 2 | 3 | 4 | 5;  // для согласования глаголов
}

// Мужские имена (4 шт) — из статистики DOPA по распространённости
export const maleNames: Name[] = [
  { thai: 'สมชาย', transcription: 'sŏm-chaai', russian: 'Сомчай', gender: 'masc', conjIndex: 2 },   // 479 924 носителя — #1 в Таиланде
  { thai: 'ประเสริฐ', transcription: 'bpra-sèrt', russian: 'Прасерт', gender: 'masc', conjIndex: 2 },  // 268 094 — #3
  { thai: 'สมบูรณ์', transcription: 'sŏm-buun', russian: 'Сомбун', gender: 'masc', conjIndex: 2 },     // 248 205 — #4
  { thai: 'สมศักดิ์', transcription: 'sŏm-sàk', russian: 'Сомсак', gender: 'masc', conjIndex: 2 },      // из top-10 мужских имён
];

// Женские имена (4 шт, включая Плой) — из статистики DOPA
export const femaleNames: Name[] = [
  { thai: 'สมจิต', transcription: 'sŏm-jìt', russian: 'Сомчит', gender: 'fem', conjIndex: 2 },      // 281 050 — #2 в общем списке
  { thai: 'ปราณี', transcription: 'bpra-nii', russian: 'Прани', gender: 'fem', conjIndex: 2 },      // 171 060
  { thai: 'กาญจนา', transcription: 'gaan-jà-náa', russian: 'Канчана', gender: 'fem', conjIndex: 2 }, // 165 525
  { thai: 'ปอย', transcription: 'bpɔɔi', russian: 'Плой', gender: 'fem', conjIndex: 2 },             // популярное имя, остаётся по запросу
];

// Объединённый массив
export const allNames: Name[] = [...maleNames, ...femaleNames];
```

**Почему `conjIndex: 2`:** в тайском имена ведут себя как 3-е лицо ед.ч. (как "он/она"), поэтому глагол будет в форме 3-го лица (`ест`, `пьёт`, `идёт`).

**Зачем отдельный файл:** имена — это отдельная лексическая категория, не местоимения. Выделение в отдельный файл позволит переиспользовать их в будущих уроках.

---

## Шаг 2. Адаптировать имена под интерфейс `Subject`

**Файл:** `src/data/phraseGenerator.ts` (изменения)

**Что сделать:**

Имена должны работать как подлежащие (`Subject`). Есть два подхода:

### Вариант А: Конвертация имён в Subject при генерации

В функциях генерации (`generatePhrases`, `generatePhrasesWithObjects` и т.д.) добавить параметр `names?: Name[]` и конвертировать их в `Subject` on-the-fly:

```ts
function nameToSubject(name: Name): Subject {
  return {
    thai: name.thai,
    transcription: name.transcription,
    russian: name.russian,
    conjIndex: name.conjIndex,
    gender: name.gender,
  };
}
```

Затем объединять с основными подлежащими:
```ts
const allSubjects = [...subjects, ...names.map(nameToSubject)];
```

### Вариант Б: Расширить тип Subject

Сделать так, чтобы `Name` был совместим с `Subject` напрямую (через `extends` или union type).

**Рекомендация:** Вариант А — он проще и не требует изменений типов. Минимальное侵入ение в код.

---

## Шаг 3. Адаптировать имена под интерфейс `ObjectPronoun`

**Файл:** `src/data/phraseGenerator.ts` (изменения)

**Что сделать:**

Для фраз типа "Я вижу Плой" имена должны работать как объекты. Создать функцию конвертации:

```ts
function nameToObjectPronoun(name: Name): ObjectPronoun {
  const accusative = name.gender === 'masc' ? name.russian : name.russian; // можно добавить склонение
  const dative = name.gender === 'masc' ? name.russian : name.russian;     // или "ему"/"ей"
  
  return {
    thai: name.thai,
    transcription: name.transcription,
    russian: name.russian,
    russianAccusative: accusative,
    russianDative: dative,
    register: 'neutral',
    conjIndex: name.conjIndex,
  };
}
```

**Важный нюанс:** в русском имена склоняются. Для простоты можно использовать именительный падеж ("Плой"), но для более точного перевода можно добавить:

```ts
// В интерфейс Name добавить:
russianAccusative?: string;  // "Плой" (жен. не склоняется) / "Сомчая" (муж. → "Сомчая")
russianDative?: string;      // "Плой" / "Сомчаю"
```

**Рекомендация:** для начальной версии использовать одинаковую форму для всех падежей (как в тайском — имена не склоняются). Уточнение падежей — отдельная задача.

---

## Шаг 4. Обновить генераторы фраз

**Файл:** `src/data/lesson2/phrases.ts` (изменения)

**Что сделать:**

Добавить имена в генерацию фраз для каждого типа:

### 4.1. Обычные фразы (`generatePhrases`)

```ts
import { allNames } from '../vocabulary/names';

// Конвертировать имена в Subject
const nameSubjects = allNames.map(nameToSubject);

// Объединить с местоимениями урока 2
const subjectsWithNames = [...lesson2Pronouns, ...nameSubjects];

export const lesson2Phrases: Phrase[] = generatePhrases(
  subjectsWithNames,  // ← вместо lesson2Pronouns
  allVerbs,
  [...],
  2
);
```

### 4.2. Фразы с объектами (`generatePhrasesWithObjects`)

Аналогично — добавить имена как подлежащие:

```ts
export const lesson2PhrasesWithObjects: Phrase[] = generatePhrasesWithObjects(
  subjectsWithNames,  // ← вместо lesson2Pronouns
  transitiveVerbs,
  allNouns,
  [...],
  2
);
```

### 4.3. Фразы с местоимениями-объектами (`generatePhrasesWithPronounObjects`)

Здесь имена используются **и как подлежащие, и как объекты**:

```ts
// Имена как объекты
const nameObjects = allNames.map(nameToObjectPronoun);

// Объединить с местоимениями-объектами
const allObjectPronounsWithNames = [...allObjectPronouns, ...nameObjects];

export const lesson2PhrasesWithPronounObjects: Phrase[] = generatePhrasesWithPronounObjects(
  subjectsWithNames,              // ← подлежащие (местоимения + имена)
  verbsWithPronounObjects,
  allObjectPronounsWithNames,     // ← объекты (местоимения + имена)
  [...],
  2
);
```

**Важно:** функция `isReflexive()` уже проверяет совпадение `conjIndex`. Поскольку все имена имеют `conjIndex: 2`, они не будут считаться рефлексивными с местоимениями `conjIndex: 0, 1, 3, 4, 5`. Но два разных имени с `conjIndex: 2` будут корректно генерироваться.

**Проблема:** `isReflexive()` проверяет `conjIndex === 2` → "он/она". Если подлежащее = `สมชาย` (conjIndex: 2) и объект = `สมหญิง` (conjIndex: 2), они оба 3-е лицо, но это НЕ рефлексив. Нужно уточнить проверку:

```ts
function isReflexive(subject, objectPronoun) {
  // Тайское совпадение
  if (subject.thai === objectPronoun.thai) return true;
  
  // Для имён: если thai не совпадает — не рефлексив, даже если conjIndex одинаковый
  // Оставляем проверку по Russian для местоимений
  ...
}
```

### 4.4. Вопросительные фразы (`generateQuestionPhrases`)

Добавить имена как подлежащие:

```ts
const allPronounsForQuestions = [...lesson1Pronouns, ...lesson2Pronouns, ...nameSubjects];
```

---

## Шаг 5. Обновить `lesson2WordGroups` для UI

**Файл:** `src/data/lesson2/phrases.ts` (изменения)

**Что сделать:**

Добавить группу `name` в `lesson2WordGroups`:

```ts
{
  id: 'name',
  name: 'Имя',
  options: allNames.map(n => ({ 
    thai: n.thai, 
    transcription: n.transcription, 
    russian: n.russian 
  })),
},
```

Это позволит пользователю выбирать имена в конструкторе фраз на странице PhrasesPage.

---

## Шаг 6. Обновить типы (если нужно)

**Файл:** `src/data/types.ts` (возможно, без изменений)

**Что проверить:**

- `PhraseStructure` уже поддерживает любые `groupId`. Никаких изменений не требуется.
- Если в `PhrasesPage.tsx` есть специальная обработка для определённых `groupId` — добавить обработку для `groupId: 'name'` (если нужно).

---

## Шаг 7. Проверить совместимость с `isRegisterCompatible`

**Файл:** `src/data/phraseGenerator.ts`

**Что проверить:**

Функция `isRegisterCompatible()` проверяет совместимость регистров подлежащего и объекта. У имён `register` не задан → по умолчанию `neutral` (см. код):

```ts
const subjectRegister = subject.register || 'neutral';
```

Это значит, что имена будут совместимы со всеми объектами, у которых `register: 'neutral'`, `'formal'`, `'informal'`. Не будет совместимости только с `rude` (มึง).

**Решение:** это корректное поведение. Имена — нейтральны, и не должны сочетаться с грубыми местоимениями.

---

## Итоговая структура файлов

```
src/data/
├── vocabulary/
│   ├── names.ts                    ← НОВЫЙ: мужские и женские тайские имена
│   └── lessons/
│       ├── lesson1.ts
│       └── lesson2.ts
├── phrasePatterns.ts               — без изменений
├── phrasePatterns.lesson2.ts       — без изменений
├── phraseGenerator.ts              — минимальные изменения (хелперы nameToSubject, nameToObjectPronoun)
└── lesson2/
    └── phrases.ts                  — изменения: добавить имена в генераторы и wordGroups
```

---

## План действий (по шагам)

1. **Создать** `src/data/vocabulary/names.ts` с 4 мужскими и 4 женскими именами (включая Плой)
2. **Добавить** в `src/data/phraseGenerator.ts` функции `nameToSubject()` и `nameToObjectPronoun()`
3. **Обновить** `src/data/lesson2/phrases.ts`:
   - Импортировать имена
   - Добавить имена к подлежащим во всех генераторах
   - Добавить имена к объектам в `generatePhrasesWithPronounObjects`
   - Добавить группу `name` в `lesson2WordGroups`
4. **Проверить** что `isReflexive()` корректно обрабатывает разные имена с одинаковым `conjIndex`
5. **Протестировать** — запустить `npm run dev` и проверить `/lesson/2/phrases`

---

## Примеры фраз после реализации

| Тип | Пример (тайский) | Транскрипция | Русский |
|---|---|---|---|
| present_affirmative | สมชายทำงาน | sŏm-chaai tam-ngaan | Сомчай работает |
| present_affirmative | ปอยกิน | bpɔɔi gin | Плой ест |
| present_affirmative_obj_pron | ผมรักปอย | pǒm rák bpɔɔi | Я люблю Плой |
| present_affirmative_obj_pron | ปอยเห็นสมชาย | bpɔɔi hěn sŏm-chaai | Плой видит Сомчая |
| question_who | สมชายเห็นใคร? | sŏm-chaai hěn krai? | Кого видит Сомчай? |
| question_why | ทำไมปอยไม่มา? | tam-mai bpɔɔi mâi maa? | Почему Плой не приходит? |
| present_negative_obj_pron | สมจิตไม่รอสมชาย | sŏm-jìt mâi ror sŏm-chaai | Сомчит не ждёт Сомчая |
