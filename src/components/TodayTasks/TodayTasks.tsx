import React, { useState } from 'react';
import styles from './TodayTasks.module.css';
import {
  useUnlockedContent,
  useTodayWordsStats,
  useTodayPhrasesStats,
} from '../../app/hooks';
import {
  THAI_ACTIVITY_IDS,
  DAILY_GOALS,
} from '../../constants/activities';
import { formatTimeFromSeconds } from '../../utils/dateUtils';
import FavoritesComponent from './FavoritesComponent';
import { WordsChart } from '../Charts/WordsChart';
import { PhrasesChart } from '../Charts/PhrasesChart';

interface TaskCardProps {
  title: string;
  icon: string;
  timeSpent: number;
  timeGoal: number;
  countValue: number;
  countGoal: number;
  countLabel: string;
  onNavigate: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  title,
  icon,
  timeSpent,
  timeGoal,
  countValue,
  countGoal,
  countLabel,
  onNavigate,
}) => {
  const timeGoalAchieved = timeSpent >= timeGoal;
  const countGoalAchieved = countValue >= countGoal;
  const allGoalsAchieved = timeGoalAchieved && countGoalAchieved;

  return (
    <div
      className={`${styles.taskCard} ${!allGoalsAchieved ? styles.clickable : ''}`}
      onClick={!allGoalsAchieved ? onNavigate : undefined}
    >
      <div className={styles.taskCardHeader}>
        <span className={styles.taskCardIcon}>{icon}</span>
        <h3 className={styles.taskCardTitle}>{title}</h3>
        <div className={styles.taskCardCheckbox}>
          <input
            type="checkbox"
            checked={allGoalsAchieved}
            readOnly
          />
        </div>
      </div>
      <div className={styles.taskCardStats}>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>⏱ Время:</span>
          <span className={styles.statValue}>
            {formatTimeFromSeconds(timeSpent)} / {formatTimeFromSeconds(timeGoal)}
          </span>
          {!timeGoalAchieved && (
            <span className={styles.statRemaining}>
              Осталось: {formatTimeFromSeconds(timeGoal - timeSpent)}
            </span>
          )}
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>✓ {countLabel}:</span>
          <span className={styles.statValue}>
            {countValue} / {countGoal}
          </span>
          {!countGoalAchieved && (
            <span className={styles.statRemaining}>
              Осталось: {countGoal - countValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const TodayTasks: React.FC = () => {
  const unlockedContent = useUnlockedContent();
  const wordsStats = useTodayWordsStats();
  const phrasesStats = useTodayPhrasesStats();

  const handleNavigateToWords = () => {
    // Navigate to first unlocked lesson's words page
    const firstUnlockedLesson = unlockedContent.chapters[0];
    if (firstUnlockedLesson) {
      const lessonId = firstUnlockedLesson.replace('lesson-', '');
      window.location.href = `/lesson/${lessonId}/words`;
    }
  };

  const handleNavigateToPhrases = () => {
    // Navigate to first unlocked lesson's phrases page
    const firstUnlockedLesson = unlockedContent.chapters[0];
    if (firstUnlockedLesson) {
      const lessonId = firstUnlockedLesson.replace('lesson-', '');
      window.location.href = `/lesson/${lessonId}/phrases`;
    }
  };

  const handleActivityClick = (activityId: string) => {
    if (activityId === THAI_ACTIVITY_IDS.WORD_EXERCISES) {
      handleNavigateToWords();
    } else if (activityId === THAI_ACTIVITY_IDS.PHRASE_EXERCISES) {
      handleNavigateToPhrases();
    }
    window.scrollTo(0, 0);
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'words' | 'phrases'>('overview');

  return (
    <div className={styles.container}>
      <FavoritesComponent onActivityClick={handleActivityClick} />

      <h2 className={styles.todayTasksTitle}>Задания на сегодня</h2>

      <div className={styles.tasksTabs}>
        <button
          className={`${styles.tasksTab} ${activeTab === 'overview' ? styles.tasksTabActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📋 Обзор
        </button>
        <button
          className={`${styles.tasksTab} ${activeTab === 'words' ? styles.tasksTabActive : ''}`}
          onClick={() => setActiveTab('words')}
        >
          📝 Слова
        </button>
        <button
          className={`${styles.tasksTab} ${activeTab === 'phrases' ? styles.tasksTabActive : ''}`}
          onClick={() => setActiveTab('phrases')}
        >
          💬 Фразы
        </button>
      </div>

      <div className={styles.tasksList}>
        {activeTab === 'overview' && (
          <>
            <TaskCard
              title="Слова"
              icon="📝"
              timeSpent={wordsStats.timeSpent}
              timeGoal={DAILY_GOALS.WORDS_TIME}
              countValue={wordsStats.wordsLearned}
              countGoal={DAILY_GOALS.WORDS_COUNT}
              countLabel="Выучено слов"
              onNavigate={handleNavigateToWords}
            />
            <TaskCard
              title="Фразы"
              icon="💬"
              timeSpent={phrasesStats.timeSpent}
              timeGoal={DAILY_GOALS.PHRASES_TIME}
              countValue={phrasesStats.correctPhrases}
              countGoal={DAILY_GOALS.PHRASES_COUNT}
              countLabel="Успешных фраз"
              onNavigate={handleNavigateToPhrases}
            />
          </>
        )}

        {activeTab === 'words' && (
          <>
            <TaskCard
              title="Слова"
              icon="📝"
              timeSpent={wordsStats.timeSpent}
              timeGoal={DAILY_GOALS.WORDS_TIME}
              countValue={wordsStats.wordsLearned}
              countGoal={DAILY_GOALS.WORDS_COUNT}
              countLabel="Выучено слов"
              onNavigate={handleNavigateToWords}
            />
            <div className={styles.chartSection}>
              <h4 className={styles.chartSectionTitle}>📈 Прогресс изучения слов за 7 дней</h4>
              <WordsChart height={300} />
            </div>
          </>
        )}

        {activeTab === 'phrases' && (
          <>
            <TaskCard
              title="Фразы"
              icon="💬"
              timeSpent={phrasesStats.timeSpent}
              timeGoal={DAILY_GOALS.PHRASES_TIME}
              countValue={phrasesStats.correctPhrases}
              countGoal={DAILY_GOALS.PHRASES_COUNT}
              countLabel="Успешных фраз"
              onNavigate={handleNavigateToPhrases}
            />
            <div className={styles.chartSection}>
              <h4 className={styles.chartSectionTitle}>📈 Прогресс изучения фраз за 7 дней</h4>
              <PhrasesChart height={300} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TodayTasks;
