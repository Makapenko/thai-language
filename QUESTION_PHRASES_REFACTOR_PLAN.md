# План: Рефакторинг генератора вопросительных фраз (Урок 2)

## Проблема

### 1. Все вопросительные слова комбинируются со всеми шаблонами
Сейчас `generateQuestionPhrases` делает **вложенный цикл** по всем вопросительным словам для каждого шаблона:

```
для каждого question_who, question_what, question_why...
  для каждого subject
    для каждого verb
      для каждого questionWord (Кто, Что, Почему, Где, Когда, Как)
        → генерировать фразу
```

Результат: `question_what` + "Почему" = **"Я приду Почему?"** — бессмыслица.

### 2. Неправильный порядок слов в русском переводе
Шаблоны копируют тайский порядок (вопросительное слово в конце), но русский перевод должен быть в русском порядке:

- Сейчас: `"Я приду Что?"`
- Должно: `"Что ты делаешь?"`

### 3. Тайское слово в русском шаблоне
`question_why` использует тайское `ไม่` в `russianTemplate`:
```ts
`${qw.russian} ${getSubjectLabel(s)} ไม่ ${v.present[s.conjIndex]}?`
```
Получается: `"Почему я ไม่ приду?"` — нужно русское "не".

### 4. Нет шаблона для "кто" как подлежащего
Есть только `question_who` (кто = дополнение: "Кого ты видишь?"), но нет "Кто приходит?" где `ใคร` — подлежащее.

---

## Решение

### Принцип тайских вопросительных слов

| Слово | Тайский | Позиция | Роль | Отрицание |
|-------|---------|---------|------|-----------|
| Кто (подлежащее) | ใคร | **в начале** | Подлежащее | Нет |
| Кто (дополнение) | ใคร | **в конце** | Дополнение | Нет |
| Что | อะไร | **в конце** | Дополнение | Нет |
| Где | ที่ไหน | **в конце** | Место | Нет |
| Когда | เมื่อไหร่ | **в конце** | Время | Нет |
| Почему | ทำไม | **в начале** | Причина | **Да (ไม่)** |
| Как | อย่างไร | **в конце** | Способ | Нет |

### Ключевое изменение

**Каждый шаблон привязан к КОНКРЕТНОМУ вопросительному слову**, а не ко всем сразу.

---

## Файлы для изменения

### 1. `src/data/types.ts`
Добавить новый тип:
```ts
| 'question_who_subject'    // ใครมา? — Кто приходит?
```

### 2. `src/data/phrasePatterns.lesson2.ts`
Полностью переработать:

#### а) Добавить `questionWordType` к каждому паттерну:
```ts
interface QuestionPattern {
  type: SentenceType;
  questionWordType: 'ใคร' | 'อะไร' | 'เมื่อไหร่' | 'ที่ไหน' | 'ทำไม' | 'อย่างไร';
  // ...
}
```

#### б) Добавить новый паттерн `question_who_subject`:
```ts
// question_who_subject: ใคร + verb — Кто приходит?
{
  type: 'question_who_subject',
  questionWordType: 'ใคร',
  russianTemplate: (s, v, qw) => `${qw.russian} ${v.present[s.conjIndex]}?`,
  buildStructure: (s, v, qw) => [
    { groupId: 'questionWord', thai: qw.thai, transcription: qw.transcription },
    { groupId: 'verb', thai: v.thai, transcription: v.transcription },
  ],
  // ...
}
```

#### в) Исправить `question_why` — заменить тайское `ไม่` на русское "не":
```ts
// Было:
russianTemplate: (s, v, qw) => `${qw.russian} ${getSubjectLabel(s)} ไม่ ${v.present[s.conjIndex]}?`

// Стало:
russianTemplate: (s, v, qw) => `${qw.russian} ${getSubjectLabel(s)} не ${v.present[s.conjIndex]}?`
```

#### г) Исправить русские шаблоны — правильный порядок слов:

| Шаблон | Было | Стало |
|--------|------|-------|
| `question_who` | `Я вижу Кто?` | `Кого ты видишь?` |
| `question_what` | `Я делаю Что?` | `Что ты делаешь?` |
| `question_when` | `Я поеду Когда?` | `Когда ты поедешь?` |
| `question_where` | `Я находится Где?` | `Где ты находишься?` |
| `question_why` | `Почему я ไม่ приду?` | `Почему ты не приходишь?` |
| `question_how` | `Я поеду Как?` | `Как ты поедешь?` |

### 3. `src/data/phraseGenerator.ts`
Изменить `generateQuestionPhrases`:

**Было:**
```ts
for (const pattern of selectedPatterns) {
  for (const subject of subjects) {
    for (const verb of verbs) {
      for (const qw of questionWords) {  // ← ВСЕ слова
```

**Стало:**
```ts
for (const pattern of selectedPatterns) {
  const filteredQWs = questionWords.filter(qw => 
    qw.thai === pattern.questionWordType  // ← Только своё слово
  );
  for (const subject of subjects) {
    for (const verb of verbs) {
      for (const qw of filteredQWs) {
```

### 4. `src/data/lesson2/phrases.ts`
Добавить `question_who_subject` в список типов:
```ts
export const lesson2QuestionPhrases: Phrase[] = generateQuestionPhrases(
  allPronounsForQuestions,
  selectVerbs,
  lesson2QuestionWords,
  [
    'question_who_subject',   // ← НОВОЕ
    'question_who',
    'question_what',
    'question_when',
    'question_where',
    'question_why',
    'question_how',
  ],
  2
);
```

---

## Ожидаемый результат

### Правильные фразы:

| Тайский | Русский |
|---------|---------|
| ใครมา? | Кто приходит? |
| คุณเห็นใคร? | Кого ты видишь? |
| คุณทำอะไร? | Что ты делаешь? |
| เขาไปเมื่อไหร่? | Когда он поедет? |
| เธออยู่ที่ไหน? | Где ты находишься? |
| ทำไมคุณไม่มา? | Почему ты не приходишь? |
| คุณจะไปอย่างไร? | Как ты поедешь? |

### Количество фраз:
- **Было:** 13 местоимений × 10 глаголов × 6 слов × 6 паттернов = **4 680**
- **Станет:** 13 местоимений × 10 глаголов × (1 слово × 7 паттернов) = **910**
  - `question_who_subject`: 13 × 10 × 1 = 130
  - `question_who`: 13 × 10 × 1 = 130
  - `question_what`: 13 × 10 × 1 = 130
  - `question_when`: 13 × 10 × 1 = 130
  - `question_where`: 13 × 10 × 1 = 130
  - `question_why`: 13 × 10 × 1 = 130
  - `question_how`: 13 × 10 × 1 = 130
