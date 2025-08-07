import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, differenceInCalendarDays, parseISO } from "date-fns";
import { splitBookingAcrossDays } from "@/utils/CalendarUtils"; // unchanged

interface BookingCalendarViewProps {
  bookings: any[];
  currentDate: Date;
  onEditBooking: (booking: any) => void;
  onCancelBooking?: (bookingId: string) => void;
  onProcessRefund?: (booking: any) => void;
}

// Utility: Returns the index of the day in the visible grid (0-41)
function getDayGridIndex(day: Date, gridDays: Date[]) {
  return gridDays.findIndex(d => isSameDay(d, day));
}

// Utility: Returns the number of grid columns (days) until the booking ends or week ends
function getBookingSpanInWeek(startIndex: number, bookingEnd: Date, gridDays: Date[]) {
  let maxSpan = 1;
  for (let i = startIndex + 1; i < gridDays.length && maxSpan < 7; i++, maxSpan++) {
    if (gridDays[i].getDay() === 0) break; // Sunday, new week
    if (gridDays[i] > bookingEnd) break;
  }
  return maxSpan;
}

export const BookingCalendarView = ({
  bookings,
  currentDate,
  onEditBooking,
  onCancelBooking,
  onProcessRefund
}: BookingCalendarViewProps) => {

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Map of day string to booking(s) that start on that day
  const dayStrToBookings = new Map<string, any[]>();
  bookings.forEach(booking => {
    const startStr = booking.startDate.split('T')[0];
    if (!dayStrToBookings.has(startStr)) dayStrToBookings.set(startStr, []);
    dayStrToBookings.get(startStr)!.push(booking);
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-border">
        {/* Day headers */}
        {weekDays.map((day) => (
          <div key={day} className="bg-muted p-3 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Calendar cells */}
        {days.map((day, gridIdx) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const dayStr = format(day, 'yyyy-MM-dd');
          const bookingsStartingToday = dayStrToBookings.get(dayStr) || [];

          return (
            <div
              key={day.toISOString()}
              className={`relative bg-background min-h-[60px] px-0 pb-0 pt-2 border border-border ${!isCurrentMonth ? 'text-muted-foreground/70' : ''}`}
              style={{overflow: "visible"}}
            >
              <div className="text-sm font-medium mb-1 pl-2">{format(day, "d")}</div>
              <div className="flex flex-col gap-1 relative z-10">
                {/* Only render bars for bookings starting today */}
                {bookingsStartingToday.map((booking, idx) => {
                  const bookingStart = parseISO(booking.startDate.split('T')[0]);
                  const bookingEnd = parseISO(booking.endDate.split('T')[0]);
                  // Compute how many days to span in this row (not to cross week boundary)
                  const col = day.getDay();
                  const daysLeftInWeek = 7 - col;
                  const daysLeftInBooking = differenceInCalendarDays(bookingEnd, bookingStart) + 1;
                  const span = Math.min(daysLeftInWeek, daysLeftInBooking);

                  // Absolute position pill to overlay borders (prevent border line between cells)
                  return (
                    <div
                      key={booking.id}
                      className="absolute left-0 top-2 text-xs px-2 py-[2px] bg-blue-500 text-white font-semibold flex items-center rounded-full shadow"
                      style={{
                        // Span the correct number of columns (cells)
                        width: `calc(${span * 100}% + ${(span - 1)}px)`, // compensate for grid borders
                        minWidth: 0,
                        zIndex: 20,
                        height: "22px",
                        lineHeight: "22px",
                        pointerEvents: "auto",
                        overflow: "hidden",
                        borderRadius:
                        span === 1
                          ? "9999px"
                          : span === daysLeftInBooking
                          ? "9999px 9999px 9999px 9999px" // event starts and ends in this row
                          : "9999px 0 0 9999px", // always round left
                        left: 0,
                        right: 0,
                      }}
                      tabIndex={0}
                      onClick={() => onEditBooking(booking)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onEditBooking(booking); }}
                      role="button"
                      aria-label={`Edit booking: ${booking.eventName}`}
                    >
                      <span className="w-full text-center mx-auto truncate">{booking.eventName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};