import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import UniversalTimer from '../components/UniversalTimer/UniversalTimer';
import { lesson1Words } from '../data/lesson1';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  setWords,
  answerCorrect,
  answerWrong,
  selectWordsProgress,
  selectLessonWordsProgress,
  selectUnlockedWordsByLesson,
  selectLessonWordsComplete,
  updateWordsTimeSpent,
  restoreUnlockedWords,
} from '../features/words/wordsSlice';
import { speakThai } from '../utils/speech';
import { getOptionsWithCorrect, shuffle } from '../utils/shuffle';
import type { Word } from '../data/types';
import styles from './WordsPage.module.css';

const OPTIONS_COUNT = 6;

export function WordsPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const id = parseInt(lessonId || '1', 10);

  // Timer component ID for words section
  const timerComponentId = `lesson-${id}-words`;

  // Handle timer time updates
  const handleTimeUpdate = useCallback((time: number) => {
    dispatch(updateWordsTimeSpent({ lessonId: id, seconds: time }));
  }, [dispatch, id]);

  const wordsProgress = useAppSelector(selectWordsProgress);
  const overallProgress = useAppSelector(selectLessonWordsProgress(id));
  const unlockedWords = useAppSelector(selectUnlockedWordsByLesson(id));
  const isLessonComplete = useAppSelector(selectLessonWordsComplete(id));

  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<Word[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [questionIsReversed, setQuestionIsReversed] = useState(false);

  // Use ref to store wordsProgress for setupQuestion to avoid dependency issues
  const wordsProgressRef = useRef(wordsProgress);
  wordsProgressRef.current = wordsProgress;

  const lessonWords = useMemo(() => lesson1Words.filter((w) => w.lessonId === id), [id]);

  // Initialize words in Redux
  useEffect(() => {
    dispatch(setWords(lessonWords));
  }, [dispatch, lessonWords]);

  // Restore unlocked words after words are loaded
  useEffect(() => {
    if (lessonWords.length > 0) {
      dispatch(restoreUnlockedWords());
    }
  }, [dispatch, lessonWords.length]);

  // Get next word to practice - uses ref to avoid dependency on wordsProgress
  const getNextWord = useCallback(() => {
    const progress = wordsProgressRef.current;

    // Find unlocked words that are not completed
    const incompleteWords = unlockedWords.filter((word: Word) => {
      const wordProgress = progress[word.id];
      return !wordProgress || !wordProgress.completed;
    });

    if (incompleteWords.length === 0) {
      return null; // All words completed
    }

    // Prioritize words with lower streaks
    const sortedWords = [...incompleteWords].sort((a, b) => {
      const progressA = progress[a.id]?.correctStreak || 0;
      const progressB = progress[b.id]?.correctStreak || 0;
      return progressA - progressB;
    });

    // Add some randomness among words with similar progress
    const lowestStreak = progress[sortedWords[0].id]?.correctStreak || 0;
    const candidateWords = sortedWords.filter((word) => {
      const streak = progress[word.id]?.correctStreak || 0;
      return streak <= lowestStreak + 1;
    });

    const selected = shuffle(candidateWords)[0];
    return selected;
  }, [unlockedWords]);

  // Set up new question
  const setupQuestion = useCallback(() => {
    const nextWord = getNextWord();
    if (!nextWord) {
      setCurrentWord(null);
      return;
    }

    // Calculate and store the reversed mode for THIS question
    // This ensures the display mode stays consistent even if progress changes
    const nextWordProgress = wordsProgress[nextWord.id];
    const isReversedForThisQuestion = (nextWordProgress?.correctStreak ?? 0) >= 3;
    setQuestionIsReversed(isReversedForThisQuestion);
    
    setCurrentWord(nextWord);
    setSelectedOption(null);
    setShowResult(false);

    // Generate options from unlocked words only
    const wordOptions = getOptionsWithCorrect(
      unlockedWords,
      nextWord,
      OPTIONS_COUNT,
      (w) => w.id
    );
    setOptions(wordOptions);
  }, [getNextWord, unlockedWords]);

  // Initial setup - only run once
  useEffect(() => {
    if (!isInitialized && unlockedWords.length > 0) {
      setupQuestion();
      setIsInitialized(true);
    }
  }, [isInitialized, unlockedWords.length, setupQuestion]);

  // Get current word progress (for streak display)
  const currentWordProgress = currentWord ? wordsProgress[currentWord.id] : null;

  // Auto-advance after showing result
  useEffect(() => {
    if (showResult) {
      const timer = setTimeout(() => {
        setupQuestion();
      }, 3000); // 3 seconds delay

      return () => clearTimeout(timer);
    }
  }, [showResult]); // eslint-disable-line react-hooks/exhaustive-deps -- setupQuestion is stable enough

  // Handle option click
  const handleOptionClick = (option: Word) => {
    if (showResult) return;

    setSelectedOption(option.id);
    const correct = option.id === currentWord?.id;
    setIsCorrect(correct);
    setShowResult(true);

    // Speak the correct Thai word using local audio file
    const audioFile = `words/${currentWord!.id}.mp3`;
    speakThai(currentWord!.thai, audioFile);

    if (correct) {
      dispatch(answerCorrect(currentWord!.id));
    } else {
      dispatch(answerWrong(currentWord!.id));
    }
  };

  // Handle next button (manual advance)
  const handleNext = () => {
    setupQuestion();
  };

  // Handle speak button
  const handleSpeak = (text: string, audioFile: string) => {
    speakThai(text, audioFile);
  };

  // Check if exercise is complete
  const isComplete = isLessonComplete;

  if (isComplete) {
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
          <h2 className={styles.completeTitle}>Отлично!</h2>
          <p className={styles.completeText}>
            Вы выучили все слова этого урока
          </p>
          <div className={styles.completeActions}>
            <Button
              variant="secondary"
              onClick={() => navigate(`/lesson/${id}`)}
            >
              К уроку
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/lesson/${id}/phrases`)}
            >
              Перейти к фразам
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Guard: if currentWord is null during initialization, show loading
  if (!currentWord) {
    return (
      <div className={styles.container}>
        <Card variant="elevated" className={styles.questionCard}>
          <div className={styles.loading}>
            {isLessonComplete ? (
              <>
                <div className={styles.completeIcon}>
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22,4 12,14.01 9,11.01" />
                  </svg>
                </div>
                <h2 className={styles.completeTitle}>Отлично!</h2>
                <p className={styles.completeText}>
                  Вы выучили все слова этого урока
                </p>
                <div className={styles.completeActions}>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/lesson/${id}`)}
                  >
                    К уроку
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/lesson/${id}/phrases`)}
                  >
                    Перейти к фразам
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.spinner}>
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 12 12"
                        to="360 12 12"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </path>
                  </svg>
                </div>
                <p>Загрузка слов...</p>
                <p className={styles.debugInfo}>
                  Разблокировано: {unlockedWords.length}
                </p>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <UniversalTimer componentId={timerComponentId} onTimeUpdate={handleTimeUpdate} />

      <Card variant="elevated" className={styles.questionCard}>
        <div className={styles.wordInfo}>
          {currentWordProgress && (
            <div className={styles.streakIndicator}>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`${styles.streakDot} ${
                    i < (currentWordProgress.correctStreak || 0)
                      ? styles.streakDotFilled
                      : ''
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.question}>
          {questionIsReversed ? (
            // Show Thai -> Russian
            <>
              <button
                className={styles.questionThai}
                onClick={() => handleSpeak(currentWord.thai, `words/${currentWord.id}.mp3`)}
              >
                {currentWord.thai}
              </button>
              <span className={styles.questionTranscription}>
                {currentWord.transcription}
              </span>
            </>
          ) : (
            // Show Russian -> Thai
            <>
              <span className={styles.questionRussian}>
                {currentWord.russian}
              </span>
            </>
          )}
        </div>

        <div className={styles.options}>
          {options.map((option) => {
            const isSelected = selectedOption === option.id;
            const isCorrectOption = option.id === currentWord.id;

            let optionClass = styles.option;
            if (showResult) {
              if (isCorrectOption) {
                optionClass = `${styles.option} ${styles.optionCorrect}`;
              } else if (isSelected) {
                optionClass = `${styles.option} ${styles.optionWrong}`;
              }
            }

            return (
              <button
                key={option.id}
                className={optionClass}
                onClick={() => handleOptionClick(option)}
                disabled={showResult}
              >
                {questionIsReversed ? (
                  // Reversed: show Russian options
                  <span className={styles.optionRussian}>{option.russian}</span>
                ) : (
                  // Normal: show Thai options
                  <>
                    <span className={styles.optionThai}>{option.thai}</span>
                    <span className={styles.optionTranscription}>
                      {option.transcription}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {showResult && !isCorrect && (
          <button
            className={styles.correctAnswerBox}
            onClick={() => handleSpeak(currentWord.thai, `words/${currentWord.id}.mp3`)}
          >
            <span className={styles.correctAnswerThai}>{currentWord.thai}</span>
            <span className={styles.correctAnswerTranscription}>
              {currentWord.transcription}
            </span>
            <span className={styles.correctAnswerRussian}>
              {currentWord.russian}
            </span>
          </button>
        )}

        {showResult && (
          <div className={styles.result}>
            <div className={styles.timerBar}>
              <div className={styles.timerFill} />
            </div>
            <Button variant="primary" fullWidth onClick={handleNext}>
              Далее
            </Button>
          </div>
        )}
      </Card>

      <div className={styles.progressWrapper}>
        <ProgressBar
          value={overallProgress}
          size="md"
          showLabel
          variant={overallProgress === 100 ? 'success' : 'default'}
        />
      </div>

      <div className={styles.navigation}>
        <Button variant="ghost" onClick={() => navigate(`/lesson/${id}`)}>
          Выйти
        </Button>
      </div>
    </div>
  );
}
