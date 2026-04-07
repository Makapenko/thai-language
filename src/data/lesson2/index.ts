import type { Lesson } from '../types';

export { lesson2Words } from './words';
export { lesson2Theory } from './theory';

export const lesson2: Lesson = {
  id: 2,
  title: 'Местоимения-дополнения и вопросительные слова',
  description: 'Учимся использовать местоимения как дополнения (кого? кому?) и составлять вопросы с вопросительными словами. Разбираем вежливые и разговорные формы местоимений.',
  sections: [
    {
      id: 'theory',
      type: 'theory',
      title: 'Описание урока',
      description: 'Местоимения-дополнения, вопросительные слова и вежливые частицы',
    },
    {
      id: 'words',
      type: 'words',
      title: 'Новые слова',
      description: 'Местоимения, вопросительные слова и вежливые частицы',
    },
  ],
};
