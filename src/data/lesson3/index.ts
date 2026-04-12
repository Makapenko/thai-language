import type { Lesson } from '../types';

export { lesson3Words } from './words';
export { lesson3AllPhrases, lesson3LocationPhrases, lesson3IdentityPhrases, lesson3WordGroups } from './phrases';
export { lesson3Theory } from './theory';

export const lesson3: Lesson = {
  id: 3,
  title: 'Глаголы состояния, места и желаний',
  description: 'Учимся говорить о местоположении, выражать желания и симпатии. Используем глаголы อยู่/เป็น/คือ, อยาก/ชอบ и предлоги места.',
  sections: [
    {
      id: 'theory',
      type: 'theory',
      title: 'Описание урока',
      description: 'Глаголы состояния, предлоги места и выражение желаний',
    },
    {
      id: 'words',
      type: 'words',
      title: 'Новые слова',
      description: 'Глаголы, предлоги, места и объекты',
    },
    {
      id: 'phrases',
      type: 'phrases',
      title: 'Составление фраз',
      description: 'Практика построения предложений с глаголами состояния и желания',
    },
  ],
};
