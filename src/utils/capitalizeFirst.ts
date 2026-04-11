/**
 * Capitalizes the first letter of a string, keeping the rest unchanged.
 * Example: "что ты делаешь?" → "Что ты делаешь?"
 */
export function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
