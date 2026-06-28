import {
  bookingDateTimeToMs,
  formatBookingRange,
  normalizeBookingDateTime,
} from '@/utils/bookingDateTime';

export interface BookingTimeRange {
  id?: string;
  eventName: string;
  startDate: string;
  endDate: string;
  status?: string;
}

/** Two ranges overlap if each starts before the other ends (adjacent times are allowed). */
export function doBookingRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const aStart = bookingDateTimeToMs(startA);
  const aEnd = bookingDateTimeToMs(endA);
  const bStart = bookingDateTimeToMs(startB);
  const bEnd = bookingDateTimeToMs(endB);
  return aStart < bEnd && bStart < aEnd;
}

export function isActiveBooking(status?: string): boolean {
  return status !== 'cancelled';
}

export function findOverlappingBooking(
  bookings: BookingTimeRange[],
  startDate: string,
  endDate: string,
  excludeId?: string,
): BookingTimeRange | undefined {
  const normStart = normalizeBookingDateTime(startDate);
  const normEnd = normalizeBookingDateTime(endDate);

  return bookings.find(
    (b) =>
      b.id !== excludeId &&
      isActiveBooking(b.status) &&
      doBookingRangesOverlap(normStart, normEnd, b.startDate, b.endDate),
  );
}

export function formatOverlapMessage(booking: BookingTimeRange): string {
  return `"${booking.eventName}" (${formatBookingRange(booking.startDate, booking.endDate)})`;
}
