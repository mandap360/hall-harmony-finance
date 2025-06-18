
import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddBookingDialog } from "@/components/AddBookingDialog";
import { EditBookingDialog } from "@/components/EditBookingDialog";
import { BookingCard } from "@/components/BookingCard";
import { useBookings } from "@/hooks/useBookings";

export const BookingsPage = () => {
  const { bookings, loading, addBooking, updateBooking, deleteBooking, addPayment } = useBookings();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("upcoming");

  // Generate month options for the current financial year (April to March)
  const monthOptions = useMemo(() => {
    const months = [
      { label: "Upcoming", value: "upcoming" }
    ];
    
    // Get current financial year (April to March)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // If we're in Jan-Mar, FY started previous year, otherwise current year
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    
    // Add months from April to March
    const monthNames = [
      "April", "May", "June", "July", "August", "September",
      "October", "November", "December", "January", "February", "March"
    ];
    
    monthNames.forEach((monthName, index) => {
      // April-December are in fyStartYear, Jan-March are in fyStartYear+1
      const year = index < 9 ? fyStartYear : fyStartYear + 1;
      const monthNumber = index < 9 ? index + 4 : index - 8; // April=4, May=5, ..., Jan=1, Feb=2, Mar=3
      const monthValue = `${year}-${String(monthNumber).padStart(2, '0')}`;
      months.push({ label: `${monthName} ${year}`, value: monthValue });
    });
    
    return months;
  }, []);

  // Filter bookings based on search term and month
  const filteredBookings = useMemo(() => {
    let filtered = bookings.filter(booking => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        booking.eventName.toLowerCase().includes(searchLower) ||
        booking.clientName.toLowerCase().includes(searchLower) ||
        booking.phoneNumber.toLowerCase().includes(searchLower);

      return matchesSearch;
    });

    // Month/upcoming filter
    if (selectedMonth === "upcoming") {
      const now = new Date();
      filtered = filtered
        .filter(booking => new Date(booking.startDate) >= now)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 10); // Show only 10 upcoming bookings
    } else {
      filtered = filtered.filter(booking => 
        booking.startDate.startsWith(selectedMonth)
      );
    }

    return filtered;
  }, [bookings, searchTerm, selectedMonth]);

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
  };

  const handleUpdateBooking = (updatedBooking) => {
    updateBooking(updatedBooking);
    setEditingBooking(null);
  };

  const handleDeleteBooking = (bookingId) => {
    deleteBooking(bookingId);
  };

  const handleAddPayment = async (bookingId: string, amount: number, date: string, type: string, description?: string) => {
    await addPayment(bookingId, amount, date, type, description);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by client name, event name, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onEdit={handleEditBooking}
              onDelete={handleDeleteBooking}
            />
          ))}
        </div>

        {filteredBookings.length === 0 && (
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
        )}
      </div>

      {/* Fixed + Button at bottom right */}
      <Button
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddBookingDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={(booking) => {
          addBooking(booking);
          setShowAddDialog(false);
        }}
      />

      {editingBooking && (
        <EditBookingDialog
          open={!!editingBooking}
          onOpenChange={(open) => !open && setEditingBooking(null)}
          booking={editingBooking}
          onSubmit={handleUpdateBooking}
          onAddPayment={handleAddPayment}
        />
      )}
    </div>
  );
};
