// Fisher-Yates shuffle algorithm
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Get random items from array
export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, count);
}

// Get random items excluding specific item, then include it
export function getOptionsWithCorrect<T>(
  allItems: T[],
  correctItem: T,
  totalCount: number,
  keyFn: (item: T) => string
): T[] {
  const correctKey = keyFn(correctItem);
  const otherItems = allItems.filter((item) => keyFn(item) !== correctKey);
  const randomOthers = getRandomItems(otherItems, totalCount - 1);
  return shuffle([correctItem, ...randomOthers]);
}
