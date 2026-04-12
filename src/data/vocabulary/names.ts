import type { Subject } from '../phrasePatterns';
import type { ObjectPronoun } from '../phrasePatterns';

// ============================================================
// Name — тайские личные имена
// ============================================================
export interface Name {
  thai: string;
  transcription: string;
  russian: string;         // "Сомчай", "Плой" и т.д.
  gender: 'masc' | 'fem';
  conjIndex: 0 | 1 | 2 | 3 | 4 | 5;  // для согласования глаголов
}

// ============================================================
// Мужские имена (4 шт) — из статистики DOPA по распространённости
// ============================================================
export const maleNames: Name[] = [
  { thai: 'สมชาย', transcription: 'sŏm-chaai', russian: 'Сомчай', gender: 'masc', conjIndex: 2 },   // 479 924 носителя — #1 в Таиланде
  { thai: 'ประเสริฐ', transcription: 'bpra-sèrt', russian: 'Прасерт', gender: 'masc', conjIndex: 2 },  // 268 094 — #3
  { thai: 'สมบูรณ์', transcription: 'sŏm-buun', russian: 'Сомбун', gender: 'masc', conjIndex: 2 },     // 248 205 — #4
  { thai: 'สมศักดิ์', transcription: 'sŏm-sàk', russian: 'Сомсак', gender: 'masc', conjIndex: 2 },      // из top-10 мужских имён
];

// ============================================================
// Женские имена (4 шт, включая Плой) — из статистики DOPA
// ============================================================
export const femaleNames: Name[] = [
  { thai: 'สมจิต', transcription: 'sŏm-jìt', russian: 'Сомчит', gender: 'fem', conjIndex: 2 },      // 281 050 — #2 в общем списке
  { thai: 'ปราณี', transcription: 'bpra-nii', russian: 'Прани', gender: 'fem', conjIndex: 2 },      // 171 060
  { thai: 'กาญจนา', transcription: 'gaan-jà-náa', russian: 'Канчана', gender: 'fem', conjIndex: 2 }, // 165 525
  { thai: 'ปอย', transcription: 'bpɔɔi', russian: 'Плой', gender: 'fem', conjIndex: 2 },             // популярное имя, остаётся по запросу
];

// ============================================================
// Объединённый массив
// ============================================================
export const allNames: Name[] = [...maleNames, ...femaleNames];

// ============================================================
// Helper: конвертировать Name → Subject
// ============================================================
export function nameToSubject(name: Name): Subject {
  return {
    thai: name.thai,
    transcription: name.transcription,
    russian: name.russian,
    conjIndex: name.conjIndex,
    gender: name.gender,
  };
}

// ============================================================
// Helper: конвертировать Name → ObjectPronoun
// Для начальной версии используем одинаковую форму для всех падежей
// (как в тайском — имена не склоняются)
// ============================================================
export function nameToObjectPronoun(name: Name): ObjectPronoun {
  return {
    thai: name.thai,
    transcription: name.transcription,
    russian: name.russian,
    russianAccusative: name.russian,
    russianDative: name.russian,
    register: 'neutral',
    conjIndex: name.conjIndex,
  };
}
