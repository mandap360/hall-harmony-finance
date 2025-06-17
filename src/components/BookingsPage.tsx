
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddBookingDialog } from "@/components/AddBookingDialog";
import { EditBookingDialog } from "@/components/EditBookingDialog";
import { BookingCard } from "@/components/BookingCard";
import { useBookings } from "@/hooks/useBookings";

export const BookingsPage = () => {
  const { bookings, loading, addBooking, updateBooking, deleteBooking, addPayment } = useBookings();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-800">Bookings</h1>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Booking
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onEdit={handleEditBooking}
              onDelete={handleDeleteBooking}
            />
          ))}
        </div>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No bookings found for this financial year</p>
            <p className="text-gray-400 text-sm mt-2">Click "Add Booking" to create your first booking</p>
          </div>
        )}
      </div>

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
