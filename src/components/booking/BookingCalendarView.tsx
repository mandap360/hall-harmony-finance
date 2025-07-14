import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BookingCalendarViewProps {
  bookings: any[];
  currentDate: Date;
  onEditBooking: (booking: any) => void;
}

export const BookingCalendarView = ({ 
  bookings, 
  currentDate, 
  onEditBooking 
}: BookingCalendarViewProps) => {
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const getBookingsForDay = (day: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.startDate);
      return isSameDay(bookingDate, day);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border">

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-border">
        {/* Day headers */}
        {weekDays.map((day) => (
          <div key={day} className="bg-muted p-3 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day) => {
          const dayBookings = getBookingsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div
              key={day.toISOString()}
              className={`bg-background min-h-[120px] p-2 ${
                !isCurrentMonth ? 'text-muted-foreground/70' : ''
              } ${dayBookings.length > 0 ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
            >
              <div className="text-sm font-medium mb-1">
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayBookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    onClick={() => onEditBooking(booking)}
                    className="cursor-pointer text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <div className="font-medium truncate text-primary">
                      {booking.clientName}
                    </div>
                    <div className="text-muted-foreground truncate">
                      {booking.eventName}
                    </div>
                    <Badge variant="secondary" className={`text-xs ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </Badge>
                  </div>
                ))}
                {dayBookings.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayBookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};