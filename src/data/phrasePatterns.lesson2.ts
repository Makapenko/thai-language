import type { PhraseStructure, SentenceType } from './types';
import type { Subject, Verb } from './phrasePatterns';
import { TENSE_MARKERS } from './phrasePatterns';

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
  russianTemplate: (subject: Subject, verb: Verb, questionWord: QuestionWord) => string;
  buildStructure: (subject: Subject, verb: Verb, questionWord: QuestionWord) => PhraseStructure[];
  buildThai: (subject: Subject, verb: Verb, questionWord: QuestionWord) => string;
  buildTranscription: (subject: Subject, verb: Verb, questionWord: QuestionWord) => string;
}

// ============================================================
// Helper: get subject label (same as in phrasePatterns.ts)
// ============================================================
function getSubjectLabel(subject: Subject): string {
  if (subject.russian === 'Я') {
    switch (subject.gender) {
      case 'masc':
        return `${subject.russian} (муж.)`;
      case 'fem':
        return `${subject.russian} (жен.)`;
      default:
        return subject.russian;
    }
  }
  return subject.russian;
}

// ============================================================
// QUESTION PATTERNS — открытые вопросы с вопросительными словами (6 штук)
// ============================================================
export const questionPatterns: QuestionPattern[] = [
  // question_who: subject + verb + ใคร — Кого ты видишь?
  {
    type: 'question_who',
    russianTemplate: (s, v, qw) => `${getSubjectLabel(s)} ${v.present[s.conjIndex]} ${qw.russian}?`,
    buildStructure: (s, v, qw) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'questionWord', thai: qw.thai, transcription: qw.transcription },
    ],
    buildThai: (s, v, qw) => `${s.thai}${v.thai}${qw.thai}`,
    buildTranscription: (s, v, qw) => `${s.transcription} ${v.transcription} ${qw.transcription}`,
  },

  // question_what: subject + verb + อะไร — Что ты делаешь?
  {
    type: 'question_what',
    russianTemplate: (s, v, qw) => `${getSubjectLabel(s)} ${v.present[s.conjIndex]} ${qw.russian}?`,
    buildStructure: (s, v, qw) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'questionWord', thai: qw.thai, transcription: qw.transcription },
    ],
    buildThai: (s, v, qw) => `${s.thai}${v.thai}${qw.thai}`,
    buildTranscription: (s, v, qw) => `${s.transcription} ${v.transcription} ${qw.transcription}`,
  },

  // question_when: subject + verb + เมื่อไหร่ — Когда он поедет?
  {
    type: 'question_when',
    russianTemplate: (s, v, qw) => `${getSubjectLabel(s)} ${v.future[s.conjIndex]} ${qw.russian}?`,
    buildStructure: (s, v, qw) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.future.thai, transcription: TENSE_MARKERS.future.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
      { groupId: 'questionWord', thai: qw.thai, transcription: qw.transcription },
    ],
    buildThai: (s, v, qw) => `${s.thai}${TENSE_MARKERS.future.thai}${v.thai}${qw.thai}`,
    buildTranscription: (s, v, qw) => `${s.transcription} ${TENSE_MARKERS.future.transcription} ${v.transcription} ${qw.transcription}`,
  },

  // question_where: subject + อยู่ + ที่ไหน — Где ты находишься?
  {
    type: 'question_where',
    russianTemplate: (s, _v, qw) => `${getSubjectLabel(s)} находится ${qw.russian}?`,
    buildStructure: (s, _v, qw) => [
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'verb', thai: 'อยู่', transcription: 'yùu' },
      { groupId: 'questionWord', thai: qw.thai, transcription: qw.transcription },
    ],
    buildThai: (s, _v, qw) => `${s.thai}อยู่${qw.thai}`,
    buildTranscription: (s, _v, qw) => `${s.transcription} yùu ${qw.transcription}`,
  },

  // question_why: ทำไม + subject + tense + verb — Почему он не пришёл?
  {
    type: 'question_why',
    russianTemplate: (s, v, qw) => `${qw.russian} ${getSubjectLabel(s)} ไม่ ${v.present[s.conjIndex]}?`,
    buildStructure: (s, v, qw) => [
      { groupId: 'questionWord', thai: qw.thai, transcription: qw.transcription },
      { groupId: 'subject', thai: s.thai, transcription: s.transcription },
      { groupId: 'tense', thai: TENSE_MARKERS.negativePresent.thai, transcription: TENSE_MARKERS.negativePresent.transcription },
      { groupId: 'verb', thai: v.thai, transcription: v.transcription },
    ],
    buildThai: (s, v, qw) => `${qw.thai}${s.thai}${TENSE_MARKERS.negativePresent.thai}${v.thai}`,
    buildTranscription: (s, v, qw) => `${qw.transcription} ${s.transcription} ${TENSE_MARKERS.negativePresent.transcription} ${v.transcription}`,
  },

  // question_how: subject + verb + อย่างไร — Как ты поедешь?
  {
    type: 'question_how',
    russianTemplate: (s, v, qw) => `${getSubjectLabel(s)} ${v.future[s.conjIndex]} ${qw.russian}?`,
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
