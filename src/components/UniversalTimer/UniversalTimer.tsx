import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getStoredTime, saveTime } from '../../utils/timerStorage';
import { formatTimeFromSeconds } from '../../utils/dateUtils';
import styles from './UniversalTimer.module.css';

// List of components where timer is hidden but time is still tracked
export const HIDDEN_TIMER_COMPONENTS: string[] = [
  'progress-calendar',
  'today-tasks',
  // Add other component IDs where timer should be hidden but time tracked
];

// List of components where timer is fully disabled (no time tracking)
export const EXCLUDED_TIMER_COMPONENTS: string[] = [
  'progress-calendar',
  'today-tasks',
  'default',
];

interface UniversalTimerProps {
  componentId: string; // Component identifier (activity or lesson)
  onTimeUpdate?: (time: number) => void; // Optional callback for time updates
}

const UniversalTimer: React.FC<UniversalTimerProps> = React.memo(({ componentId, onTimeUpdate }) => {
  const [seconds, setSeconds] = useState(() => {
    const initialTime = getStoredTime(componentId);
    return initialTime;
  });
  const [isPaused, setIsPaused] = useState(false);
  const saveCurrentTimeRef = useRef<(time: number) => void>(() => {});

  const saveCurrentTime = useCallback((time: number) => {
    saveTime(componentId, time);
    if (onTimeUpdate) {
      onTimeUpdate(time);
    }
  }, [componentId, onTimeUpdate]);

  // Keep ref updated
  useEffect(() => {
    saveCurrentTimeRef.current = saveCurrentTime;
  }, [saveCurrentTime]);

  // Pause when switching browser tabs
  const [isTabHidden, setIsTabHidden] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabHidden(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Time update effect
  useEffect(() => {
    // Don't update time for excluded components
    if (EXCLUDED_TIMER_COMPONENTS.includes(componentId) || isPaused || isTabHidden) {
      return;
    }

    const interval = window.setInterval(() => {
      setSeconds(prev => {
        const newTime = prev + 1;
        saveCurrentTimeRef.current(newTime);
        return newTime;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [componentId, isPaused, isTabHidden]);

  // Reset timer when component changes
  useEffect(() => {
    const storedTime = getStoredTime(componentId);
    setSeconds(storedTime);
    setIsPaused(false); // Reset pause when component changes
  }, [componentId]);

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Don't show timer for hidden components
  if (HIDDEN_TIMER_COMPONENTS.includes(componentId)) {
    return null;
  }

  return (
    <div className={`${styles.universalTimer} ${isPaused ? styles.isPaused : ''}`}>
      <span className={styles.timerText}>
        {isPaused ? '⏸️ ' : ''}Время: {formatTimeFromSeconds(seconds)}
      </span>
      <button
        className={styles.pauseButton}
        onClick={togglePause}
        aria-label={isPaused ? 'Возобновить' : 'Пауза'}
      >
        {isPaused ? '▶️' : '⏸️'}
      </button>
    </div>
  );
});

export default UniversalTimer;
