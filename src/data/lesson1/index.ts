import type { Lesson } from '../types';

export { lesson1Words } from './words';
export { lesson1Phrases, lesson1WordGroups } from './phrases';
export { lesson1Theory } from './theory';

export const lesson1: Lesson = {
  id: 1,
  title: 'Базовая структура предложения',
  description: 'Учимся строить простые предложения в настоящем, прошедшем и будущем времени. Утверждения, отрицания и вопросы.',
  sections: [
    {
      id: 'theory',
      type: 'theory',
      title: 'Описание урока',
      description: 'Принцип построения фраз в тайском языке',
    },
    {
      id: 'words',
      type: 'words',
      title: 'Новые слова',
      description: 'Местоимения, глаголы и служебные слова',
    },
    {
      id: 'phrases',
      type: 'phrases',
      title: 'Составление фраз',
      description: 'Практика построения предложений',
    },
  ],
};

export const lessons: Lesson[] = [lesson1];
