
import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddBookingDialog } from "@/components/AddBookingDialog";
import { EditBookingDialog } from "@/components/EditBookingDialog";
import { RefundDialog } from "@/components/booking/RefundDialog";
import { useBookings } from "@/hooks/useBookings";
import { BookingGrid } from "@/components/booking/BookingGrid";
import { BookingEmptyState } from "@/components/booking/BookingEmptyState";
import { MonthNavigation } from "@/components/MonthNavigation";
import { addMonths, subMonths, format } from "date-fns";

export const BookingsPage = () => {
  const { bookings, loading, addBooking, updateBooking, cancelBooking, processRefund, addPayment } = useBookings();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [refundingBooking, setRefundingBooking] = useState(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  // Filter bookings based on search term and current month
  const filteredBookings = useMemo(() => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return bookings.filter(booking => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        booking.eventName.toLowerCase().includes(searchLower) ||
        booking.clientName.toLowerCase().includes(searchLower) ||
        (booking.phoneNumber && booking.phoneNumber.toLowerCase().includes(searchLower));

      // Month filter
      const bookingDate = new Date(booking.startDate);
      const matchesMonth = bookingDate.getMonth() === currentMonth && 
                          bookingDate.getFullYear() === currentYear;

      return matchesSearch && matchesMonth;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [bookings, searchTerm, currentDate]);

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
  };

  const handleUpdateBooking = (updatedBooking) => {
    updateBooking(updatedBooking.id, updatedBooking);
    setEditingBooking(null);
  };

  const handleCancelBooking = async (bookingId: string) => {
    // Just cancel the booking without asking for refund
    await cancelBooking(bookingId);
  };

  const handleProcessRefund = (booking: any) => {
    setRefundingBooking(booking);
    setShowRefundDialog(true);
  };

  const handleRefund = async (refundData: any) => {
    try {
      console.log('BookingsPage: Processing refund:', refundData);
      // Process refund - this will now handle both payments and transactions atomically
      await processRefund(refundData);
      setRefundingBooking(null);
      setShowRefundDialog(false);
    } catch (error) {
      console.error('BookingsPage: Refund failed:', error);
      // Error is already handled in processRefund function with toast
      // Keep dialog open so user can try again
    }
  };

  const handleAddPayment = async (bookingId: string, amount: number, date: string, type: string, description?: string, paymentMode?: string) => {
    await addPayment(bookingId, amount, date, type, description, paymentMode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <MonthNavigation
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />

      <div className="p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No bookings found for {format(currentDate, "MMMM yyyy")}</p>
          </div>
        ) : (
          <BookingGrid
            bookings={filteredBookings}
            onEdit={handleEditBooking}
            onCancel={handleCancelBooking}
            onProcessRefund={handleProcessRefund}
          />
        )}
      </div>

      <Button
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-6 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
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

      {refundingBooking && (
        <RefundDialog
          open={showRefundDialog}
          onOpenChange={(open) => {
            setShowRefundDialog(open);
            if (!open) setRefundingBooking(null);
          }}
          booking={refundingBooking}
          onRefund={handleRefund}
        />
      )}
    </div>
  );
};
