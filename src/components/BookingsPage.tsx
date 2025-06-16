
import { useState, useMemo } from "react";
import { Search, Plus, Calendar } from "lucide-react";
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
  const [showAllBookings, setShowAllBookings] = useState(false);
  const { bookings, loading, addBooking, updateBooking } = useBookings();

  // Get current Indian Financial Year (April to March)
  const getCurrentFY = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    if (month >= 3) { // April onwards (month is 0-indexed, so March = 2, April = 3)
      return { startYear: year, endYear: year + 1 };
    } else { // January to March
      return { startYear: year - 1, endYear: year };
    }
  };

  const currentFY = getCurrentFY();

  const filteredBookings = useMemo(() => {
    console.log("All bookings:", bookings);
    console.log("Current FY:", currentFY);
    console.log("Show all bookings:", showAllBookings);

    let filtered = bookings;

    // Apply FY filter only if not showing all bookings
    if (!showAllBookings) {
      filtered = bookings.filter((booking) => {
        const bookingDate = new Date(booking.startDate);
        const bookingYear = bookingDate.getFullYear();
        const bookingMonth = bookingDate.getMonth();
        
        console.log(`Booking ${booking.eventName}: date=${bookingDate.toISOString()}, year=${bookingYear}, month=${bookingMonth}`);
        
        // Check if booking is in current FY
        let isInCurrentFY = false;
        if (bookingMonth >= 3) { // April onwards (month is 0-indexed)
          isInCurrentFY = bookingYear === currentFY.startYear;
        } else { // January to March
          isInCurrentFY = bookingYear === currentFY.endYear;
        }
        
        console.log(`Booking ${booking.eventName}: isInCurrentFY=${isInCurrentFY}`);
        return isInCurrentFY;
      });
    }

    console.log("Filtered by FY:", filtered);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((booking) =>
        booking.eventName.toLowerCase().includes(query) ||
        booking.clientName.toLowerCase().includes(query) ||
        booking.phoneNumber.includes(query) ||
        new Date(booking.startDate).toLocaleDateString().includes(query)
      );
    }

    console.log("Final filtered bookings:", filtered);
    return filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [bookings, searchQuery, currentFY, showAllBookings]);

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

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <p className="text-gray-500">Loading bookings...</p>
        </div>
      </div>
    );
  }

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

      {/* Filter Toggle */}
      <div className="flex justify-center">
        <Button
          variant={showAllBookings ? "outline" : "default"}
          onClick={() => setShowAllBookings(!showAllBookings)}
          className="text-sm"
        >
          {showAllBookings ? `Show Current FY Only (${filteredBookings.length})` : `Show All Bookings (${bookings.length})`}
        </Button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {showAllBookings ? `All Bookings (${filteredBookings.length})` : `Current FY Bookings (${filteredBookings.length})`}
          </h2>
        </div>
        
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">
              {bookings.length === 0 
                ? "No bookings found in database" 
                : showAllBookings 
                  ? "No bookings match your search" 
                  : "No bookings found for current FY"
              }
            </p>
            {bookings.length > 0 && !showAllBookings && (
              <Button
                variant="outline"
                onClick={() => setShowAllBookings(true)}
                className="mt-2"
              >
                Show All Bookings
              </Button>
            )}
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
