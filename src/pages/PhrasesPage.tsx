import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PhraseProgressBar } from '../components/PhraseProgressBar';
import { lesson1Phrases, lesson1WordGroups } from '../data/lesson1';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  setPhrases,
  setWordGroups,
  selectPart,
  clearSelectedParts,
  submitPhrase,
  nextPhrase,
  selectCurrentPhrase,
  selectSelectedParts,
  selectCurrentGroupIndex,
  selectExercises,
  selectCurrentPhraseIndex,
  selectIsRetrying,
  selectPhrasesExerciseComplete,
} from '../features/phrases/phrasesSlice';
import { speakThai, speakThaiPhrase } from '../utils/speech';
import { shuffle } from '../utils/shuffle';
import type { Word } from '../data/types';
import styles from './PhrasesPage.module.css';

// Статус слова в списке ошибок
type WrongWordStatus = 'red' | 'yellow' | 'green' | 'removing';

// Тип для неправильного слова с переводом
interface WrongWord {
  thai: string;
  transcription: string;
  russian: string;
  status: WrongWordStatus;
}

const OPTIONS_PER_GROUP = 4;

// Find word ID by Thai text for audio file lookup
const findWordIdByThai = (thai: string): string | null => {
  const words: Word[] = [...lesson1WordGroups.flatMap(g => g.options)];
  const word = words.find(w => w.thai === thai);
  return word ? word.id : null;
};

// Get audio file path for a Thai word
const getAudioFile = (thai: string): string | null => {
  const wordId = findWordIdByThai(thai);
  return wordId ? `words/${wordId}.mp3` : null;
};

export function PhrasesPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const id = parseInt(lessonId || '1', 10);

  const currentPhrase = useAppSelector(selectCurrentPhrase);
  const selectedParts = useAppSelector(selectSelectedParts);
  const currentGroupIndex = useAppSelector(selectCurrentGroupIndex);
  const exercises = useAppSelector(selectExercises);
  const currentPhraseIndex = useAppSelector(selectCurrentPhraseIndex);
  const isRetrying = useAppSelector(selectIsRetrying);
  const isComplete = useAppSelector(selectPhrasesExerciseComplete);

  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[][]>([]);
  const [wrongWords, setWrongWords] = useState<WrongWord[]>([]);

  // Initialize phrases
  useEffect(() => {
    const shuffledPhrases = shuffle(lesson1Phrases.filter((p) => p.lessonId === id));
    dispatch(setPhrases(shuffledPhrases));
    dispatch(setWordGroups(lesson1WordGroups));
  }, [dispatch, id]);

  // Generate options for current phrase
  useEffect(() => {
    if (!currentPhrase) return;

    const options: string[][] = [];

    // Get unique group IDs from phrase structure
    const groupIds = currentPhrase.structure.map((s) => s.groupId);
    const uniqueGroupIds = [...new Set(groupIds)];

    // For each unique group, generate options (including correct one)
    uniqueGroupIds.forEach((groupId) => {
      const group = lesson1WordGroups.find((g) => g.id === groupId);
      if (!group) return;

      // Find the correct answer for this position
      const correctPart = currentPhrase.structure.find(
        (s, i) => s.groupId === groupId && uniqueGroupIds.slice(0, i).filter((g) => g === groupId).length === groupIds.slice(0, groupIds.indexOf(groupId)).filter((g) => g === groupId).length
      );

      if (!correctPart) return;

      // Get other options from the group
      const otherOptions = group.options
        .filter((opt) => opt.thai !== correctPart.thai)
        .map((opt) => opt.thai);

      // Shuffle and take OPTIONS_PER_GROUP - 1 other options
      const shuffledOthers = shuffle(otherOptions).slice(0, OPTIONS_PER_GROUP - 1);

      // Combine with correct answer and shuffle
      const allOptions = shuffle([correctPart.thai, ...shuffledOthers]);
      options.push(allOptions);
    });

    setCurrentOptions(options);
    setShowResult(false);
  }, [currentPhrase, currentPhraseIndex]);

  // Get current group options
  const activeOptions = currentOptions[currentGroupIndex] || [];

  // Handle option selection
  const handleOptionClick = (thai: string) => {
    if (showResult) return;

    // Speak the word using local audio file
    const audioFile = getAudioFile(thai);
    speakThai(thai, audioFile || undefined);
    dispatch(selectPart(thai));

    // Check if phrase is complete
    if (currentPhrase && selectedParts.length + 1 >= currentPhrase.structure.length) {
      // Phrase is complete, check answer
      const newParts = [...selectedParts, thai];
      const correctParts = currentPhrase.structure.map((s) => s.thai);
      const correctAnswer = correctParts.join(' ');
      const userAnswer = newParts.join(' ');
      const correct = correctAnswer === userAnswer;

      setIsCorrect(correct);
      setShowResult(true);
      dispatch(submitPhrase());

      if (correct) {
        // Ответ правильный — обновить статусы слов из списка ошибок
        setWrongWords(prev => {
          const updated = prev.map(word => {
            // Проверяем, есть ли это слово в текущей фразе
            const isInPhrase = correctParts.includes(word.thai);
            if (!isInPhrase) return word;

            // Обновляем статус: red → yellow → green → removing
            if (word.status === 'red') {
              return { ...word, status: 'yellow' as WrongWordStatus };
            } else if (word.status === 'yellow') {
              return { ...word, status: 'green' as WrongWordStatus };
            } else if (word.status === 'green') {
              return { ...word, status: 'removing' as WrongWordStatus };
            }
            return word;
          });
          return updated;
        });

        // Удалить слова со статусом 'removing' после анимации
        setTimeout(() => {
          setWrongWords(prev => prev.filter(word => word.status !== 'removing'));
        }, 400);
      } else {
        // Ответ неправильный — найти неправильные слова
        const newWrongWords: WrongWord[] = [];

        newParts.forEach((userPart, index) => {
          const correctPart = correctParts[index];
          if (userPart !== correctPart) {
            const correctInfo = getWordInfo(correctPart);

            if (correctInfo) {
              newWrongWords.push({
                thai: correctPart,
                transcription: correctInfo.transcription,
                russian: correctInfo.russian,
                status: 'red',
              });
            }
          }
        });

        // Добавить новые ошибки к существующим (без дубликатов по thai)
        setWrongWords(prev => {
          const combined = [...prev];
          newWrongWords.forEach(newWord => {
            const existingIndex = combined.findIndex(w => w.thai === newWord.thai);
            if (existingIndex === -1) {
              combined.push(newWord);
            } else {
              // Если слово уже есть — сбросить статус на red
              combined[existingIndex] = { ...combined[existingIndex], status: 'red' };
            }
          });
          return combined;
        });
      }

      // Speak the full phrase using word-by-word playback
      const phraseAudioFiles = newParts
        .map(part => getAudioFile(part))
        .filter((f): f is string => f !== null);
      
      if (phraseAudioFiles.length > 0) {
        // Use word-by-word playback for phrases
        speakThaiPhrase(phraseAudioFiles, 300);
      } else {
        // Fallback to API if no audio files found
        speakThai(newParts.join(''));
      }
    }
  };

  // Handle next
  const handleNext = () => {
    if (isRetrying) {
      // Reset for retry
      dispatch(clearSelectedParts());
      setShowResult(false);
    } else {
      dispatch(nextPhrase());
    }
  };

  // Speak current word on click
  const handleSpeakWord = (text: string) => {
    const audioFile = getAudioFile(text);
    speakThai(text, audioFile || undefined);
  };

  // Get word info for display
  const getWordInfo = (thai: string) => {
    for (const group of lesson1WordGroups) {
      const option = group.options.find((opt) => opt.thai === thai);
      if (option) return option;
    }
    return null;
  };

  if (isComplete) {
    const stats = {
      correct: exercises.filter((e) => e.status === 'correct').length,
      wrong: exercises.filter((e) => e.status === 'wrong').length,
      total: exercises.length,
    };

    return (
      <div className={styles.container}>
        <Card variant="elevated" className={styles.completeCard}>
          <div className={styles.completeIcon}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
          </div>
          <h2 className={styles.completeTitle}>Урок завершён!</h2>
          <div className={styles.completeStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.correct}</span>
              <span className={styles.statLabel}>Правильно</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.wrong}</span>
              <span className={styles.statLabel}>Ошибок</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {Math.round((stats.correct / stats.total) * 100)}%
              </span>
              <span className={styles.statLabel}>Результат</span>
            </div>
          </div>
          <div className={styles.completeActions}>
            <Button
              variant="secondary"
              onClick={() => navigate(`/lesson/${id}`)}
            >
              К уроку
            </Button>
            <Button variant="primary" onClick={() => navigate('/')}>
              На главную
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentPhrase) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <Card variant="elevated" className={styles.questionCard}>

          <div className={styles.russian}>{currentPhrase.russian}</div>

          <div className={`${styles.assemblyArea} ${showResult && !isCorrect ? styles.assemblyAreaError : ''}`}>
            {selectedParts.length > 0 ? (
              <div className={styles.assembledParts}>
                {selectedParts.map((part, index) => {
                  const info = getWordInfo(part);
                  return (
                    <button
                      key={index}
                      className={styles.assembledPart}
                      onClick={() => handleSpeakWord(part)}
                    >
                      <span className={styles.partThai}>{part}</span>
                      {info && (
                        <span className={styles.partTranscription}>
                          {info.transcription}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {!showResult && (
            <div className={styles.optionsGroups}>
              <div className={styles.optionsGroup}>
                {activeOptions.map((thai, index) => {
                  const info = getWordInfo(thai);
                  return (
                    <button
                      key={index}
                      className={styles.option}
                      onClick={() => handleOptionClick(thai)}
                    >
                      <span className={styles.optionThai}>{thai || '—'}</span>
                      {info && (
                        <span className={styles.optionTranscription}>
                          {info.transcription || '(пусто)'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {showResult && !isCorrect && (
            <button
              className={styles.correctAnswerBox}
              onClick={() =>
                handleSpeakWord(
                  currentPhrase.structure.map((s) => s.thai).join('')
                )
              }
            >
              <div className={styles.correctAnswerParts}>
                {currentPhrase.structure.map((part, index) => {
                  const info = getWordInfo(part.thai);
                  return (
                    <span key={index} className={styles.correctPart}>
                      <span className={styles.partThai}>{part.thai}</span>
                      {info && (
                        <span className={styles.partTranscription}>
                          {info.transcription}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </button>
          )}

          {showResult && (
            <div className={styles.result}>
              <Button variant="primary" fullWidth onClick={handleNext}>
                {isRetrying ? 'Повторить' : 'Далее'}
              </Button>
            </div>
          )}
        </Card>

        <PhraseProgressBar
          exercises={exercises}
          currentIndex={currentPhraseIndex}
        />

        <div className={styles.navigation}>
          <Button variant="ghost" onClick={() => navigate(`/lesson/${id}`)}>
            Выйти
          </Button>
        </div>
      </div>

      {/* Боковая панель с неправильными словами */}
      {wrongWords.length > 0 && (
        <aside className={styles.wrongWordsSidebar}>
          <h3 className={styles.sidebarTitle}>Ошибки ({wrongWords.filter(w => w.status !== 'removing').length})</h3>
          <div className={styles.wrongWordsList}>
            {wrongWords.map((word, index) => {
              const statusClass = {
                red: styles.wrongWordRed,
                yellow: styles.wrongWordYellow,
                green: styles.wrongWordGreen,
                removing: styles.wrongWordRemoving,
              }[word.status];

              return (
                <button
                  key={`${word.thai}-${index}`}
                  className={`${styles.wrongWordItem} ${statusClass}`}
                  onClick={() => handleSpeakWord(word.thai)}
                >
                  <span className={styles.wrongWordThai}>{word.thai}</span>
                  <span className={styles.wrongWordTranscription}>
                    {word.transcription}
                  </span>
                  <span className={styles.wrongWordRussian}>{word.russian}</span>
                </button>
              );
            })}
          </div>
        </aside>
      )}
    </div>
  );
}
