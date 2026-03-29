import React from 'react';
import styles from './ProgressCalendar.module.css';
import { formatTimeFromSeconds } from '../../utils/dateUtils';
import { formatDateShort } from '../../utils/dateUtils';

interface LessonDayProgress {
  lessonId: number;
  wordsLearned?: number;
  timeSpent?: number;
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

export const DayDetails: React.FC<DayDetailsProps> = ({ date, dayProgress, onClose }) => {
  const formattedDate = formatDateShort(date);

  return (
    <div className={styles.dayDetails} onClick={onClose}>
      <div className={styles.dayDetailsContent} onClick={e => e.stopPropagation()}>
        <div className={styles.dayDetailsHeader}>
          <h3 className={styles.dayDetailsTitle}>{formattedDate}</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {dayProgress.lessons.length === 0 && !dayProgress.readingTime ? (
          <p className={styles.emptyDayMessage}>В этот день занятий не было</p>
        ) : (
          <>
            {dayProgress.lessons.length > 0 && (
              <div className={styles.daySection}>
                <h4 className={styles.daySectionTitle}>Слова и фразы</h4>
                {dayProgress.lessons.map(lesson => (
                  <div key={lesson.lessonId} className={styles.lessonItem}>
                    <div className={styles.lessonInfo}>
                      <span className={styles.lessonName}>Урок {lesson.lessonId}</span>
                      <div className={styles.lessonStats}>
                        {lesson.wordsLearned !== undefined && lesson.wordsLearned > 0 && (
                          <span className={styles.stat}>
                            📚 {lesson.wordsLearned} слов
                          </span>
                        )}
                        {lesson.correctPhrases !== undefined && (
                          <span className={`${styles.stat} ${styles.statCorrect}`}>
                            ✓ {lesson.correctPhrases}
                          </span>
                        )}
                        {lesson.wrongPhrases !== undefined && lesson.wrongPhrases > 0 && (
                          <span className={`${styles.stat} ${styles.statWrong}`}>
                            ✗ {lesson.wrongPhrases}
                          </span>
                        )}
                      </div>
                    </div>
                    {lesson.timeSpent !== undefined && lesson.timeSpent > 0 && (
                      <span className={`${styles.stat} ${styles.statTime}`}>
                        {formatTimeFromSeconds(lesson.timeSpent)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {dayProgress.readingTime !== undefined && dayProgress.readingTime > 0 && (
              <div className={styles.daySection}>
                <h4 className={styles.daySectionTitle}>Теория</h4>
                <div className={styles.lessonItem}>
                  <span className={styles.lessonName}>Время чтения</span>
                  <span className={styles.statTime}>
                    {formatTimeFromSeconds(dayProgress.readingTime)}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
