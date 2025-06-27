
import { BookingCard } from "@/components/BookingCard";
import { Booking } from "@/hooks/useBookings";

interface BookingGridProps {
  bookings: Booking[];
  onEdit: (booking: Booking) => void;
  onCancel?: (bookingId: string) => void;
}

export const BookingGrid = ({ bookings, onEdit, onCancel }: BookingGridProps) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onEdit={onEdit}
            onCancel={onCancel}
          />
        ))}
      </div>
    </div>
  );
};
