// Thai cities and countries for location-based phrase generation
// Used with verbs: อยู่ (жить), ไป (ехать), มา (приходить), เที่ยว (путешествовать), บิน (летать)

export interface Location {
  thai: string;
  transcription: string;
  russian: string;                // nominative: "Бангкок"
  russianPrepositional: string;   // "в Бангкоке" — for อยู่ (live/reside in)
  russianDirectional: string;     // "в Бангкок" — for ไป, มา, บิน (go/come/fly to)
  russianAround: string;          // "по Бангкоку" — for เที่ยว (travel around)
}

// 4 Thai cities
export const thaiCities: Location[] = [
  {
    thai: 'กรุงเทพ',
    transcription: 'grung-têp',
    russian: 'Бангкок',
    russianPrepositional: 'в Бангкоке',
    russianDirectional: 'в Бангкок',
    russianAround: 'по Бангкоку',
  },
  {
    thai: 'เชียงใหม่',
    transcription: 'chiang-mài',
    russian: 'Чиангмай',
    russianPrepositional: 'в Чиангмае',
    russianDirectional: 'в Чиангмай',
    russianAround: 'по Чиангмаю',
  },
  {
    thai: 'หาดใหญ่',
    transcription: 'hàat-yài',
    russian: 'Хатъяй',
    russianPrepositional: 'в Хатъяе',
    russianDirectional: 'в Хатъяй',
    russianAround: 'по Хатъяю',
  },
  {
    thai: 'พัทยา',
    transcription: 'pat-taa-yaa',
    russian: 'Паттайя',
    russianPrepositional: 'в Паттайе',
    russianDirectional: 'в Паттайю',
    russianAround: 'по Паттайе',
  },
];

// 4 countries (including Thailand)
export const countries: Location[] = [
  {
    thai: 'ไทย',
    transcription: 'tai',
    russian: 'Таиланд',
    russianPrepositional: 'в Таиланде',
    russianDirectional: 'в Таиланд',
    russianAround: 'по Таиланду',
  },
  {
    thai: 'จีน',
    transcription: 'jeen',
    russian: 'Китай',
    russianPrepositional: 'в Китае',
    russianDirectional: 'в Китай',
    russianAround: 'по Китаю',
  },
  {
    thai: 'ญี่ปุ่น',
    transcription: 'yîi-bpùn',
    russian: 'Япония',
    russianPrepositional: 'в Японии',
    russianDirectional: 'в Японию',
    russianAround: 'по Японии',
  },
  {
    thai: 'รัสเซีย',
    transcription: 'rát-sia',
    russian: 'Россия',
    russianPrepositional: 'в России',
    russianDirectional: 'в Россию',
    russianAround: 'по России',
  },
];

// All locations combined
export const allLocations: Location[] = [...thaiCities, ...countries];
