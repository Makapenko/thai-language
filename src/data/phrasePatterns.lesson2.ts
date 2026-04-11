import type { PhraseStructure, SentenceType } from './types';
import type { Subject, Verb } from './phrasePatterns';
import { TENSE_MARKERS } from './phrasePatterns';
import { capitalizeFirst } from '../utils/capitalizeFirst';

// ============================================================
// QuestionWord — тип для вопросительных слов
// ============================================================
export interface QuestionWord {
  thai: string;
  transcription: string;
  russian: string;
}

// ============================================================
// Pattern interface for open questions
// ============================================================
interface QuestionPattern {
  type: SentenceType;
  /** Какое вопросительное слово использует этот паттерн (по тайскому тексту) */
  questionWordThai: string;
  russianTemplate: (subject: Subject, verb: Verb, questionWord: QuestionWord) => string;
  buildStructure: (subject: Subject, verb: Verb, questionWord: QuestionWord) => PhraseStructure[];
  buildThai: (subject: Subject, verb: Verb, questionWord: QuestionWord) => string;
  buildTranscription: (subject: Subject, verb: Verb, questionWord: QuestionWord) => string;
}

// ============================================================
// Helper: get subject label (same as in phrasePatterns.ts)
// ============================================================
function getSubjectLabel(subject: Subject): string {
  if (subject.russian.startsWith('я')) {
    // Если уже есть пометка (грубое, форм. и т.д.) — использовать как есть
    if (subject.russian.includes('(')) {
      return subject.russian;
    }
    // Иначе добавить гендерную пометку
    switch (subject.gender) {
      case 'masc':
        return 'я (муж.)';
      case 'fem':
        return 'я (жен.)';
      default:
        return 'я';
    }
  }
  return subject.russian;
}

// ============================================================
// Специальный глагол для паттерна «Где?» — находится/нахожусь/находишься и т.д.
// ============================================================
const verbYuu: Verb = {
  thai: 'อยู่',
  transcription: 'yùu',
  infinitive: 'находиться',
  present: ['нахожусь', 'находишься', 'находится', 'находимся', 'находитесь', 'находятся'],
  past: ['находился', 'находилась', 'находились'],
  future: ['буду находиться', 'будешь находиться', 'будет находиться', 'будем находиться', 'будете находиться', 'будут находиться'],
  continuous: ['нахожусь', 'находишься', 'находится', 'находимся', 'находитесь', 'находятся'],
};

// ============================================================
// QUESTION PATTERNS — открытые вопросы с вопросительными словами
// Каждый паттерн привязан к КОНКРЕТНОМУ вопросительному слову
// ============================================================
export const questionPatterns: QuestionPattern[] = [

  // ─── Кто? (кто = подлежащее) — ใคร + verb — Кто приходит? ───
  // В тайском: ใคร = подлежащее, глагол не меняется
  // В русском: "Кто" = 3-е лицо ед.ч. → глагол в 3-м лице (ест, пьёт, идёт)
  {
    type: 'question_who_subject',
    questionWordThai: 'ใคร',
    russianTemplate: (_s, v, qw) => capitalizeFirst(`${qw.russian} ${v.present[2]}?`),
    buildStructure: (_s, v, qw) => [
      { groupId: 'questionWord', thai: qw.thai, transcription: qw.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
    ],
    buildThai: (_s, v, qw) => `${qw.thai}${v.thai}`,
    buildTranscription: (_s, v, qw) => `${qw.transcription} ${v.transcription}`,
  },

  // ─── Кто? (кто = дополнение) — subject + verb + ใคร — Кого ты видишь? ───
  {
    type: 'question_who',
    questionWordThai: 'ใคร',
    // В русском — "Кого" (винительный падеж), т.к. это дополнение
    russianTemplate: (s, v, _qw) => capitalizeFirst(`Кого ${getSubjectLabel(s)} ${v.present[s.conjIndex]}?`),
    buildStructure: (s, v, qw) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'questionWord', thai: qw.thai, transcription: qw.transcription },
    ],
    buildThai: (s, v, qw) => `${s.thai}${v.thai}${qw.thai}`,
    buildTranscription: (s, v, qw) => `${s.transcription} ${v.transcription} ${qw.transcription}`,
  },

  // ─── Что? — subject + verb + อะไร — Что ты делаешь? ───
  {
    type: 'question_what',
    questionWordThai: 'อะไร',
    russianTemplate: (s, v, qw) => capitalizeFirst(`${qw.russian} ${getSubjectLabel(s)} ${v.present[s.conjIndex]}?`),
    buildStructure: (s, v, qw) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'questionWord', thai: qw.thai, transcription: qw.transcription },
    ],
    buildThai: (s, v, qw) => `${s.thai}${v.thai}${qw.thai}`,
    buildTranscription: (s, v, qw) => `${s.transcription} ${v.transcription} ${qw.transcription}`,
  },

  // ─── Когда? — subject + จะ + verb + เมื่อไหร่ — Когда ты поедешь? ───
  {
    type: 'question_when',
    questionWordThai: 'เมื่อไหร่',
    russianTemplate: (s, v, qw) => capitalizeFirst(`${qw.russian} ${getSubjectLabel(s)} ${v.future[s.conjIndex]}?`),
    buildStructure: (s, v, qw) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.future.thai, transcription: TENSE_MARKERS.future.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'questionWord', thai: qw.thai, transcription: qw.transcription },
    ],
    buildThai: (s, v, qw) => `${s.thai}${TENSE_MARKERS.future.thai}${v.thai}${qw.thai}`,
    buildTranscription: (s, v, qw) => `${s.transcription} ${TENSE_MARKERS.future.transcription} ${v.transcription} ${qw.transcription}`,
  },

  // ─── Где? — subject + อยู่ + ที่ไหน — Где ты находишься? ───
  {
    type: 'question_where',
    questionWordThai: 'ที่ไหน',
    russianTemplate: (s, _v, qw) => capitalizeFirst(`${qw.russian} ${getSubjectLabel(s)} ${verbYuu.present[s.conjIndex]}?`),
    buildStructure: (s, _v, qw) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: 'อยู่', transcription: 'yùu' },
      { groupId: 'questionWord', thai: qw.thai, transcription: qw.transcription },
    ],
    buildThai: (s, _v, qw) => `${s.thai}อยู่${qw.thai}`,
    buildTranscription: (s, _v, qw) => `${s.transcription} yùu ${qw.transcription}`,
  },

  // ─── Почему? — ทำไม + subject + ไม่ + verb — Почему ты не приходишь? ───
  {
    type: 'question_why',
    questionWordThai: 'ทำไม',
    russianTemplate: (s, v, qw) => capitalizeFirst(`${qw.russian} ${getSubjectLabel(s)} не ${v.present[s.conjIndex]}?`),
    buildStructure: (s, v, qw) => [
      { groupId: 'questionWord', thai: qw.thai, transcription: qw.transcription },
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.negativePresent.thai, transcription: TENSE_MARKERS.negativePresent.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
    ],
    buildThai: (s, v, qw) => `${qw.thai}${s.thai}${TENSE_MARKERS.negativePresent.thai}${v.thai}`,
    buildTranscription: (s, v, qw) => `${qw.transcription} ${s.transcription} ${TENSE_MARKERS.negativePresent.transcription} ${v.transcription}`,
  },

  // ─── Как? — subject + จะ + verb + อย่างไร — Как ты поедешь? ───
  {
    type: 'question_how',
    questionWordThai: 'อย่างไร',
    russianTemplate: (s, v, qw) => capitalizeFirst(`${qw.russian} ${getSubjectLabel(s)} ${v.future[s.conjIndex]}?`),
    buildStructure: (s, v, qw) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.future.thai, transcription: TENSE_MARKERS.future.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'questionWord', thai: qw.thai, transcription: qw.transcription },
    ],
    buildThai: (s, v, qw) => `${s.thai}${TENSE_MARKERS.future.thai}${v.thai}${qw.thai}`,
    buildTranscription: (s, v, qw) => `${s.transcription} ${TENSE_MARKERS.future.transcription} ${v.transcription} ${qw.transcription}`,
  },
];
