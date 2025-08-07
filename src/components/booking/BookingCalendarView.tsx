import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, startOfWeek, endOfWeek,
  differenceInCalendarDays, parseISO, isBefore, isAfter
} from "date-fns";
import { splitBookingAcrossDays } from "@/utils/CalendarUtils";

interface BookingCalendarViewProps {
  bookings: any[];
  currentDate: Date;
  onEditBooking: (booking: any) => void;
  onCancelBooking?: (bookingId: string) => void;
  onProcessRefund?: (booking: any) => void;
}

function computeWeeklySlots(days: Date[], bookings: any[]) {
  const weeks = [];
  for (let weekStart = 0; weekStart < days.length; weekStart += 7) {
    const weekDays = days.slice(weekStart, weekStart + 7);
    const weekBookings = bookings.filter(booking => {
      const bookingStart = parseISO(booking.startDate.split('T')[0]);
      const bookingEnd = parseISO(booking.endDate.split('T')[0]);
      return (
        (isBefore(bookingStart, weekDays[6]) || isSameDay(bookingStart, weekDays[6])) &&
        (isAfter(bookingEnd, weekDays[0]) || isSameDay(bookingEnd, weekDays[0]))
      );
    });

    const slots: (Array<any | null>)[] = [];
    for (const booking of weekBookings) {
      const bookingStart = parseISO(booking.startDate.split('T')[0]);
      const bookingEnd = parseISO(booking.endDate.split('T')[0]);

      let slotIndex = 0;
      while (true) {
        let conflict = false;
        for (let d = 0; d < 7; ++d) {
          const date = weekDays[d];
          if ((isAfter(date, bookingEnd) || isBefore(date, bookingStart))) continue;
          if (slots[slotIndex] && slots[slotIndex][d]) {
            conflict = true;
            break;
          }
        }
        if (!conflict) break;
        slotIndex++;
      }

      if (!slots[slotIndex]) slots[slotIndex] = Array(7).fill(null);
      for (let d = 0; d < 7; ++d) {
        const date = weekDays[d];
        if ((isAfter(date, bookingEnd) || isBefore(date, bookingStart))) continue;
        slots[slotIndex][d] = booking;
      }
    }
    weeks.push(slots);
  }
  return weeks;
}

const BAR_HEIGHT = 22; // px
const BAR_GAP = 4; // px

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

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const weeklySlots = computeWeeklySlots(days, bookings);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-border">
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-muted p-3 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {weeklySlots.map((slots, weekIdx) =>
          weekDays.map((_, dayIdx) => {
            const day = days[weekIdx * 7 + dayIdx];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const slotCount = slots.length;

            return (
              <div
                key={`${day.toISOString()}-${weekIdx}`}
                className={`relative bg-background min-h-[60px] px-0 pb-0 pt-2 border border-border ${!isCurrentMonth ? 'text-muted-foreground/70' : ''}`}
                style={{ overflow: "visible", height: Math.max(60, slotCount * (BAR_HEIGHT + BAR_GAP) + 26) }}
              >
                <div className="text-sm font-medium mb-1 pl-2">{format(day, "d")}</div>
                {slots.map((slotRow, slotIdx) => {
                  const booking = slotRow[dayIdx];
                  if (!booking) return null;

                  const bookingStart = parseISO(booking.startDate.split('T')[0]);
                  const bookingEnd = parseISO(booking.endDate.split('T')[0]);
                  const weekStartDate = days[weekIdx * 7];
                  const weekEndDate = days[weekIdx * 7 + 6];

                  // Determine the visible start and end date for the bar this week
                  const renderedStartDate = isBefore(bookingStart, weekStartDate) ? weekStartDate : bookingStart;
                  const renderedEndDate = isAfter(bookingEnd, weekEndDate) ? weekEndDate : bookingEnd;

                  const startIdx = differenceInCalendarDays(renderedStartDate, weekStartDate);
                  if (dayIdx !== startIdx) return null;

                  const span = differenceInCalendarDays(renderedEndDate, weekStartDate) - startIdx + 1;

                  // Only round the left edge if this is the real booking start
                  // Only round the right edge if this is the real booking end
                  const roundLeft = isSameDay(renderedStartDate, bookingStart);
                  const roundRight = isSameDay(renderedEndDate, bookingEnd);

                  let borderRadius = "0";
                  if (roundLeft && roundRight) {
                    borderRadius = "9999px";
                  } else if (roundLeft && !roundRight) {
                    borderRadius = "9999px 0 0 9999px";
                  } else if (!roundLeft && roundRight) {
                    borderRadius = "0 9999px 9999px 0";
                  } else {
                    borderRadius = "0";
                  }

                  return (
                    <div
                      key={booking.id + "-bar-" + weekIdx + "-" + slotIdx + "-" + dayIdx}
                      className="absolute left-0 text-xs px-2 py-[2px] bg-blue-500 text-white font-semibold flex items-center shadow"
                      style={{
                        top: `${26 + slotIdx * (BAR_HEIGHT + BAR_GAP)}px`,
                        width: `calc(${span * 100}% + ${(span - 1)}px)`,
                        minWidth: 0,
                        zIndex: 20,
                        height: `${BAR_HEIGHT}px`,
                        lineHeight: `${BAR_HEIGHT}px`,
                        pointerEvents: "auto",
                        overflow: "hidden",
                        borderRadius,
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
            );
          })
        )}
      </div>
    </div>
  );
};