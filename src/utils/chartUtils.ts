import { formatDateShort } from './dateUtils';
import type { DailyWordProgress } from '../features/words/wordsSlice';
import type { DailyPhraseProgress } from '../features/phrases/phrasesSlice';

export interface WordsChartData {
  name: string;
  date: string;
  timeSpent: number;
  wordsLearned: number;
}

export interface PhrasesChartData {
  name: string;
  date: string;
  timeSpent: number;
  correctPhrases: number;
}

/**
 * Get last N days of words progress data
 */
export function getWordsChartData(
  dailyProgress: Record<string, DailyWordProgress[]>,
  daysCount: number = 30
): WordsChartData[] {
  const data: WordsChartData[] = [];
  
  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayProgress: DailyWordProgress[] = dailyProgress[dateStr] || [];
    
    const timeSpent = dayProgress.reduce((total, lp) => total + lp.timeSpent, 0);
    const wordsLearned = dayProgress.reduce((total, lp) => total + lp.wordsLearned, 0);
    
    data.push({
      name: formatDateShort(dateStr),
      date: dateStr,
      timeSpent,
      wordsLearned,
    });
  }
  
  return data;
}

/**
 * Get last N days of phrases progress data
 */
export function getPhrasesChartData(
  dailyProgress: Record<string, DailyPhraseProgress[]>,
  daysCount: number = 30
): PhrasesChartData[] {
  const data: PhrasesChartData[] = [];
  
  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayProgress: DailyPhraseProgress[] = dailyProgress[dateStr] || [];
    
    const timeSpent = dayProgress.reduce((total, lp) => total + lp.timeSpent, 0);
    const correctPhrases = dayProgress.reduce((total, lp) => total + lp.correctPhrases, 0);
    
    data.push({
      name: formatDateShort(dateStr),
      date: dateStr,
      timeSpent,
      correctPhrases,
    });
  }
  
  return data;
}

/**
 * Format time in minutes for display
 */
export function formatMinutes(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} мин`;
}
