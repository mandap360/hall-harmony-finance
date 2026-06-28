import { parseISO } from 'date-fns';
import { normalizeBookingDateTime } from '@/utils/bookingDateTime';

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-blue-500 text-white',
  pending: 'bg-yellow-500 text-white',
  cancelled: 'bg-red-500 text-white',
};

export function getBookingStatusColor(status: string): string {
  return BOOKING_STATUS_COLORS[status] ?? BOOKING_STATUS_COLORS.confirmed;
}

export function canEditBooking(status?: string): boolean {
  return status !== 'cancelled';
}

export function canCancelBooking(startDate: string, status?: string): boolean {
  const now = new Date();
  const datePart = normalizeBookingDateTime(startDate).split('T')[0];
  return parseISO(datePart) >= now && status !== 'cancelled';
}

export function canProcessBookingRefund(booking: {
  status?: string;
  rentReceived?: number;
  secondaryIncomeNet?: number;
}): boolean {
  const totalPaid = (booking.rentReceived || 0) + (booking.secondaryIncomeNet || 0);
  return booking.status === 'cancelled' && totalPaid > 0;
}
