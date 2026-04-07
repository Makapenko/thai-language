import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import UniversalTimer from '../components/UniversalTimer/UniversalTimer';
import { useAppDispatch } from '../app/hooks';
import { updateChapterProgress } from '../features/progress/progressSlice';
import { lesson1Theory, lesson1Words } from '../data/lesson1';
import { lesson2Theory, lesson2Words } from '../data/lesson2';
import { speakThai } from '../utils/speech';
import styles from './TheoryPage.module.css';
import type { Word } from '../data/types';

const allWords = [...lesson1Words, ...lesson2Words];

// Find word ID by Thai text for audio file lookup
const findWordIdByThai = (thai: string): string | null => {
  const word = allWords.find(w => w.thai === thai);
  return word ? word.id : null;
};

// Get audio file path for a Thai word
const getAudioFile = (thai: string): string | null => {
  const wordId = findWordIdByThai(thai);
  return wordId ? `words/${wordId}.mp3` : null;
};

function getLessonTheory(id: number) {
  if (id === 2) return lesson2Theory;
  return lesson1Theory;
}

export function TheoryPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const id = parseInt(lessonId || '1', 10);

  const theory = getLessonTheory(id);

  const handleSpeak = (text: string) => {
    const audioFile = getAudioFile(text);
    speakThai(text, audioFile || undefined);
  };

  // Timer component ID for theory section
  const timerComponentId = `lesson-${id}-theory`;

  // Handle timer time updates
  const handleTimeUpdate = (time: number) => {
    dispatch(updateChapterProgress({ chapterId: timerComponentId, timeSpent: time }));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{theory.title}</h1>
        <UniversalTimer componentId={timerComponentId} onTimeUpdate={handleTimeUpdate} />
      </header>

      <section className={styles.content}>
        {theory.sections.map((section, index) => (
          <Card key={index} variant="default" className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <div className={styles.sectionContent}>
              {section.content.split('\n').map((paragraph, pIndex) => (
                <p key={pIndex} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}

              {section.example && (
                <div className={styles.example}>
                  <button
                    className={styles.exampleButton}
                    onClick={() => handleSpeak(section.example!.thai)}
                    title="Нажмите, чтобы услышать"
                  >
                    <span className={styles.thai}>{section.example.thai}</span>
                  </button>
                  <span className={styles.transcription}>
                    {section.example.transcription}
                  </span>
                  <span className={styles.russian}>{section.example.russian}</span>
                </div>
              )}

              {section.table && (
                <div className={styles.sectionTableWrapper}>
                  <table className={styles.sectionTable}>
                    <thead>
                      <tr>
                        {section.table.headers.map((header, hIndex) => (
                          <th key={hIndex}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, rIndex) => (
                        <tr key={rIndex}>
                          {row.cells.map((cell, cIndex) => (
                            <td key={cIndex}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.note && (
                <div className={styles.note}>
                  {section.note.split('\n').map((line, nIndex) => (
                    <p key={nIndex} className={styles.noteParagraph}>
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}

        <Card variant="elevated" className={styles.tableCard}>
          <h2 className={styles.tableTitle}>Главная таблица</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {theory.table.headers.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {theory.table.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className={styles.rowLabel}>{row.label}</td>
                    {row.cells.map((cell, cellIndex) => (
                      <td key={cellIndex} className={styles.cell}>
                        <button
                          className={styles.thaiButton}
                          onClick={() => handleSpeak(cell.thai)}
                          title="Нажмите, чтобы услышать"
                        >
                          <span className={styles.thai}>{cell.thai}</span>
                        </button>
                        <span className={styles.transcription}>
                          {cell.transcription}
                        </span>
                        <span className={styles.russian}>{cell.russian}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className={styles.actions}>
        <Button
          variant="secondary"
          onClick={() => navigate(`/lesson/${id}`)}
        >
          Назад к уроку
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(`/lesson/${id}/words`)}
        >
          Перейти к словам
        </Button>
      </section>
    </div>
  );
}
