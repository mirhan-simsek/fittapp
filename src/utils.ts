import type { Lang } from './i18n';

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const pad = (n: number) => String(n).padStart(2, '0');

export function dateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

/** Monday of the week containing the given date (local time). */
export function startOfWeek(d: Date = new Date()): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - diff);
  return x;
}

export function num(s: string): number {
  const v = parseFloat(s.replace(',', '.'));
  return Number.isFinite(v) ? v : 0;
}

export function fmtDate(key: string, lang: Lang, opts?: Intl.DateTimeFormatOptions): string {
  return parseKey(key).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', opts ?? { day: 'numeric', month: 'short' });
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
