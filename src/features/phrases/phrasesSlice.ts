import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Phrase, WordGroup, PhraseExercise } from '../../data/types';

interface PhrasesState {
  phrases: Phrase[];
  wordGroups: WordGroup[];
  exercises: PhraseExercise[];
  currentPhraseIndex: number;
  selectedParts: string[];           // Currently selected Thai parts
  currentGroupIndex: number;         // Which group is currently active
  isRetrying: boolean;
  exerciseComplete: boolean;
}

const initialState: PhrasesState = {
  phrases: [],
  wordGroups: [],
  exercises: [],
  currentPhraseIndex: 0,
  selectedParts: [],
  currentGroupIndex: 0,
  isRetrying: false,
  exerciseComplete: false,
};

const phrasesSlice = createSlice({
  name: 'phrases',
  initialState,
  reducers: {
    setPhrases: (state, action: PayloadAction<Phrase[]>) => {
      state.phrases = action.payload;
      state.exercises = action.payload.map(p => ({
        phraseId: p.id,
        status: 'pending',
      }));
      state.currentPhraseIndex = 0;
      state.selectedParts = [];
      state.currentGroupIndex = 0;
      state.isRetrying = false;
      state.exerciseComplete = false;
    },

    setWordGroups: (state, action: PayloadAction<WordGroup[]>) => {
      state.wordGroups = action.payload;
    },

    selectPart: (state, action: PayloadAction<string>) => {
      state.selectedParts.push(action.payload);
      state.currentGroupIndex += 1;
    },

    clearSelectedParts: (state) => {
      state.selectedParts = [];
      state.currentGroupIndex = 0;
    },

    submitPhrase: (state) => {
      const currentPhrase = state.phrases[state.currentPhraseIndex];
      if (!currentPhrase) return;

      const correctAnswer = currentPhrase.structure.map(s => s.thai).join('');
      const userAnswer = state.selectedParts.join('');
      const isCorrect = correctAnswer === userAnswer;

      const exerciseIndex = state.exercises.findIndex(
        e => e.phraseId === currentPhrase.id
      );

      if (isCorrect) {
        state.exercises[exerciseIndex].status = 'correct';
        state.isRetrying = false;
      } else {
        if (state.isRetrying) {
          // Second attempt failed - mark as wrong and move on
          state.exercises[exerciseIndex].status = 'wrong';
          state.isRetrying = false;
        } else {
          // First attempt failed - allow retry
          state.exercises[exerciseIndex].status = 'retry';
          state.isRetrying = true;
        }
      }
    },

    nextPhrase: (state) => {
      state.selectedParts = [];
      state.currentGroupIndex = 0;

      if (state.currentPhraseIndex < state.phrases.length - 1) {
        state.currentPhraseIndex += 1;
        state.isRetrying = false;
      } else {
        state.exerciseComplete = true;
      }
    },

    goToPhrase: (state, action: PayloadAction<number>) => {
      state.currentPhraseIndex = action.payload;
      state.selectedParts = [];
      state.currentGroupIndex = 0;
      state.isRetrying = false;
    },

    resetPhrasesExercise: (state) => {
      state.exercises = state.phrases.map(p => ({
        phraseId: p.id,
        status: 'pending',
      }));
      state.currentPhraseIndex = 0;
      state.selectedParts = [];
      state.currentGroupIndex = 0;
      state.isRetrying = false;
      state.exerciseComplete = false;
    },
  },
});

export const {
  setPhrases,
  setWordGroups,
  selectPart,
  clearSelectedParts,
  submitPhrase,
  nextPhrase,
  goToPhrase,
  resetPhrasesExercise,
} = phrasesSlice.actions;

export default phrasesSlice.reducer;

// Selectors
export const selectPhrases = (state: { phrases: PhrasesState }) => state.phrases.phrases;
export const selectWordGroups = (state: { phrases: PhrasesState }) => state.phrases.wordGroups;
export const selectExercises = (state: { phrases: PhrasesState }) => state.phrases.exercises;
export const selectCurrentPhraseIndex = (state: { phrases: PhrasesState }) => state.phrases.currentPhraseIndex;
export const selectSelectedParts = (state: { phrases: PhrasesState }) => state.phrases.selectedParts;
export const selectCurrentGroupIndex = (state: { phrases: PhrasesState }) => state.phrases.currentGroupIndex;
export const selectIsRetrying = (state: { phrases: PhrasesState }) => state.phrases.isRetrying;
export const selectPhrasesExerciseComplete = (state: { phrases: PhrasesState }) => state.phrases.exerciseComplete;

export const selectCurrentPhrase = (state: { phrases: PhrasesState }) => {
  return state.phrases.phrases[state.phrases.currentPhraseIndex] || null;
};

export const selectPhrasesStats = (state: { phrases: PhrasesState }) => {
  const exercises = state.phrases.exercises;
  return {
    total: exercises.length,
    correct: exercises.filter(e => e.status === 'correct').length,
    wrong: exercises.filter(e => e.status === 'wrong').length,
    pending: exercises.filter(e => e.status === 'pending' || e.status === 'retry').length,
  };
};
