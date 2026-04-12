# Daily Tasks System - Architecture Reference for Thai Language App

## Overview

This document describes the daily tasks mechanics implemented in the `feelingGood` project. The goal is to provide a complete reference for implementing a similar system in the Thai language learning app.

---

## Core Concept

The **Daily Tasks** system provides users with a structured set of activities to complete each day, tracking progress against time-based goals and showing historical performance.

---

## Architecture

### 1. Main Component: `TodayTasks.tsx`

**Location:** `feelingGood/src/components/TodayTasks/TodayTasks.tsx`

**Purpose:** Central hub that aggregates all daily activities into categorized tasks with progress tracking.

**Key Features:**
- Displays tasks organized by category tabs (Reading, Self-esteem, Procrastination, etc.)
- Tracks time spent on each activity type
- Shows completion status with checkboxes
- Integrates test/survey scheduling with automatic intervals
- Displays historical progress bars and trend charts

**Structure:**
```
TodayTasks
├── FavoritesComponent (quick access to saved activities)
├── Tab Navigation
│   ├── Reading & Self-assessment
│   ├── Beliefs
│   ├── Procrastination
│   └── Loneliness
└── Each Tab Contains:
    ├── ReadingTaskComponent (daily reading goal)
    ├── MethodsTaskComponent (practice time goals)
    ├── TestTaskComponent (periodic assessments)
    ├── ActivityHistoryBar (7-day progress)
    └── TrendChart (mood/score progression)
```

---

### 2. Task Components

#### A. `ReadingTaskComponent.tsx` - Daily Reading Goal

**Purpose:** Track daily reading progress with a time-based goal.

**Logic:**
```typescript
// Constants
const READING_GOAL_SECONDS = 300; // 5 minutes

// Find first unread chapter
const findFirstUnreadChapter = () => {
  // Skip intro chapters
  // Find first unlocked & incomplete chapter/section
  return chapter;
};

// Calculate total reading time today
const getTotalReadingTime = () => {
  return Object.values(todayProgress.chapters)
    .reduce((total, chapter) => total + chapter.timeSpent, 0);
};

// Goal achievement
const readingGoalAchieved = totalReadingTime >= readingGoalSeconds;
```

**UI Elements:**
- Checkbox (auto-checked when goal met)
- Current reading time display
- Remaining time to goal
- "Continue reading" link (clickable until goal achieved)

**Adaptation for Thai App:**
```typescript
// Thai language version
const THAI_READING_GOAL_SECONDS = 300; // 5 min daily reading
const THAI_VOCAB_GOAL = 10; // 10 new words per day
const THAI_PRACTICE_GOAL = 900; // 15 min practice

// Find next unread lesson/word list
const findNextThaiLesson = () => {
  // Return first incomplete lesson
};
```

---

#### B. `MethodsTaskComponent.tsx` - Practice Time Goals

**Purpose:** Track time spent on specific practice activities.

**Interface:**
```typescript
interface MethodsTask {
  id: string;
  title: string;
  description: string;
  goalSeconds: number;        // Target time (e.g., 900 = 15 min)
  methodIds: {               // Related activities
    id: string;
    name: string;
  }[];
  totalTime: number;          // Actual time spent today
}
```

**Logic:**
```typescript
const goalAchieved = task.totalTime >= task.goalSeconds;

// Auto-opens first method when clicked (if goal not met)
onClick={!goalAchieved ? () => onActivityClick(task.methodIds[0].id) : undefined}
```

**Examples from feelingGood:**
```typescript
// Self-esteem task
const selfEsteemTask: MethodsTask = {
  id: 'self-esteem',
  title: 'Work on Self-esteem',
  description: 'Practice three-column method or thought diary (min 15 min)',
  goalSeconds: 900,  // 15 minutes
  methodIds: [
    { id: 'three-columns', name: 'three-column method' },
    { id: 'thought-diary', name: 'thought diary' }
  ],
  totalTime: totalMethodsTime  // Sum of time spent on both methods
};

// Procrastination task
const procrastinationTask: MethodsTask = {
  id: 'procrastination',
  goalSeconds: 900,
  methodIds: [
    { id: 'self-activation', name: 'self-activation methods' }
  ],
  totalTime: totalProcrastinationTime  // Sum of 14 different activities
};
```

**Adaptation for Thai App:**
```typescript
// Vocabulary task
const vocabularyTask: MethodsTask = {
  id: 'vocabulary',
  title: 'Vocabulary Practice',
  description: 'Practice new words and phrases (min 15 min)',
  goalSeconds: 900,
  methodIds: [
    { id: 'flashcards', name: 'flashcards' },
    { id: 'word-exercises', name: 'word exercises' }
  ],
  totalTime: totalVocabTime
};

// Grammar task
const grammarTask: MethodsTask = {
  id: 'grammar',
  title: 'Grammar Practice',
  description: 'Complete grammar exercises (min 15 min)',
  goalSeconds: 900,
  methodIds: [
    { id: 'grammar-lesson', name: 'grammar lesson' },
    { id: 'grammar-exercises', name: 'grammar exercises' }
  ],
  totalTime: totalGrammarTime
};
```

---

#### C. `TestTaskComponent.tsx` - Periodic Assessments

**Purpose:** Schedule and track periodic tests/surveys with automatic intervals.

**Test Status Logic:**
```typescript
interface TestStatusConfig {
  id: string;
  testId: ActivityId;
  title: string;
  firstTimeMessage: string;          // "Take the test"
  retakeMessage: string;             // "Retake the test"
  retakeSecondMessage: string;       // "Retake the test (second time)"
  waitMessagePrefix: string;         // "Next test in"
  buttonText: string;
  intervalDays: number;              // Days between tests
  defaultMaxScore: number;
}

function checkTestStatus(config, testResults, availableActivities) {
  // If test not available -> return null
  
  // If never taken -> show "Take test" message
  if (testResults.length === 0) {
    return { needToComplete: true, message: firstTimeMessage };
  }
  
  // If interval passed -> show "Retake test" message
  const daysSince = getDaysDifference(today, latest.completedAt);
  if (daysSince >= intervalDays) {
    return { needToComplete: true, message: retakeMessage };
  }
  
  // If waiting -> show countdown
  return {
    needToComplete: false,
    message: waitMessagePrefix + (intervalDays - daysSince) + ' days'
  };
}
```

**Examples:**
```typescript
// Burns Checklist - weekly
const burnsStatus = checkTestStatus({
  id: 'daily-mood',
  testId: ACTIVITY_IDS.BURNS_CHECKLIST,
  title: 'Burns Depression Checklist',
  intervalDays: 7,  // Weekly
  defaultMaxScore: 100,
}, burnsTestResults, availableActivities);

// Procrastination Scale - weekly
const procrastinationScaleStatus = checkTestStatus({
  id: 'procrastination-scale',
  testId: ACTIVITY_IDS.PROCRASTINATION_SCALE,
  intervalDays: 7,
  defaultMaxScore: 45,
}, procrastinationTestResults, availableActivities);

// DAS Scale - biweekly
const dasStatus = checkExerciseTestStatus({
  id: 'das-scale',
  testId: ACTIVITY_IDS.DYSFUNCTIONAL_ATTITUDE_SCALE,
  intervalDays: 14,  // Every 2 weeks
}, dasExercises, availableActivities);
```

**Adaptation for Thai App:**
```typescript
// Thai vocabulary test - weekly
const thaiVocabTestStatus = checkTestStatus({
  id: 'thai-vocab-test',
  testId: ACTIVITY_IDS.VOCABULARY_TEST,
  title: 'Vocabulary Assessment',
  firstTimeMessage: 'Take vocabulary test',
  retakeMessage: 'Retake vocabulary test',
  waitMessagePrefix: 'Next test in',
  buttonText: 'Open test',
  intervalDays: 7,
  defaultMaxScore: 50,
}, vocabTestResults, availableActivities);

// Thai grammar test - biweekly
const thaiGrammarTestStatus = checkTestStatus({
  id: 'thai-grammar-test',
  testId: ACTIVITY_IDS.GRAMMAR_TEST,
  title: 'Grammar Assessment',
  intervalDays: 14,
  defaultMaxScore: 100,
}, grammarTestResults, availableActivities);

// Thai listening test - monthly
const thaiListeningTestStatus = checkTestStatus({
  id: 'thai-listening-test',
  testId: ACTIVITY_IDS.LISTENING_TEST,
  title: 'Listening Comprehension',
  intervalDays: 30,
  defaultMaxScore: 100,
}, listeningTestResults, availableActivities);
```

---

### 3. History & Progress Components

#### A. `ActivityHistoryBar.tsx` - 7-Day Progress Visualization

**Purpose:** Show activity completion over the last 7 days with goal indicators.

**Features:**
- Displays 7-day bar chart
- Shows time spent vs goal for each day
- Indicates test completions with score badges
- Highlights days when goals were met

**Data Structure:**
```typescript
interface DayProgress {
  date: string;
  timeSpent: number;
  goalSeconds: number;
  goalAchieved: boolean;
  testCompleted?: {
    activityId: string;
    score?: number;
    maxScore?: number;
  };
}
```

**Adaptation for Thai App:**
```typescript
// Reading history
<ActivityHistoryBar
  goalSeconds={THAI_READING_GOAL_SECONDS}
  config={{
    title: "Reading Progress",
    emptyHistoryText: "No reading history yet",
    activityIds: [
      ACTIVITY_IDS.LESSON_1,
      ACTIVITY_IDS.LESSON_2,
      ACTIVITY_IDS.READING_PRACTICE
    ],
    testActivityId: ACTIVITY_IDS.VOCABULARY_TEST,
    testScoreBadgeLabel: "test"
  }}
/>

// Vocabulary practice history
<ActivityHistoryBar
  goalSeconds={THAI_VOCAB_PRACTICE_GOAL}
  config={{
    title: "Vocabulary Practice",
    activityIds: [
      ACTIVITY_IDS.FLASHCARDS,
      ACTIVITY_IDS.WORD_EXERCISES,
      ACTIVITY_IDS.WRITING_PRACTICE
    ],
    testActivityId: ACTIVITY_IDS.VOCABULARY_TEST,
    testScoreBadgeLabel: "vocab test"
  }}
/>
```

---

#### B. `ReadingHistoryBar.tsx` - Reading-Specific Progress

**Purpose:** Specialized history bar for reading progress with chapter completion tracking.

**Features:**
- Shows daily reading time
- Displays chapters read
- Links to completed content

---

### 4. Trend Chart Components

**Purpose:** Visualize score progression over time for periodic tests.

**Examples:**
```typescript
// Mood trend (from Burns Checklist scores)
{burnsTestResults.length > 0 && (
  <div className={styles.moodTrendSection}>
    <MoodTrendChart height={350} showStats={true} />
  </div>
)}

// DAS trend (dysfunctional beliefs)
{dasExercises.length > 0 && (
  <div className={styles.dasTrendSection}>
    <DASTrendChart height={350} showStats={true} />
  </div>
)}
```

**Adaptation for Thai App:**
```typescript
// Vocabulary score trend
{vocabTestResults.length > 0 && (
  <div className={styles.vocabTrendSection}>
    <VocabTrendChart height={350} showStats={true} />
  </div>
)}

// Grammar proficiency trend
{grammarTestResults.length > 0 && (
  <div className={styles.grammarTrendSection}>
    <GrammarTrendChart height={350} showStats={true} />
  </div>
)}

// Listening comprehension trend
{listeningTestResults.length > 0 && (
  <div className={styles.listeningTrendSection}>
    <ListeningTrendChart height={350} showStats={true} />
  </div>
)}
```

---

## Time Tracking Implementation

### How Time Is Tracked

**Redux State Structure:**
```typescript
dailyProgress: {
  "2024-04-06": {
    chapters: {
      "lesson-1": {
        timeSpent: 300,        // seconds
        completed: false,
        lastPosition: 0,
        completedAt: "ISO timestamp"
      }
    },
    activities: {
      "flashcards": {
        timeSpent: 600,
        completedAt: "ISO timestamp"
      }
    },
    exercises: {
      testResults: [...],
      exercises: [...]
    }
  }
}
```

**Time Aggregation:**
```typescript
// Sum time for specific activities
const totalMethodsTime = 
  (todayProgress[ACTIVITY_IDS.THREE_COLUMNS_METHOD]?.timeSpent || 0) +
  (todayProgress[ACTIVITY_IDS.THOUGHT_DIARY]?.timeSpent || 0);

// Sum time for multiple activities (procrastination)
const totalProcrastinationTime = Object.entries(todayProgress)
  .filter(([key]) => PROCRASTINATION_ACTIVITY_IDS.includes(key))
  .reduce((total, [, data]) => total + (data?.timeSpent || 0), 0);
```

**Adaptation for Thai App:**
```typescript
// Track reading time
const totalReadingTime = Object.values(todayProgress.chapters)
  .reduce((total, chapter) => total + chapter.timeSpent, 0);

// Track vocabulary practice time
const VOCAB_ACTIVITY_IDS = [
  ACTIVITY_IDS.FLASHCARDS,
  ACTIVITY_IDS.WORD_EXERCISES,
  ACTIVITY_IDS.WRITING_PRACTICE
];

const totalVocabTime = Object.entries(todayProgress)
  .filter(([key]) => VOCAB_ACTIVITY_IDS.includes(key))
  .reduce((total, [, data]) => total + (data?.timeSpent || 0), 0);

// Track grammar practice time
const GRAMMAR_ACTIVITY_IDS = [
  ACTIVITY_IDS.GRAMMAR_LESSON,
  ACTIVITY_IDS.GRAMMAR_EXERCISES,
  ACTIVITY_IDS.SENTENCE_BUILDING
];

const totalGrammarTime = Object.entries(todayProgress)
  .filter(([key]) => GRAMMAR_ACTIVITY_IDS.includes(key))
  .reduce((total, [, data]) => total + (data?.timeSpent || 0), 0);
```

---

## Tab Navigation Pattern

**Current Implementation:**
```typescript
const [activeTab, setActiveTab] = useState<'reading' | 'beliefs' | 'procrastination' | 'loneliness'>('reading');

<div className={styles.tasksTabs}>
  <button
    className={activeTab === 'reading' ? styles.tasksTabActive : styles.tasksTab}
    onClick={() => setActiveTab('reading')}
  >
    Reading & Self-assessment
  </button>
  <button
    className={activeTab === 'beliefs' ? styles.tasksTabActive : styles.tasksTab}
    onClick={() => setActiveTab('beliefs')}
  >
    Beliefs
  </button>
  // ... more tabs
</div>

<div className={styles.tasksList}>
  {activeTab === 'reading' && renderReadingTab()}
  {activeTab === 'beliefs' && renderBeliefsTab()}
  // ... more content
</div>
```

**Adaptation for Thai App:**
```typescript
type TabType = 'reading' | 'vocabulary' | 'grammar' | 'listening' | 'culture';

const [activeTab, setActiveTab] = useState<TabType>('reading');

<div className={styles.tasksTabs}>
  <button onClick={() => setActiveTab('reading')}>Reading</button>
  <button onClick={() => setActiveTab('vocabulary')}>Vocabulary</button>
  <button onClick={() => setActiveTab('grammar')}>Grammar</button>
  <button onClick={() => setActiveTab('listening')}>Listening</button>
  <button onClick={() => setActiveTab('culture')}>Culture</button>
</div>
```

---

## Goal Constants

**From feelingGood:**
```typescript
const READING_GOAL_SECONDS = 300;           // 5 minutes
const METHODS_GOAL_SECONDS = 900;           // 15 minutes
const PROCRASTINATION_GOAL_SECONDS = 900;   // 15 minutes
const BURNS_TEST_INTERVAL_DAYS = 7;         // Weekly
const PROCRASTINATION_TEST_INTERVAL_DAYS = 7;
const DAS_TEST_INTERVAL_DAYS = 14;          // Biweekly
const LONELINESS_TEST_INTERVAL_DAYS = 14;
const INTIMACY_TEST_INTERVAL_DAYS = 14;
```

**Suggested for Thai App:**
```typescript
// Daily time goals
const THAI_READING_GOAL_SECONDS = 300;          // 5 min reading
const THAI_VOCAB_PRACTICE_GOAL = 600;           // 10 min vocabulary
const THAI_GRAMMAR_PRACTICE_GOAL = 900;         // 15 min grammar
const THAI_LISTENING_PRACTICE_GOAL = 600;       // 10 min listening
const THAI_WRITING_PRACTICE_GOAL = 300;         // 5 min writing

// Test intervals
const THAI_VOCAB_TEST_INTERVAL_DAYS = 7;        // Weekly vocab test
const THAI_GRAMMAR_TEST_INTERVAL_DAYS = 14;     // Biweekly grammar test
const THAI_LISTENING_TEST_INTERVAL_DAYS = 14;   // Biweekly listening test
const THAI_PLACEMENT_TEST_INTERVAL_DAYS = 30;   // Monthly placement test

// Streak and achievement goals
const THAI_DAILY_STREAK_GOAL = 1;               // 1 activity per day for streak
const THAI_WEEKLY_STREAK_GOAL = 5;              // 5 days per week
```

---

## UI/UX Patterns

### Task Card Structure
```html
<div class="task clickable|completed">
  <div class="taskHeader">
    <div class="checkbox">
      <input type="checkbox" checked={goalAchieved} readOnly />
    </div>
    <span class="taskTitle">Task description</span>
  </div>
  <div class="taskProgress">
    <span class="timeSpent">Time spent: 10:25</span>
    {!goalAchieved && (
      <>
        <span class="remainingTime">Remaining: 4:35</span>
        <span class="openLink">Open activity</span>
      </>
    )}
  </div>
</div>
```

### CSS Styling (key patterns)
```css
.task {
  padding: 1rem;
  background: white;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.task.clickable {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.task.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.task.completed {
  opacity: 0.6;
}

.tasksTabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
}

.tasksTab {
  padding: 1rem 1.5rem;
  cursor: pointer;
  border: none;
  background: none;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tasksTab.active {
  border-bottom-color: #667eea;
  color: #667eea;
  font-weight: 600;
}
```

---

## Redux Selectors Used

```typescript
// Get today's progress
const todayProgress = useTodayProgress();

// Get exercises by type
const burnsTestResults = useTestsByType(ACTIVITY_IDS.BURNS_CHECKLIST);

// Get unlocked content
const unlockedContent = useUnlockedContent();

// Get completed chapters
const completedChapters = useCompletedChapters();

// Get exercises by type (for DAS, etc.)
const dasExercises = useExercisesByType(ACTIVITY_IDS.DYSFUNCTIONAL_ATTITUDE_SCALE);
```

**Adaptation for Thai App:**
```typescript
// Get today's Thai lesson progress
const todayThaiProgress = useTodayProgress();

// Get vocabulary test results
const vocabTestResults = useTestsByType(ACTIVITY_IDS.VOCABULARY_TEST);

// Get grammar test results
const grammarTestResults = useTestsByType(ACTIVITY_IDS.GRAMMAR_TEST);

// Get completed Thai lessons
const completedLessons = useCompletedChapters();

// Get unlocked Thai content
const unlockedThaiContent = useUnlockedContent();
```

---

## Implementation Checklist for Thai App

### Phase 1: Core Structure (Week 1-2)
- [ ] Create `TodayTasks.tsx` component
- [ ] Create tab navigation system
- [ ] Implement `ReadingTaskComponent` for Thai lessons
- [ ] Implement `MethodsTaskComponent` for practice activities
- [ ] Set up time tracking for activities

### Phase 2: Test Scheduling (Week 2-3)
- [ ] Create `TestTaskComponent` for periodic assessments
- [ ] Implement test status logic (first time, retake, waiting)
- [ ] Configure vocabulary test (weekly)
- [ ] Configure grammar test (biweekly)
- [ ] Configure listening test (biweekly)

### Phase 3: History & Trends (Week 3-4)
- [ ] Create `ActivityHistoryBar` component
- [ ] Create trend chart components (vocab, grammar, listening)
- [ ] Implement 7-day progress visualization
- [ ] Add score trend visualization

### Phase 4: Polish (Week 4-5)
- [ ] Add favorites component
- [ ] Implement streak tracking
- [ ] Add achievement badges
- [ ] Mobile responsiveness
- [ ] Animations and micro-interactions

---

## Key Differences to Consider

| Aspect | feelingGood (CBT) | Thai Language App |
|--------|-------------------|-------------------|
| **Content Type** | Chapters & exercises | Lessons & practice |
| **Goals** | Time-based (reading, methods) | Time-based + vocabulary count |
| **Tests** | Mood/psychological scales | Language proficiency tests |
| **Progress** | Mood improvement | Language proficiency |
| **Categories** | Self-esteem, procrastination, etc. | Reading, vocabulary, grammar, listening, culture |
| **Streaks** | Daily CBT practice | Daily language practice |

---

## Recommended Activity IDs for Thai App

```typescript
// Thai Language Activity Constants
export const THAI_ACTIVITY_IDS = {
  // Lessons
  LESSON_1: 'lesson-1',
  LESSON_2: 'lesson-2',
  // ... more lessons
  
  // Vocabulary
  FLASHCARDS: 'flashcards',
  WORD_EXERCISES: 'word-exercises',
  WRITING_PRACTICE: 'writing-practice',
  VOCABULARY_TEST: 'vocabulary-test',
  
  // Grammar
  GRAMMAR_LESSON: 'grammar-lesson',
  GRAMMAR_EXERCISES: 'grammar-exercises',
  SENTENCE_BUILDING: 'sentence-building',
  GRAMMAR_TEST: 'grammar-test',
  
  // Listening
  LISTENING_PRACTICE: 'listening-practice',
  DIALOGUE_EXERCISE: 'dialogue-exercise',
  LISTENING_TEST: 'listening-test',
  
  // Speaking
  PRONUNCIATION_PRACTICE: 'pronunciation-practice',
  CONVERSATION_SIMULATION: 'conversation-simulation',
  
  // Culture
  CULTURE_LESSON: 'culture-lesson',
  CULTURE_QUIZ: 'culture-quiz',
  
  // Placement
  PLACEMENT_TEST: 'placement-test',
} as const;
```

---

## Example: Complete Thai Daily Tasks Component

```typescript
const ThaiDailyTasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const unlockedContent = useUnlockedContent();
  
  const vocabTestResults = useTestsByType(THAI_ACTIVITY_IDS.VOCABULARY_TEST);
  const grammarTestResults = useTestsByType(THAI_ACTIVITY_IDS.GRAMMAR_TEST);
  const todayProgress = useTodayProgress();
  
  // Calculate time for each category
  const totalReadingTime = calculateReadingTime(todayProgress);
  const totalVocabTime = calculateVocabTime(todayProgress);
  const totalGrammarTime = calculateGrammarTime(todayProgress);
  
  // Create tasks
  const readingTask: MethodsTask = {
    id: 'thai-reading',
    title: 'Thai Reading',
    description: 'Read Thai lesson (min 5 min)',
    goalSeconds: 300,
    methodIds: [{ id: THAI_ACTIVITY_IDS.LESSON_1, name: 'current lesson' }],
    totalTime: totalReadingTime
  };
  
  const vocabTask: MethodsTask = {
    id: 'thai-vocab',
    title: 'Vocabulary Practice',
    description: 'Practice vocabulary (min 10 min)',
    goalSeconds: 600,
    methodIds: [
      { id: THAI_ACTIVITY_IDS.FLASHCARDS, name: 'flashcards' },
      { id: THAI_ACTIVITY_IDS.WORD_EXERCISES, name: 'word exercises' }
    ],
    totalTime: totalVocabTime
  };
  
  const grammarTask: MethodsTask = {
    id: 'thai-grammar',
    title: 'Grammar Practice',
    description: 'Practice grammar (min 15 min)',
    goalSeconds: 900,
    methodIds: [
      { id: THAI_ACTIVITY_IDS.GRAMMAR_LESSON, name: 'grammar lesson' },
      { id: THAI_ACTIVITY_IDS.GRAMMAR_EXERCISES, name: 'grammar exercises' }
    ],
    totalTime: totalGrammarTime
  };
  
  // Test statuses
  const vocabTestStatus = checkTestStatus({
    id: 'vocab-test',
    testId: THAI_ACTIVITY_IDS.VOCABULARY_TEST,
    title: 'Vocabulary Assessment',
    intervalDays: 7,
    // ... other config
  }, vocabTestResults, availableActivities);
  
  const grammarTestStatus = checkTestStatus({
    id: 'grammar-test',
    testId: THAI_ACTIVITY_IDS.GRAMMAR_TEST,
    title: 'Grammar Assessment',
    intervalDays: 14,
    // ... other config
  }, grammarTestResults, availableActivities);
  
  const [activeTab, setActiveTab] = useState<'reading' | 'vocabulary' | 'grammar'>('reading');
  
  return (
    <div className={styles.container}>
      <FavoritesComponent onActivityClick={handleActivityClick} />
      <h2 className={styles.todayTasksTitle}>Today's Thai Language Tasks</h2>
      
      <div className={styles.tasksTabs}>
        <button onClick={() => setActiveTab('reading')}>Reading</button>
        <button onClick={() => setActiveTab('vocabulary')}>Vocabulary</button>
        <button onClick={() => setActiveTab('grammar')}>Grammar</button>
      </div>
      
      <div className={styles.tasksList}>
        {activeTab === 'reading' && (
          <>
            <ReadingTaskComponent readingGoalSeconds={300} />
            <ActivityHistoryBar goalSeconds={300} config={readingHistoryConfig} />
          </>
        )}
        {activeTab === 'vocabulary' && (
          <>
            <MethodsTaskComponent task={vocabTask} onActivityClick={handleActivityClick} />
            {vocabTestStatus && <TestTaskComponent task={vocabTestStatus} onActivityClick={handleActivityClick} />}
            <ActivityHistoryBar goalSeconds={600} config={vocabHistoryConfig} />
            {vocabTestResults.length > 0 && <VocabTrendChart height={350} />}
          </>
        )}
        {activeTab === 'grammar' && (
          <>
            <MethodsTaskComponent task={grammarTask} onActivityClick={handleActivityClick} />
            {grammarTestStatus && <TestTaskComponent task={grammarTestStatus} onActivityClick={handleActivityClick} />}
            <ActivityHistoryBar goalSeconds={900} config={grammarHistoryConfig} />
            {grammarTestResults.length > 0 && <GrammarTrendChart height={350} />}
          </>
        )}
      </div>
    </div>
  );
};
```

---

## Next Steps

1. **Review this document** with the team
2. **Decide on activity categories** specific to Thai learning
3. **Define test types** and intervals
4. **Create component structure** based on patterns above
5. **Implement incrementally** following the checklist
6. **Test thoroughly** with real users

---

## References

- Original implementation: `feelingGood/src/components/TodayTasks/`
- Redux state: `feelingGood/src/redux/slices/progressSlice.ts`
- Activity constants: `feelingGood/src/constants/activities.ts`
- Date utilities: `feelingGood/src/utils/dateUtils.ts`
- Redux hooks: `feelingGood/src/redux/hooks.ts`

---

**Document Version:** 1.0  
**Created:** April 6, 2026  
**Purpose:** Reference for implementing daily tasks system in Thai language learning app
