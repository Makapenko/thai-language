import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { lessons, lesson1Words, lesson1Phrases, lesson1Theory } from '../data/lesson1';
import { useAppSelector } from '../app/hooks';
import { selectAllLessonProgress } from '../features/progress/progressSlice';
import { selectLessonWordsProgress } from '../features/words/wordsSlice';
import styles from './LessonPage.module.css';

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const id = parseInt(lessonId || '1', 10);

  const lesson = lessons.find((l) => l.id === id);
  const lessonProgress = useAppSelector(selectAllLessonProgress);
  const wordsProgress = useAppSelector(selectLessonWordsProgress(id));
  const progress = lessonProgress[id];

  if (!lesson) {
    return (
      <div className={styles.notFound}>
        <h1>Урок не найден</h1>
        <Link to="/">Вернуться к списку уроков</Link>
      </div>
    );
  }

  const phrasesProgress = progress
    ? Math.round((progress.phrasesCompleted / progress.phrasesTotal) * 100)
    : 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.lessonNumber}>Урок {lesson.id}</span>
        <h1 className={styles.title}>{lesson.title}</h1>
        <p className={styles.description}>{lesson.description}</p>
      </header>

      <section className={styles.sections}>
        {lesson.sections.map((section) => {
          let sectionProgress = 0;
          let subtitle = '';

          if (section.type === 'theory') {
            subtitle = `${lesson1Theory.sections.length} раздела`;
          } else if (section.type === 'words') {
            sectionProgress = wordsProgress;
            subtitle = `${lesson1Words.length} слов`;
          } else if (section.type === 'phrases') {
            sectionProgress = phrasesProgress;
            subtitle = `${lesson1Phrases.length} фраз`;
          }

          return (
            <Card
              key={section.id}
              variant="elevated"
              className={styles.sectionCard}
              onClick={() => navigate(`/lesson/${id}/${section.id}`)}
            >
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  {section.type === 'theory' && (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  )}
                  {section.type === 'words' && (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  )}
                  {section.type === 'phrases' && (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  )}
                </div>
                <div className={styles.sectionInfo}>
                  <h3 className={styles.sectionTitle}>{section.title}</h3>
                  <p className={styles.sectionSubtitle}>{subtitle}</p>
                </div>
                <svg
                  className={styles.chevron}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
              {section.type !== 'theory' && (
                <div className={styles.sectionProgress}>
                  <ProgressBar
                    value={sectionProgress}
                    size="sm"
                    variant={sectionProgress === 100 ? 'success' : 'default'}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </section>

      <section className={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate(`/lesson/${id}/theory`)}
        >
          Начать урок
        </Button>
      </section>
    </div>
  );
}
