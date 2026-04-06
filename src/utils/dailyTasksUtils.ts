import { getDaysDifference, getCurrentDate } from './dateUtils';
import type { TestResult, ExerciseEntry } from '../features/progress/progressSlice';

// Test status interface
export interface TestStatus {
  id: string;
  testId: string;
  title: string;
  message: string;
  buttonText: string;
  needToComplete: boolean;
  lastScore: number | null;
  scorePercent: number | null;
  completedAt: string | null;
}

// Test status configuration
export interface TestStatusConfig {
  id: string;
  testId: string;
  title: string;
  firstTimeMessage: string;
  retakeMessage: string;
  retakeSecondMessage: string;
  waitMessagePrefix: string;
  buttonText: string;
  intervalDays: number;
  defaultMaxScore: number;
}

/**
 * Check test status and return appropriate message/state
 */
export function checkTestStatus(
  config: TestStatusConfig,
  testResults: TestResult[],
  availableActivities: Set<string>
): TestStatus | null {
  // If test not available, return null
  if (!availableActivities.has(config.testId)) {
    return null;
  }

  const base = {
    id: config.id,
    testId: config.testId,
    title: config.title,
    buttonText: config.buttonText,
  };

  // If never taken
  if (testResults.length === 0) {
    return {
      ...base,
      message: config.firstTimeMessage,
      needToComplete: true,
      lastScore: null,
      scorePercent: null,
      completedAt: null,
    };
  }

  const latest = testResults[0];
  const daysSince = getDaysDifference(
    new Date(getCurrentDate()),
    new Date(latest.completedAt)
  );
  const lastScore = latest.score ?? null;
  const maxScore = latest.maxScore || config.defaultMaxScore;
  const scorePercent = lastScore !== null ? Math.round((lastScore / maxScore) * 100) : null;

  // If interval passed - time to retake
  if (daysSince >= config.intervalDays) {
    return {
      ...base,
      message: testResults.length === 1 ? config.retakeSecondMessage : config.retakeMessage,
      needToComplete: true,
      lastScore,
      scorePercent,
      completedAt: latest.completedAt,
    };
  }

  // Still waiting
  return {
    ...base,
    message: `${config.waitMessagePrefix} ${config.intervalDays - daysSince} дн.`,
    needToComplete: false,
    lastScore,
    scorePercent,
    completedAt: latest.completedAt,
  };
}

// Exercise test status configuration
export interface ExerciseTestStatusConfig {
  id: string;
  testId: string;
  title: string;
  buttonText: string;
  intervalDays: number;
  firstTimeMessage: string;
  retakeMessage: string;
  retakeSecondMessage: string;
  waitMessagePrefix: string;
  getScore: (exercise: ExerciseEntry) => number | null;
  scoreToPercent: (score: number) => number;
}

/**
 * Check exercise test status (for exercises that act as tests)
 */
export function checkExerciseTestStatus(
  config: ExerciseTestStatusConfig,
  exercises: ExerciseEntry[],
  availableActivities: Set<string>
): TestStatus | null {
  if (!availableActivities.has(config.testId)) {
    return null;
  }

  const base = {
    id: config.id,
    testId: config.testId,
    title: config.title,
    buttonText: config.buttonText,
  };

  if (exercises.length === 0) {
    return {
      ...base,
      message: config.firstTimeMessage,
      needToComplete: true,
      lastScore: null,
      scorePercent: null,
      completedAt: null,
    };
  }

  const lastExercise = exercises[0];
  const completedAt = lastExercise.completedAt;
  const daysSince = getDaysDifference(new Date(getCurrentDate()), new Date(completedAt));
  const lastScore = config.getScore(lastExercise);
  const scorePercent = lastScore !== null ? config.scoreToPercent(lastScore) : null;

  if (daysSince >= config.intervalDays) {
    return {
      ...base,
      message: exercises.length === 1 ? config.retakeSecondMessage : config.retakeMessage,
      needToComplete: true,
      lastScore,
      scorePercent,
      completedAt,
    };
  }

  return {
    ...base,
    message: `${config.waitMessagePrefix} ${config.intervalDays - daysSince} дн.`,
    needToComplete: false,
    lastScore,
    scorePercent,
    completedAt,
  };
}

/**
 * Calculate total time spent on specific activities today
 */
export function calculateTotalTime(
  activitiesProgress: Record<string, { timeSpent: number }>,
  activityIds: string[]
): number {
  return activityIds.reduce((total, activityId) => {
    return total + (activitiesProgress[activityId]?.timeSpent || 0);
  }, 0);
}

/**
 * Get available activities based on unlocked content
 */
export function getAvailableActivities(unlockedChapters: string[]): Set<string> {
  return new Set(unlockedChapters);
}

/**
 * Format time for display
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
