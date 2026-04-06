import React from 'react';
import styles from './ProgressCalendar.module.css';
import { formatTimeFromSeconds } from '../../utils/dateUtils';
import { formatDateShort } from '../../utils/dateUtils';

interface LessonDayProgress {
  lessonId: number;
  wordsLearned?: number;
  wordsTimeSpent?: number;
  phrasesTimeSpent?: number;
  correctPhrases?: number;
  wrongPhrases?: number;
}

interface DayProgress {
  date: string;
  lessons: LessonDayProgress[];
  readingTime?: number;
}

interface DayDetailsProps {
  date: string;
  dayProgress: DayProgress;
  onClose: () => void;
}

interface TaskItem {
  lessonId: number;
  taskType: 'words' | 'phrases' | 'reading' | string;
  taskTitle: string;
  icon: string;
  stats: { label: string; value: string | number; className?: string }[];
  timeSpent?: number;
}

export const DayDetails: React.FC<DayDetailsProps> = ({ date, dayProgress, onClose }) => {
  const formattedDate = formatDateShort(date);

  // Build dynamic task list from lesson data
  const buildTasks = (): TaskItem[] => {
    const tasks: TaskItem[] = [];

    // Add word tasks for each lesson
    dayProgress.lessons.forEach(lesson => {
      if (lesson.wordsLearned !== undefined && lesson.wordsLearned > 0) {
        tasks.push({
          lessonId: lesson.lessonId,
          taskType: 'words',
          taskTitle: `Урок ${lesson.lessonId} — Новые слова`,
          icon: '📚',
          stats: [
            { label: 'Слов изучено', value: lesson.wordsLearned },
          ],
          timeSpent: lesson.wordsTimeSpent,
        });
      }

      if (lesson.correctPhrases !== undefined || (lesson.wrongPhrases !== undefined && lesson.wrongPhrases > 0)) {
        const totalPhrases = (lesson.correctPhrases || 0) + (lesson.wrongPhrases || 0);
        tasks.push({
          lessonId: lesson.lessonId,
          taskType: 'phrases',
          taskTitle: `Урок ${lesson.lessonId} — Составление фраз`,
          icon: '💬',
          stats: [
            { label: 'Всего фраз', value: totalPhrases },
            { label: 'Правильно', value: lesson.correctPhrases || 0, className: styles.statCorrect },
            ...(lesson.wrongPhrases !== undefined && lesson.wrongPhrases > 0
              ? [{ label: 'Неправильно', value: lesson.wrongPhrases, className: styles.statWrong }]
              : []),
          ],
          timeSpent: lesson.phrasesTimeSpent,
        });
      }
    });

    // Add reading task if present
    if (dayProgress.readingTime !== undefined && dayProgress.readingTime > 0) {
      tasks.push({
        lessonId: 0,
        taskType: 'reading',
        taskTitle: 'Теория',
        icon: '📖',
        stats: [
          { label: 'Время чтения', value: formatTimeFromSeconds(dayProgress.readingTime) },
        ],
      });
    }

    return tasks;
  };

  const tasks = buildTasks();

  return (
    <div className={styles.dayDetails} onClick={onClose}>
      <div className={styles.dayDetailsContent} onClick={e => e.stopPropagation()}>
        <div className={styles.dayDetailsHeader}>
          <h3 className={styles.dayDetailsTitle}>{formattedDate}</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {tasks.length === 0 ? (
          <p className={styles.emptyDayMessage}>В этот день занятий не было</p>
        ) : (
          <div className={styles.tasksList}>
            {tasks.map((task, index) => (
              <div key={`${task.lessonId}-${task.taskType}-${index}`} className={styles.taskCard}>
                <div className={styles.taskHeader}>
                  <span className={styles.taskIcon}>{task.icon}</span>
                  <h4 className={styles.taskTitle}>{task.taskTitle}</h4>
                </div>

                <div className={styles.taskStats}>
                  {task.stats.map((stat, statIndex) => (
                    <div
                      key={statIndex}
                      className={`${styles.statItem} ${stat.className || ''}`}
                    >
                      <span className={styles.statLabel}>{stat.label}</span>
                      <span className={styles.statValue}>{stat.value}</span>
                    </div>
                  ))}
                </div>

                {task.timeSpent !== undefined && task.timeSpent > 0 && (
                  <div className={styles.taskTime}>
                    <span className={styles.timeIcon}>⏱</span>
                    <span>{formatTimeFromSeconds(task.timeSpent)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
