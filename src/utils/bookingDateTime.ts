import { format, parseISO } from 'date-fns';

/**
 * Booking times are wall-clock values (what the user picked in date/time inputs).
 * Supabase may return them with a Z suffix; we must not convert through local/UTC.
 */
export function normalizeBookingDateTime(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return trimmed;

  const [, date, hours, minutes, seconds = '00'] = match;
  return `${date}T${hours}:${minutes}:${seconds}`;
}

/** Orderable timestamp from wall-clock components (timezone-agnostic). */
export function bookingDateTimeToMs(value: string): number {
  const normalized = normalizeBookingDateTime(value);
  const [datePart, timePart = '00:00:00'] = normalized.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm, ss = 0] = timePart.split(':').map(Number);
  return Date.UTC(y, m - 1, d, hh, mm, ss);
}

export function compareBookingDateTime(a: string, b: string): number {
  return bookingDateTimeToMs(a) - bookingDateTimeToMs(b);
}

export function formatBookingDate(dateTime: string): string {
  const datePart = normalizeBookingDateTime(dateTime).split('T')[0];
  return format(parseISO(datePart), 'dd MMM yyyy');
}

export function formatBookingTime(dateTime: string): string {
  return normalizeBookingDateTime(dateTime).split('T')[1]?.substring(0, 5) ?? '00:00';
}

export function formatBookingRange(startDate: string, endDate: string): string {
  const startDay = formatBookingDate(startDate);
  const endDay = formatBookingDate(endDate);
  const startTime = formatBookingTime(startDate);
  const endTime = formatBookingTime(endDate);

  if (startDay === endDay) {
    return `${startDay}, ${startTime} – ${endTime}`;
  }
  return `${startDay} ${startTime} – ${endDay} ${endTime}`;
}

export function splitBookingDateTime(dt: string) {
  const normalized = normalizeBookingDateTime(dt);
  const [date, timePart = '10:00:00'] = normalized.split('T');
  return { date, time: timePart.substring(0, 5) };
}

export function formatBookingTime12h(dateTime: string): string {
  const time = formatBookingTime(dateTime);
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
}

export function formatBookingDateRange(startDate: string, endDate: string): string {
  const startDay = normalizeBookingDateTime(startDate).split('T')[0];
  const endDay = normalizeBookingDateTime(endDate).split('T')[0];
  if (startDay === endDay) {
    return formatBookingDate(startDate);
  }
  return `${formatBookingDate(startDate)} - ${formatBookingDate(endDate)}`;
}

export function formatBookingTimeRange(startDate: string, endDate: string): string {
  return `${formatBookingTime12h(startDate)} - ${formatBookingTime12h(endDate)}`;
}
