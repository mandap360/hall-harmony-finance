
import { useState, useMemo } from "react";
import { Plus, Search, List, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddBookingDialog } from "@/components/AddBookingDialog";
import { EditBookingDialog } from "@/components/EditBookingDialog";
import { RefundDialog } from "@/components/booking/RefundDialog";
import { useBookings } from "@/hooks/useBookings";
import { BookingTableView } from "@/components/booking/BookingTableView";
import { BookingCalendarView } from "@/components/booking/BookingCalendarView";
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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

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
    <div className="min-h-screen bg-primary/5">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search and View Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-border focus:border-primary"
              />
            </div>
            
            <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-primary text-white' : 'hover:bg-background'}
              >
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={viewMode === 'calendar' ? 'bg-primary text-white' : 'hover:bg-background'}
              >
                Calendar
              </Button>
            </div>
          </div>

          {/* Month Navigation */}
          <MonthNavigation
            currentDate={currentDate}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-4">
        {viewMode === 'list' ? (
          <BookingTableView
            bookings={filteredBookings}
            onEditBooking={handleEditBooking}
            onCancelBooking={handleCancelBooking}
            onProcessRefund={handleProcessRefund}
          />
        ) : (
          <BookingCalendarView
            bookings={filteredBookings}
            currentDate={currentDate}
            onEditBooking={handleEditBooking}
            onCancelBooking={handleCancelBooking}
            onProcessRefund={handleProcessRefund}
          />
        )}
      </div>

      <Button
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 text-white z-50"
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
