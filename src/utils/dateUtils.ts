/**
 * Get current date in ISO format (YYYY-MM-DD)
 */
export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get current ISO timestamp
 */
export const getCurrentISOTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Get current timestamp in milliseconds
 */
export const getCurrentTimestamp = (): number => {
  return new Date().getTime();
};

/**
 * Format date to YYYY-MM-DD
 * @param date Date object
 * @returns Formatted date string
 */
export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get current year-month in YYYY-MM format
 */
export const getCurrentYearMonth = (): string => {
  return new Date().toISOString().slice(0, 7);
};

/**
 * Get number of days in a month
 * @param year Year
 * @param month Month (1-12)
 * @returns Number of days
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

/**
 * Get day of month from date string
 * @param dateString Date string
 * @returns Day of month
 */
export const getDayOfMonth = (dateString: string): number => {
  return new Date(dateString).getDate();
};

/**
 * Update year-month by delta months
 * @param currentYearMonth Current YYYY-MM string
 * @param delta Months to add (can be negative)
 * @returns New YYYY-MM string
 */
export const getUpdatedYearMonth = (currentYearMonth: string, delta: number): string => {
  const [year, month] = currentYearMonth.split('-').map(Number);
  const newDate = new Date(year, month - 1 + delta, 1);
  const newYear = newDate.getFullYear();
  const newMonth = newDate.getMonth() + 1;
  return `${newYear}-${String(newMonth).padStart(2, '0')}`;
};

/**
 * Calculate difference between two dates in days
 * @param dateA First date (later)
 * @param dateB Second date (earlier)
 * @returns Number of days
 */
export const getDaysDifference = (dateA: Date, dateB: Date): number => {
  return Math.floor((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Format date with locale
 * @param dateString Date string
 * @param format Locale
 * @param options Format options
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  format: string = 'ru-RU',
  options?: Intl.DateTimeFormatOptions
): string => {
  return new Date(dateString).toLocaleDateString(format, options);
};

/**
 * Format date with options
 * @param dateString Date string
 * @param options Format options
 * @param format Locale
 * @returns Formatted date string
 */
export const formatDateWithOptions = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions,
  format: string = 'ru-RU'
): string => {
  return new Date(dateString).toLocaleDateString(format, options || {
    day: 'numeric',
    month: 'long',
  });
};

/**
 * Format time from seconds to readable format
 * @param seconds Number of seconds
 * @param showHours Always show hours (even if 0)
 * @returns Formatted time string (MM:SS or H:MM:SS)
 */
export const formatTimeFromSeconds = (seconds: number, showHours: boolean = false): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0 || showHours) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Compare dates in descending order
 * @param dateA First date
 * @param dateB Second date
 * @returns Comparison result
 */
export const compareDatesDesc = (dateA: string, dateB: string): number => {
  return new Date(dateB).getTime() - new Date(dateA).getTime();
};

/**
 * Generate time-based ID
 * @param prefix Prefix for the ID
 * @returns ID string in format prefix-timestamp
 */
export const generateTimeBasedId = (prefix: string = 'id'): string => {
  return `${prefix}-${getCurrentTimestamp()}`;
};

/**
 * Format date to short format DD.MM
 * @param dateString Date string
 * @returns Short date string
 */
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}`;
};

/**
 * Get short month name in Russian
 * @param dateString Date string
 * @returns Short month name (e.g., 'янв')
 */
export const getShortMonthName = (dateString: string): string => {
  const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const date = new Date(dateString);
  return monthNames[date.getMonth()];
};
