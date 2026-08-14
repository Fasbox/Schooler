import type { Modality } from './index.js';

export interface WeeklyClass {
  id: string;
  subject_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  modality: Modality;
  classroom: string | null;
  subject: { id: string; name: string; color: string };
}

export interface BogotaContext {
  date: string;
  tomorrow: string;
  weekday: number;
  minutes: number;
  afterFive: boolean;
  weekStart: string;
  weekEnd: string;
}

function dateParts(now: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return { year: Number(value('year')), month: Number(value('month')), day: Number(value('day')), hour: Number(value('hour')), minute: Number(value('minute')), weekdayName: value('weekday') };
}

function addLocalDays(year: number, month: number, day: number, amount: number) {
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return date.toISOString().slice(0, 10);
}

export function getBogotaContext(now = new Date()): BogotaContext {
  const local = dateParts(now);
  const weekdayMap: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const weekday = weekdayMap[local.weekdayName] ?? 1;
  return {
    date: addLocalDays(local.year, local.month, local.day, 0),
    tomorrow: addLocalDays(local.year, local.month, local.day, 1),
    weekday,
    minutes: local.hour * 60 + local.minute,
    afterFive: local.hour >= 17,
    weekStart: addLocalDays(local.year, local.month, local.day, 1 - weekday),
    weekEnd: addLocalDays(local.year, local.month, local.day, 7 - weekday),
  };
}

const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

export function findCurrentClass(classes: WeeklyClass[], now = new Date()) {
  const context = getBogotaContext(now);
  return classes.find((item) => item.weekday === context.weekday && toMinutes(item.start_time) <= context.minutes && context.minutes < toMinutes(item.end_time)) ?? null;
}

export function findNextClass(classes: WeeklyClass[], now = new Date()) {
  const context = getBogotaContext(now);
  const local = dateParts(now);
  const candidates = classes.flatMap((item) => {
    let daysAhead = (item.weekday - context.weekday + 7) % 7;
    if (daysAhead === 0 && toMinutes(item.start_time) <= context.minutes) daysAhead = 7;
    const date = addLocalDays(local.year, local.month, local.day, daysAhead);
    const startsAt = new Date(`${date}T${item.start_time.slice(0, 5)}:00-05:00`);
    return [{ ...item, starts_at: startsAt.toISOString(), minutes_until: Math.max(0, Math.round((startsAt.getTime() - now.getTime()) / 60_000)) }];
  });
  return candidates.sort((a, b) => a.minutes_until - b.minutes_until)[0] ?? null;
}

export function greetingForBogota(now = new Date()) {
  const hour = Math.floor(getBogotaContext(now).minutes / 60);
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}
