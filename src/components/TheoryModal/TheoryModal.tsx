import { lesson1Theory, lesson1Words } from '../../data/lesson1';
import { lesson2Theory, lesson2Words } from '../../data/lesson2';
import { speakThai } from '../../utils/speech';
import styles from './TheoryModal.module.css';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId?: number;
}

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

export function TheoryModal({ isOpen, onClose, lessonId = 1 }: TheoryModalProps) {
  const theory = getLessonTheory(lessonId);

  const handleSpeak = (text: string) => {
    const audioFile = getAudioFile(text);
    speakThai(text, audioFile || undefined);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>{theory.title}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className={styles.content}>
          {theory.sections.map((section, index) => (
            <div key={index} className={styles.section}>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
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
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
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
            </div>
          ))}

          <div className={styles.mainTable}>
            <h3 className={styles.mainTableTitle}>Главная таблица</h3>
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
          </div>
        </div>
      </div>
    </div>
  );
}
