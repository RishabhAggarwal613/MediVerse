/** YYYY-MM-DD in the user's local calendar (avoid UTC drift from `toISOString().slice(0, 10)`). */
export function localDateInputValue(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
