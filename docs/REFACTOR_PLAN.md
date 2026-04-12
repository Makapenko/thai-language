# План рефакторинга: вынесение словаря и паттернов

## Цель
Разделить данные (слова) и логику (генератор фраз), чтобы:
- Уроки 2+ могли переиспользовать слова из предыдущих уроков
- Каждый файл словаря оставался маленьким (только новые слова урока)
- `phraseGenerator.ts` содержал только функции, без данных
- Система масштабировалась на 16–32+ уроков

---

## Текущее состояние (ДО)
```
src/data/
├── types.ts
├── phraseGenerator.ts          — функции + patterns[] + TENSE_MARKERS + ENDINGS
├── lesson1/
│   └── phrases.ts              — subjects, verbs, nouns, lesson1Phrases, lesson1WordGroups
└── lesson2/
    └── ...
```

## Целевое состояние (ПОСЛЕ) ✅ ВЫПОЛНЕНО
```
src/data/
├── types.ts
├── phraseGenerator.ts          — только функции ✅
├── phrasePatterns.ts           — patterns[], patternsWithObject[], Subject, Verb, Noun, TENSE_MARKERS, ENDINGS ✅
│
├── vocabulary/
│   ├── lessons/
│   │   ├── lesson1.ts          — pronouns, verbs, nouns, particles ✅ (данные скопированы руками)
│   │   └── lesson2.ts          — скелет для новых слов ✅
│   └── aggregate.ts            — getCumulativeVocab(upToLesson) ✅
│
├── lesson1/
│   └── phrases.ts              — импортирует из vocabulary, генерирует lesson1Phrases ✅
└── lesson2/
    └── ...
```

---

## Выполненные шаги

### ✅ Шаг 1: Создан `vocabulary/lessons/lesson1.ts`
- `pronouns` — 8 местоимений (скопировано из phrases.ts)
- `verbs` — 62 глагола (скопировано из phrases.ts)
- `nouns` — 6 существительных (скопировано из phrases.ts)
- `particles` — 8 частиц (создано автоматически)
- `lesson1Vocab` — экспорт для aggregate.ts

### ✅ Шаг 2: Создан `phrasePatterns.ts`
- `Subject`, `Verb`, `Noun` — интерфейсы (перенесены)
- `TENSE_MARKERS` — частицы времени (перенесены)
- `ENDINGS` — окончания (перенесены)
- `patterns[]` — 10 шаблонов без объекта (перенесены)
- `patternsWithObject[]` — 8 шаблонов с объектом (перенесены)

### ✅ Шаг 3: Обновлён `phraseGenerator.ts`
- Удалены: `TENSE_MARKERS`, `ENDINGS`, `patterns[]`, `patternsWithObject[]`, `Subject`, `Verb`, `Noun`, `getPastForm`, `getSubjectLabel`
- Импортирует из `phrasePatterns.ts`
- Реэкспортирует `Subject`, `Verb`, `Noun`, `TENSE_MARKERS`, `ENDINGS`, `patterns`, `patternsWithObject` для обратной совместимости
- Оставлены только функции: `generatePhrases()`, `generatePhrasesWithObjects()`, `shufflePhrases()`, `selectPhrases()`

### ✅ Шаг 4: Обновлён `lesson1/phrases.ts`
- Импортирует `pronouns`, `verbs`, `nouns` из `vocabulary/lessons/lesson1.ts`
- Импортирует `generatePhrases`, `generatePhrasesWithObjects` из `phraseGenerator.ts`
- Содержит только вызовы генерации и `lesson1WordGroups`
- Удалены дубликаты `subjects`, `verbs`, `nouns`

### ✅ Шаг 5: Создан `vocabulary/lessons/lesson2.ts` (скелет)
- `pronouns: []` — готовы для новых местоимений
- `questionWords: []` — готовы для вопросительных слов
- `particles: []` — готовы для вежливых частиц
- `lesson2Vocab` — экспорт для aggregate.ts

### ✅ Шаг 6: Проверка компиляции
- `npx tsc --noEmit` — **0 ошибок**

---

## Что НЕ менялось
- `PhrasesPage.tsx` — импортирует `lesson1Phrases` как раньше
- `types.ts` — типы остаются
- `lesson1/words.ts`, `lesson1/theory.ts` — не тронуты
- Логика упражнений — не тронута

---

## Следующие шаги (для урока 2)
1. Заполнить `vocabulary/lessons/lesson2.ts` реальными данными (местоимения, вопросительные слова, частицы)
2. Создать `lesson2/phrases.ts` с использованием `getCumulativeVocab(2)` + новые patterns для вопросов
3. Добавить новые pattern types в `phrasePatterns.ts` для вопросительных предложений
