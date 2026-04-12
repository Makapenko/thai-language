import type { Subject, Verb, ObjectPronoun } from '../../phrasePatterns';
import type { LocationComplement, IdentityComplement } from '../../phrasePatterns.lesson3';

// ============================================================
// SUBJECTS (местоимения из уроков 1 и 2)
// ============================================================

export const pronouns: Subject[] = [
  // Lesson 1
  { thai: 'ผม', transcription: 'pǒm', russian: 'я', conjIndex: 0, gender: 'masc' },
  { thai: 'ฉัน', transcription: 'chǎn', russian: 'я', conjIndex: 0, gender: 'fem' },
  { thai: 'คุณ', transcription: 'kun', russian: 'ты', conjIndex: 1, gender: 'masc' },
  { thai: 'เขา', transcription: 'kǎo', russian: 'он', conjIndex: 2, gender: 'masc' },
  { thai: 'เขา', transcription: 'kǎo', russian: 'она', conjIndex: 2, gender: 'fem' },
  { thai: 'เรา', transcription: 'rao', russian: 'мы', conjIndex: 3, gender: 'plural' },
  { thai: 'คุณ', transcription: 'kun', russian: 'вы', conjIndex: 4, gender: 'plural' },
  { thai: 'พวกเขา', transcription: 'pûak-kǎo', russian: 'они', conjIndex: 5, gender: 'plural' },
  // Lesson 2
  { thai: 'ดิฉัน', transcription: 'dì-chǎn', russian: 'я', conjIndex: 0, gender: 'fem', register: 'formal' },
  { thai: 'ท่าน', transcription: 'thâan', russian: 'вы', conjIndex: 4, gender: 'plural', register: 'formal' },
  { thai: 'เธอ', transcription: 'thə̌ə', russian: 'ты', conjIndex: 1, gender: 'masc', register: 'informal' },
];

// ============================================================
// STATE VERBS (เป็น / อยู่ / คือ)
// ============================================================

export const stateVerbs: Verb[] = [
  {
    thai: 'อยู่',
    transcription: 'yùu',
    infinitive: 'находиться',
    present: ['нахожусь', 'находишься', 'находится', 'находимся', 'находитесь', 'находятся'],
    past: ['находился', 'находилась', 'находились'],
    future: ['буду находиться', 'будешь находиться', 'будет находиться', 'будем находиться', 'будете находиться', 'будут находиться'],
    continuous: ['нахожусь', 'находишься', 'находится', 'находимся', 'находитесь', 'находятся'],
  },
  {
    thai: 'เป็น',
    transcription: 'bpen',
    infinitive: 'быть (кем?)',
    present: ['являюсь', 'являешься', 'является', 'являемся', 'являетесь', 'являются'],
    past: ['был', 'была', 'были'],
    future: ['буду', 'будешь', 'будет', 'будем', 'будете', 'будут'],
    continuous: ['являюсь', 'являешься', 'является', 'являемся', 'являетесь', 'являются'],
  },
  {
    thai: 'คือ',
    transcription: 'kheuu',
    infinitive: 'являться (это)',
    present: ['есть', 'есть', 'есть', 'есть', 'есть', 'есть'],
    past: ['было', 'было', 'было'],
    future: ['будет', 'будет', 'будет', 'будет', 'будет', 'будет'],
    continuous: ['есть', 'есть', 'есть', 'есть', 'есть', 'есть'],
  },
];

// ============================================================
// LOCATION COMPLEMENTS (для อยู่ + место)
// ============================================================

export const locationComplements: LocationComplement[] = [
  { thai: 'บ้าน', transcription: 'bâan', russian: 'дом', russianPrepositional: 'дома' },
  { thai: 'โรงเรียน', transcription: 'roong-rian', russian: 'школа', russianPreposential: 'в школе' },
  { thai: 'พิพิธภัณฑ์', transcription: 'phí-pít-tá-pan', russian: 'музей', russianPrepositional: 'в музее' },
  { thai: 'ห้อง', transcription: 'hông', russian: 'комната', russianPrepositional: 'в комнате' },
  { thai: 'รถ', transcription: 'rót', russian: 'машина', russianPrepositional: 'в машине' },
  { thai: 'โรงหนัง', transcription: 'rǒng-nǎng', russian: 'кинотеатр', russianPrepositional: 'в кинотеатре' },
  { thai: 'โรงละคร', transcription: 'rǒng lá-kɔɔn', russian: 'театр', russianPrepositional: 'в театре' },
  { thai: 'ห้องใต้ดิน', transcription: 'hông tâi-din', russian: 'подвал', russianPrepositional: 'в подвале' },
  { thai: 'คอนเสิร์ต', transcription: 'kon-sə̀ət', russian: 'концерт', russianPrepositional: 'на концерте' },
  { thai: 'โอเปรา', transcription: 'oo-bpee-raa', russian: 'опера', russianPrepositional: 'на опере' },
  { thai: 'นิทรรศการ', transcription: 'ní-tát-sà-gaan', russian: 'выставка', russianPrepositional: 'на выставке' },
  { thai: 'การประชุม', transcription: 'gaan-bprà-chum', russian: 'встреча', russianPrepositional: 'на встрече' },
  { thai: 'การนำเสนอ', transcription: 'gaan nam-sà-nə̌ə', russian: 'презентация', russianPrepositional: 'на презентации' },
];

// ============================================================
// IDENTITY COMPLEMENTS (สำหรับ เป็น / คือ)
// ============================================================

export const identityComplements: IdentityComplement[] = [
  { thai: 'ครู', transcription: 'kruu', russian: 'учитель' },
  { thai: 'นักเรียน', transcription: 'nák-rian', russian: 'ученик' },
  { thai: 'หมอ', transcription: "mǒr", russian: 'врач' },
  { thai: 'คนขับ', transcription: 'kon-kàp', russian: 'водитель' },
  { thai: 'พ่อครัว', transcription: 'pâo-kruua', russian: 'повар' },
  { thai: 'พนักงาน', transcription: 'pa-nák-ngaan', russian: 'сотрудник' },
  { thai: 'เพื่อน', transcription: 'phʉ̂an', russian: 'друг' },
  { thai: 'คนไทย', transcription: 'kon-tai', russian: 'таец / тайка' },
  { thai: 'คนรัสเซีย', transcription: 'kon-rát-sia', russian: 'россиянин / россиянка' },
];

// ============================================================
// LOCATION NOUNS (для существительных-локаций, используемых как объекты)
// ============================================================

export const locationNouns: { thai: string; transcription: string; russian: string; russianAccusative: string }[] = [
  { thai: 'บ้าน', transcription: 'bâan', russian: 'дом', russianAccusative: 'дом' },
  { thai: 'โรงเรียน', transcription: 'roong-rian', russian: 'школа', russianAccusative: 'школу' },
  { thai: 'พิพิธภัณฑ์', transcription: 'phí-pít-tá-pan', russian: 'музей', russianAccusative: 'музей' },
  { thai: 'ห้อง', transcription: 'hông', russian: 'комната', russianAccusative: 'комнату' },
  { thai: 'รถ', transcription: 'rót', russian: 'машина', russianAccusative: 'машину' },
  { thai: 'โรงหนัง', transcription: 'rǒng-nǎng', russian: 'кинотеатр', russianAccusative: 'кинотеатр' },
  { thai: 'โรงละคร', transcription: 'rǒng lá-kɔɔn', russian: 'театр', russianAccusative: 'театр' },
  { thai: 'คอนเสิร์ต', transcription: 'kon-sə̀ət', russian: 'концерт', russianAccusative: 'концерт' },
  { thai: 'โอเปรา', transcription: 'oo-bpee-raa', russian: 'опера', russianAccusative: 'оперу' },
  { thai: 'นิทรรศการ', transcription: 'ní-tát-sà-gaan', russian: 'выставка', russianAccusative: 'выставку' },
  { thai: 'การประชุม', transcription: 'gaan-bprà-chum', russian: 'встреча', russianAccusative: 'встречу' },
  { thai: 'การนำเสนอ', transcription: 'gaan nam-sà-nə̌ə', russian: 'презентация', russianAccusative: 'презентацию' },
  { thai: 'ห้องใต้ดิน', transcription: 'hông tâi-din', russian: 'подвал', russianAccusative: 'подвал' },
];

// ============================================================
// AGGREGATE (для сборки)
// ============================================================

export const lesson3Vocab = {
  pronouns,
  stateVerbs,
  locationComplements,
  identityComplements,
  locationNouns,
};
