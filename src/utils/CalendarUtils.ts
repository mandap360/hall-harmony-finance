import { eachDayOfInterval, isSameDay, parseISO } from "date-fns";

/**
 * For a booking, returns an array of objects for each day it spans,
 * marking whether it's the start or end day.
 * Always parses date as local date (no time zone offset).
 */
export function splitBookingAcrossDays(booking: any) {
  // Always use only the date part -- never the time part!
  // Handles both "2025-08-06" and "2025-08-06T00:00:00" formats.
  const startDateString = booking.startDate.split("T")[0];
  const endDateString = booking.endDate.split("T")[0];

  // parseISO("2025-08-06") gives local midnight
  const start = parseISO(startDateString);
  const end = parseISO(endDateString);

  const days = eachDayOfInterval({ start, end });
  return days.map((date: Date) => ({
    date,
    isStart: isSameDay(date, start),
    isEnd: isSameDay(date, end),
    booking,
  }));
}