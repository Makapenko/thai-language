import React from 'react';
import styles from './TodayTasks.module.css';
import { useLast7DaysProgress, useTestsByType } from '../../app/hooks';
import { formatDateShort } from '../../utils/dateUtils';

interface ActivityHistoryConfig {
  title: string;
  emptyHistoryText: string;
  activityIds: string[];
  testActivityId: string;
  testScoreBadgeLabel: string;
}

interface ActivityHistoryBarProps {
  goalSeconds: number;
  config: ActivityHistoryConfig;
}

const ActivityHistoryBar: React.FC<ActivityHistoryBarProps> = ({ goalSeconds, config }) => {
  const last7DaysProgress = useLast7DaysProgress();
  const testResults = useTestsByType(config.testActivityId);

  // Calculate time spent for each day
  const getDayTimeSpent = (dayProgress: any) => {
    if (!dayProgress.activities) return 0;
    return config.activityIds.reduce((total, activityId) => {
      return total + (dayProgress.activities[activityId]?.timeSpent || 0);
    }, 0);
  };

  // Check if day has test result
  const getDayTestResult = (date: string) => {
    return testResults.find(
      (result) => result.completedAt.startsWith(date)
    );
  };

  // Check if any day has activity
  const hasAnyActivity = last7DaysProgress.some(({ progress }) => {
    const timeSpent = getDayTimeSpent(progress);
    return timeSpent > 0;
  });

  if (!hasAnyActivity) {
    return (
      <div className={styles.historyBar}>
        <div className={styles.emptyHistory}>{config.emptyHistoryText}</div>
      </div>
    );
  }

  return (
    <div className={styles.historyBar}>
      <div className={styles.historyBars}>
        {last7DaysProgress.map(({ date, progress }) => {
          const timeSpent = getDayTimeSpent(progress);
          const goalAchieved = timeSpent >= goalSeconds;
          const testResult = getDayTestResult(date);
          const percent = Math.min((timeSpent / goalSeconds) * 100, 100);

          return (
            <div key={date} className={styles.historyDay}>
              <div className={styles.historyDate}>{formatDateShort(date)}</div>
              <div className={styles.historyBarContainer}>
                <div
                  className={`${styles.historyBarFill} ${goalAchieved ? styles.goalAchieved : ''}`}
                  style={{ height: `${percent}%` }}
                />
                {testResult && (
                  <div className={styles.testBadge}>
                    {testResult.score}/{testResult.maxScore}
                  </div>
                )}
              </div>
              <div className={styles.historyTime}>
                {Math.floor(timeSpent / 60)} мин
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityHistoryBar;
