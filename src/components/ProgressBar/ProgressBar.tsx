import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number; // 0-100
  variant?: 'default' | 'success' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  variant = 'default',
  size = 'md',
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  const classNames = [styles.container, styles[size], className]
    .filter(Boolean)
    .join(' ');

  const fillClassNames = [styles.fill, styles[`fill-${variant}`]].join(' ');

  return (
    <div className={classNames}>
      <div className={styles.track}>
        <div
          className={fillClassNames}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && <span className={styles.label}>{clampedValue.toFixed(1)}%</span>}
    </div>
  );
}
