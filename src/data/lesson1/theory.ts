import type { TheoryData } from '../types';

export const lesson1Theory: TheoryData = {
  title: 'Базовая структура предложения',
  sections: [
    {
      title: 'Порядок слов',
      content: `В тайском языке порядок слов такой же, как в английском и русском:

Подлежащее + Глагол + Дополнение
(SVO — Subject-Verb-Object)

Пример:`,
      example: {
        thai: 'ผม กิน ข้าว',
        transcription: 'pǒm gin kâao',
        russian: 'Я ем рис',
      },
    },
    {
      title: 'Времена',
      content: `В тайском языке глагол не меняется. Время обозначается частицами:`,
      table: {
        headers: ['Время', 'Частица', 'Позиция', 'Пример'],
        rows: [
          {
            cells: ['Настоящее', '—', 'без частицы', 'ผมกิน (pǒm gin) — Я ем'],
          },
          {
            cells: [
              'Настоящее (в процессе)',
              'กำลัง (gam-lang)',
              'перед глаголом',
              'ผมกำลังกิน (pǒm gam-lang gin) — Я сейчас ем',
            ],
          },
          {
            cells: [
              'Прошедшее',
              'แล้ว (láew)',
              'после глагола',
              'ผมกินแล้ว (pǒm gin láew) — Я поел',
            ],
          },
          {
            cells: [
              'Будущее',
              'จะ (jà)',
              'перед глаголом',
              'ผมจะกิน (pǒm jà gin) — Я буду есть',
            ],
          },
        ],
      },
    },
    {
      title: 'Отрицание',
      content: `Частица ไม่ (mâi) ставится перед глаголом:`,
      table: {
        headers: ['Время', 'Утверждение', 'Отрицание'],
        rows: [
          {
            cells: [
              'Настоящее',
              'ผมกิน (pǒm gin) — Я ем',
              'ผมไม่กิน (pǒm mâi gin) — Я не ем',
            ],
          },
          {
            cells: [
              'Прошедшее',
              'ผมกินแล้ว (pǒm gin láew) — Я поел',
              'ผมไม่ได้กิน (pǒm mâi-dâi gin) — Я не ел',
            ],
          },
          {
            cells: [
              'Будущее',
              'ผมจะกิน (pǒm jà gin) — Я буду есть',
              'ผมจะไม่กิน (pǒm jà mâi gin) — Я не буду есть',
            ],
          },
        ],
      },
      note: `Обратите внимание:
• В прошедшем времени для отрицания используется ไม่ได้ (mâi-dâi), а не просто ไม่
• В будущем времени จะ остаётся, а ไม่ идёт после неё`,
    },
    {
      title: 'Вопросы',
      content: `Добавьте частицу ไหม (mǎi) в конец утверждения:`,
      table: {
        headers: ['Утверждение', 'Вопрос'],
        rows: [
          {
            cells: [
              'ผมกิน (pǒm gin) — Я ем',
              'ผมกินไหม? (pǒm gin mǎi?) — Я ем?',
            ],
          },
          {
            cells: [
              'คุณกินแล้ว (kun gin láew) — Ты поел',
              'คุณกินแล้วไหม? (kun gin láew mǎi?) — Ты поел?',
            ],
          },
          {
            cells: [
              'เขาจะไป (kǎo jà bpai) — Он пойдёт',
              'เขาจะไปไหม? (kǎo jà bpai mǎi?) — Он пойдёт?',
            ],
          },
        ],
      },
      note: `Ответы:
• Да: ใช่ (châi) или повторить глагол
• Нет: ไม่ (mâi) หรือ ไม่ใช่ (mâi châi)`,
    },
  ],
  table: {
    headers: ['', 'Утверждение (+)', 'Отрицание (−)', 'Вопрос (?)'],
    rows: [
      {
        label: 'Настоящее',
        cells: [
          { thai: 'ผมกิน', transcription: 'pǒm gin', russian: 'Я ем' },
          { thai: 'ผมไม่กิน', transcription: 'pǒm mâi gin', russian: 'Я не ем' },
          { thai: 'ผมกินไหม?', transcription: 'pǒm gin mǎi?', russian: 'Я ем?' },
        ],
      },
      {
        label: 'Прошедшее',
        cells: [
          { thai: 'ผมกินแล้ว', transcription: 'pǒm gin láew', russian: 'Я поел' },
          { thai: 'ผมไม่ได้กิน', transcription: 'pǒm mâi-dâi gin', russian: 'Я не ел' },
          { thai: 'ผมกินแล้วไหม?', transcription: 'pǒm gin láew mǎi?', russian: 'Я поел?' },
        ],
      },
      {
        label: 'Будущее',
        cells: [
          { thai: 'ผมจะกิน', transcription: 'pǒm jà gin', russian: 'Я буду есть' },
          { thai: 'ผมจะไม่กิน', transcription: 'pǒm jà mâi gin', russian: 'Я не буду есть' },
          { thai: 'ผมจะกินไหม?', transcription: 'pǒm jà gin mǎi?', russian: 'Я буду есть?' },
        ],
      },
    ],
  },
};
