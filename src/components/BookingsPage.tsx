
import { useState, useMemo } from "react";
import { Search, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddBookingDialog } from "@/components/AddBookingDialog";
import { EditBookingDialog } from "@/components/EditBookingDialog";
import { BookingCard } from "@/components/BookingCard";
import { useBookings } from "@/hooks/useBookings";

export const BookingsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const { bookings, addBooking, updateBooking } = useBookings();

  // Get current Indian Financial Year (April to March)
  const getCurrentFY = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    if (month >= 3) { // April onwards
      return { startYear: year, endYear: year + 1 };
    } else { // January to March
      return { startYear: year - 1, endYear: year };
    }
  };

  const currentFY = getCurrentFY();

  const filteredBookings = useMemo(() => {
    let filtered = bookings.filter((booking) => {
      const bookingDate = new Date(booking.startDate);
      const bookingYear = bookingDate.getFullYear();
      const bookingMonth = bookingDate.getMonth();
      
      // Check if booking is in current FY
      let isInCurrentFY = false;
      if (bookingMonth >= 3) { // April onwards
        isInCurrentFY = bookingYear === currentFY.startYear;
      } else { // January to March
        isInCurrentFY = bookingYear === currentFY.endYear;
      }
      
      return isInCurrentFY;
    });

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((booking) =>
        booking.eventName.toLowerCase().includes(query) ||
        booking.clientName.toLowerCase().includes(query) ||
        booking.phoneNumber.includes(query) ||
        new Date(booking.startDate).toLocaleDateString().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [bookings, searchQuery, currentFY]);

  const handleAddBooking = (bookingData) => {
    addBooking(bookingData);
    setShowAddDialog(false);
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
  };

  const handleUpdateBooking = (updatedBooking) => {
    updateBooking(updatedBooking);
    setEditingBooking(null);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
        <p className="text-lg text-blue-600 font-semibold">Royal Palace Wedding Hall</p>
        <p className="text-sm text-gray-500">
          FY {currentFY.startYear}-{currentFY.endYear.toString().slice(-2)}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Upcoming Bookings ({filteredBookings.length})
          </h2>
        </div>
        
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No bookings found for current FY</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onEdit={handleEditBooking}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Button */}
      <Button
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Dialogs */}
      <AddBookingDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddBooking}
      />
      
      {editingBooking && (
        <EditBookingDialog
          open={!!editingBooking}
          onOpenChange={() => setEditingBooking(null)}
          booking={editingBooking}
          onSubmit={handleUpdateBooking}
        />
      )}
    </div>
  );
};
