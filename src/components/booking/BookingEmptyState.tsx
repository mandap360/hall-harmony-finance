
interface BookingEmptyStateProps {
  searchTerm: string;
  selectedMonth: string;
}

export const BookingEmptyState = ({ searchTerm, selectedMonth }: BookingEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      {searchTerm || selectedMonth !== "upcoming" ? (
        <div>
          <p className="text-gray-500 text-lg">No bookings found matching your criteria</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter settings</p>
        </div>
      ) : (
        <div>
          <p className="text-gray-500 text-lg">No upcoming bookings found</p>
          <p className="text-gray-400 text-sm mt-2">Click the + button to create your first booking</p>
        </div>
      )}
    </div>
  );
};
