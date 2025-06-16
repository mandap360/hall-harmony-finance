
import { useState, useMemo } from "react";
import { Search, Plus, Calendar, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddBookingDialog } from "@/components/AddBookingDialog";
import { EditBookingDialog } from "@/components/EditBookingDialog";
import { BookingCard } from "@/components/BookingCard";
import { PaymentDialog } from "@/components/PaymentDialog";
import { useBookings } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";

export const BookingsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const { bookings, loading, addBooking, updateBooking, addPayment } = useBookings();
  const { profile } = useAuth();

  const filteredBookings = useMemo(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return bookings.filter((booking) =>
        booking.eventName.toLowerCase().includes(query) ||
        booking.clientName.toLowerCase().includes(query) ||
        booking.phoneNumber.includes(query) ||
        new Date(booking.startDate).toLocaleDateString().includes(query)
      );
    }
    return bookings.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [bookings, searchQuery]);

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

  const handleAddPayment = (booking) => {
    setPaymentBooking(booking);
  };

  const handlePaymentSubmit = (amount: number) => {
    if (paymentBooking) {
      addPayment(paymentBooking.id, amount);
      setPaymentBooking(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-600">Manage your hall bookings</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-rose-200 focus:border-rose-500 focus:ring-rose-500"
        />
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Current FY Bookings ({filteredBookings.length})
          </h2>
        </div>
        
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No bookings found for current financial year</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onEdit={handleEditBooking}
                onAddPayment={handleAddPayment}
                userRole='admin'
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Button */}
      <Button
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
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

      {paymentBooking && (
        <PaymentDialog
          open={!!paymentBooking}
          onOpenChange={() => setPaymentBooking(null)}
          booking={paymentBooking}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  );
};
