import React, { useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectDailyWordsProgress } from '../../features/words/wordsSlice';
import { selectDailyPhrasesProgress } from '../../features/phrases/phrasesSlice';
import { selectDailyProgress as selectDailyReadingProgress } from '../../features/progress/progressSlice';
import styles from './ProgressCalendar.module.css';
import { DayDetails } from './DayDetails';
import {
  getCurrentYearMonth,
  getDaysInMonth,
  getDayOfMonth,
  getUpdatedYearMonth,
  getCurrentDate,
  formatTimeFromSeconds,
} from '../../utils/dateUtils';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

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

const ProgressCalendar: React.FC = () => {
  const dailyWordsProgress = useAppSelector(selectDailyWordsProgress);
  const dailyPhrasesProgress = useAppSelector(selectDailyPhrasesProgress);
  const dailyReadingProgress = useAppSelector(selectDailyReadingProgress);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(getCurrentYearMonth);

  // Combine all progress data by date
  const getDailyProgress = (): { [key: string]: DayProgress } => {
    const processed: { [key: string]: DayProgress } = {};

    // Process words progress
    Object.entries(dailyWordsProgress).forEach(([date, lessons]) => {
      if (!processed[date]) {
        processed[date] = { date, lessons: [] };
      }
      lessons.forEach(lesson => {
        const existingLesson = processed[date].lessons.find(l => l.lessonId === lesson.lessonId);
        if (existingLesson) {
          existingLesson.wordsLearned = (existingLesson.wordsLearned || 0) + lesson.wordsLearned;
          existingLesson.wordsTimeSpent = (existingLesson.wordsTimeSpent || 0) + lesson.timeSpent;
        } else {
          processed[date].lessons.push({
            ...lesson,
            wordsTimeSpent: lesson.timeSpent,
          });
        }
      });
    });

    // Process phrases progress
    Object.entries(dailyPhrasesProgress).forEach(([date, lessons]) => {
      if (!processed[date]) {
        processed[date] = { date, lessons: [] };
      }
      lessons.forEach(lesson => {
        const existingLesson = processed[date].lessons.find(l => l.lessonId === lesson.lessonId);
        if (existingLesson) {
          existingLesson.correctPhrases = (existingLesson.correctPhrases || 0) + lesson.correctPhrases;
          existingLesson.wrongPhrases = (existingLesson.wrongPhrases || 0) + lesson.wrongPhrases;
          existingLesson.phrasesTimeSpent = (existingLesson.phrasesTimeSpent || 0) + lesson.timeSpent;
        } else {
          processed[date].lessons.push({
            ...lesson,
            phrasesTimeSpent: lesson.timeSpent,
          });
        }
      });
    });

    // Process reading progress
    Object.entries(dailyReadingProgress).forEach(([date, chapters]) => {
      if (!processed[date]) {
        processed[date] = { date, lessons: [] };
      }
      const totalReadingTime = Object.values(chapters).reduce((sum, ch) => sum + (ch.timeSpent || 0), 0);
      processed[date].readingTime = totalReadingTime;
    });

    return processed;
  };

  const getMonthDays = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = getDaysInMonth(year, month);

    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days: (string | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push(date);
    }

    return days;
  };

  const dailyProgress = getDailyProgress();
  const monthDays = getMonthDays();

  const changeMonth = (delta: number) => {
    setCurrentMonth(getUpdatedYearMonth(currentMonth, delta));
  };

  const formatMonthTitle = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return `${monthNames[month - 1]} ${year}`;
  };

  const hasProgress = (date: string): boolean => {
    const progress = dailyProgress[date];
    if (!progress) return false;
    return progress.lessons.length > 0 || ((progress.readingTime || 0) > 0);
  };

  const getDayIndicators = (date: string) => {
    const progress = dailyProgress[date];
    if (!progress) return { words: 0, phrases: 0, reading: false };

    const totalWords = progress.lessons.reduce((sum, l) => sum + (l.wordsLearned || 0), 0);
    const totalPhrases = progress.lessons.reduce((sum, l) => sum + (l.correctPhrases || 0) + (l.wrongPhrases || 0), 0);
    const hasReading = (progress.readingTime || 0) > 0;

    return { words: totalWords, phrases: totalPhrases, reading: hasReading };
  };

  return (
    <div className={styles.calendar}>
      <h2 className={styles.calendarTitle}>Календарь прогресса</h2>

      <div className={styles.monthHeader}>
        <button onClick={() => changeMonth(-1)}>&lt;</button>
        <h3 className={styles.monthTitle}>{formatMonthTitle()}</h3>
        <button onClick={() => changeMonth(1)}>&gt;</button>
      </div>

      <div className={styles.weekDays}>
        {WEEKDAYS.map(day => (
          <div key={day} className={styles.weekDay}>{day}</div>
        ))}
      </div>

      <div className={styles.days}>
        {monthDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className={styles.emptyDay} />;
          }

          const dayHasProgress = hasProgress(date);
          const isCurrentDay = date === getCurrentDate();
          const indicators = getDayIndicators(date);

          return (
            <div
              key={date}
              className={`${styles.day} ${dayHasProgress ? styles.hasContent : ''} ${isCurrentDay ? styles.currentDay : ''}`}
              onClick={() => dayHasProgress && setSelectedDate(date)}
            >
              <div className={styles.dayHeader}>
                <h3>{getDayOfMonth(date)}</h3>
                {indicators.reading && (
                  <span>{formatTimeFromSeconds(dailyProgress[date].readingTime || 0)}</span>
                )}
              </div>

              {dayHasProgress && (
                <div className={styles.dayContent}>
                  {indicators.words > 0 && (
                    <div className={styles.indicator}>
                      <span>📚 {indicators.words}</span>
                    </div>
                  )}
                  {indicators.phrases > 0 && (
                    <div className={styles.indicator}>
                      <span>💬 {indicators.phrases}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && dailyProgress[selectedDate] && (
        <DayDetails
          date={selectedDate}
          dayProgress={dailyProgress[selectedDate]}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
};

export default ProgressCalendar;
