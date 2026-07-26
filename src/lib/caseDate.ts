// Case dates are stored as "YYYY-MM-DD" and always treated as local dates.
// Parsing with `new Date("2026-07-11")` would read it as UTC midnight and can
// land on the previous day in western timezones, so build the date explicitly.

export function toISODate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Preops are done the day before, so a new case defaults to tomorrow. */
export function defaultCaseDate(today: Date = new Date()): string {
  return toISODate(addDays(today, 1));
}

/** Next Monday - handy when preopping Friday/Saturday for a Monday list. */
export function nextMonday(from: Date = new Date()): string {
  const daysUntilMonday = ((8 - from.getDay()) % 7) || 7;
  return toISODate(addDays(from, daysUntilMonday));
}

/** "07/11/26" */
export function formatShortDate(iso: string): string {
  const date = parseISODate(iso);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

/** "Saturday" - shown next to the date so a wrong day is obvious at a glance. */
export function formatWeekday(iso: string): string {
  return parseISODate(iso).toLocaleDateString(undefined, { weekday: 'long' });
}

/** "07/11/26; Case 1" */
export function buildCaseLabel(caseDate: string, caseNumber: number): string {
  return `${formatShortDate(caseDate)}; Case ${caseNumber}`;
}

/** The label to show for a case: the custom override if set, else the default. */
export function displayCaseLabel(preopCase: {
  caseDate: string;
  caseNumber: number;
  customLabel?: string;
}): string {
  const base = buildCaseLabel(preopCase.caseDate, preopCase.caseNumber);
  return preopCase.customLabel ? `${base} - ${preopCase.customLabel}` : base;
}
