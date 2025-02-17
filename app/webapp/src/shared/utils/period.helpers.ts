import {
  add,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  sub,
} from 'date-fns';

import { PeriodSize } from '../types/types.posts';

interface PeriodRange {
  start: number;
  end: number;
}

export function getPeriodPretty(periodSize: PeriodSize) {
  switch (periodSize) {
    case 'day':
      return 'One day';
    case 'week':
      return 'One week';
    case 'month':
      return 'One month';
  }
}

export function getPeriodRange(
  now: number,
  shift: number,
  periodSize: PeriodSize
): PeriodRange {
  const currentDate = new Date(now);
  const shiftedDate =
    shift >= 0
      ? add(currentDate, { [periodSize + 's']: shift })
      : sub(currentDate, { [periodSize + 's']: Math.abs(shift) });

  let start: Date;
  let end: Date;

  switch (periodSize) {
    case 'day':
      start = startOfDay(shiftedDate);
      end = endOfDay(shiftedDate);
      break;
    case 'week':
      start = startOfWeek(shiftedDate, { weekStartsOn: 1 }); // Monday
      end = endOfWeek(shiftedDate, { weekStartsOn: 1 }); // Sunday
      break;
    case 'month':
      start = startOfMonth(shiftedDate);
      end = endOfMonth(shiftedDate);
      break;
    default:
      throw new Error(`Unsupported period size: ${periodSize}`);
  }

  return {
    start: start.getTime(),
    end: end.getTime(),
  };
}

export function getMonthAndYearOf(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

export function getShortDateString(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  return `${month} ${day}${suffix}`;
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}
