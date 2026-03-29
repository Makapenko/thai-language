import type { PhraseExercise } from '../../data/types';
import styles from './PhraseProgressBar.module.css';

interface PhraseProgressBarProps {
  exercises: PhraseExercise[];
}

export function PhraseProgressBar({
  exercises,
}: PhraseProgressBarProps) {
  // Group exercises into chunks for display (20 columns, 5 rows each = 100 total)
  const totalSlots = 100;
  const columns = 20;
  const rows = 5;

  // Create slots array from exercises (each exercise is a marker)
  const slots = Array.from({ length: totalSlots }, (_, index) => {
    const exercise = exercises[index];

    let status: 'empty' | 'correct' | 'wrong' = 'empty';

    if (exercise) {
      if (exercise.status === 'correct') {
        status = 'correct';
      } else if (exercise.status === 'wrong') {
        status = 'wrong';
      }
    }

    return { index, status };
  });

  // Group into columns
  const columnGroups: typeof slots[] = [];
  for (let col = 0; col < columns; col++) {
    const column: typeof slots = [];
    for (let row = 0; row < rows; row++) {
      const index = col * rows + row;
      if (slots[index]) {
        column.push(slots[index]);
      }
    }
    columnGroups.push(column);
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {columnGroups.map((column, colIndex) => (
          <div key={colIndex} className={styles.column}>
            {column.map((slot) => (
              <div
                key={slot.index}
                className={`${styles.slot} ${styles[slot.status]}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className={styles.stats}>
        <span className={styles.statItem}>
          <span className={`${styles.dot} ${styles.correct}`} />
          {exercises.filter((e) => e.status === 'correct').length}
        </span>
        <span className={styles.statItem}>
          <span className={`${styles.dot} ${styles.wrong}`} />
          {exercises.filter((e) => e.status === 'wrong').length}
        </span>
        <span className={styles.statItem}>
          {exercises.length} / 100
        </span>
      </div>
    </div>
  );
}
