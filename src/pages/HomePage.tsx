import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { lessons as lessons1 } from '../data/lesson1';
import { lesson2 } from '../data/lesson2';
import { useAppSelector } from '../app/hooks';
import { selectAllLessonProgress } from '../features/progress/progressSlice';
import styles from './HomePage.module.css';

const lessons = [...lessons1, lesson2];

export function HomePage() {
  const lessonProgress = useAppSelector(selectAllLessonProgress);

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          <span className={styles.titleThai}>ภาษาไทย</span>
          <span>Тайский за 16 часов</span>
        </h1>
        <p className={styles.subtitle}>
          Изучайте тайский язык по методу Дмитрия Петрова
        </p>
      </section>

      <section className={styles.lessons}>
        <h2 className={styles.sectionTitle}>Уроки</h2>
        <div className={styles.lessonGrid}>
          {lessons.map((lesson) => {
            const progress = lessonProgress[lesson.id];
            const wordsProgress = progress?.wordsProgress || 0;
            const phrasesTotal = progress?.phrasesTotal || 0;
            const phrasesProgress = phrasesTotal > 0
              ? Math.round(
                  (progress.phrasesCompleted / phrasesTotal) * 100
                )
              : 0;
            const overallProgress = phrasesTotal > 0
              ? Math.round((wordsProgress + phrasesProgress) / 2)
              : wordsProgress;

            return (
              <Link
                key={lesson.id}
                to={`/lesson/${lesson.id}`}
                className={styles.lessonLink}
              >
                <Card variant="elevated" className={styles.lessonCard}>
                  <div className={styles.lessonNumber}>Урок {lesson.id}</div>
                  <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                  <p className={styles.lessonDescription}>
                    {lesson.description}
                  </p>
                  <div className={styles.lessonProgress}>
                    <ProgressBar
                      value={overallProgress}
                      size="sm"
                      variant={
                        progress?.completed
                          ? 'success'
                          : overallProgress > 0
                          ? 'default'
                          : 'default'
                      }
                    />
                    <span className={styles.progressLabel}>
                      {overallProgress}%
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}

          {/* Placeholder for future lessons */}
          {Array.from({ length: 14 }, (_, i) => i + 3).map((num) => (
            <div key={num} className={styles.lessonLink}>
              <Card variant="outlined" className={styles.lessonCardLocked}>
                <div className={styles.lessonNumber}>Урок {num}</div>
                <h3 className={styles.lessonTitle}>Скоро</h3>
                <p className={styles.lessonDescription}>
                  Урок в разработке
                </p>
              </Card>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
