
import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddBookingDialog } from "@/components/AddBookingDialog";
import { EditBookingDialog } from "@/components/EditBookingDialog";
import { RefundDialog } from "@/components/booking/RefundDialog";
import { useBookings } from "@/hooks/useBookings";
import { BookingFilters } from "@/components/booking/BookingFilters";
import { BookingGrid } from "@/components/booking/BookingGrid";
import { BookingEmptyState } from "@/components/booking/BookingEmptyState";

export const BookingsPage = () => {
  const { bookings, loading, addBooking, updateBooking, cancelBooking, processRefund, addPayment } = useBookings();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [refundingBooking, setRefundingBooking] = useState(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("upcoming");

  // Generate quarter options for the current financial year (April to March)
  const quarterOptions = useMemo(() => {
    const quarters = [
      { label: "Upcoming", value: "upcoming" }
    ];
    
    // Get current financial year (April to March)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // If we're in Jan-Mar, FY started previous year, otherwise current year
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    
    // Add quarters
    quarters.push(
      { label: `Q1 (Apr-Jun ${fyStartYear})`, value: `Q1-${fyStartYear}` },
      { label: `Q2 (Jul-Sep ${fyStartYear})`, value: `Q2-${fyStartYear}` },
      { label: `Q3 (Oct-Dec ${fyStartYear})`, value: `Q3-${fyStartYear}` },
      { label: `Q4 (Jan-Mar ${fyStartYear + 1})`, value: `Q4-${fyStartYear}` }
    );
    
    return quarters;
  }, []);

  // Helper function to check if a date falls within a quarter
  const isDateInQuarter = (dateString: string, quarterValue: string) => {
    if (quarterValue === "upcoming") return false;
    
    const date = new Date(dateString);
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const [quarter, fyStartYear] = quarterValue.split('-');
    const fyStart = parseInt(fyStartYear);
    
    switch (quarter) {
      case 'Q1': // April-June
        return (month >= 3 && month <= 5) && year === fyStart;
      case 'Q2': // July-September  
        return (month >= 6 && month <= 8) && year === fyStart;
      case 'Q3': // October-December
        return (month >= 9 && month <= 11) && year === fyStart;
      case 'Q4': // January-March
        return (month >= 0 && month <= 2) && year === fyStart + 1;
      default:
        return false;
    }
  };

  // Filter bookings based on search term and quarter
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

    // Quarter/upcoming filter
    if (selectedQuarter === "upcoming") {
      const now = new Date();
      filtered = filtered
        .filter(booking => new Date(booking.startDate) >= now)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 10); // Show only 10 upcoming bookings
    } else {
      filtered = filtered.filter(booking => 
        isDateInQuarter(booking.startDate, selectedQuarter)
      );
    }

    return filtered;
  }, [bookings, searchTerm, selectedQuarter]);

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
  };

  const handleUpdateBooking = (updatedBooking) => {
    updateBooking(updatedBooking);
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
    // Process refund
    await processRefund(refundData);
    setRefundingBooking(null);
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <BookingFilters
        searchTerm={searchTerm}
        selectedMonth={selectedQuarter}
        onSearchChange={setSearchTerm}
        onMonthChange={setSelectedQuarter}
        monthOptions={quarterOptions}
      />

      <div className="p-4">
        {filteredBookings.length === 0 ? (
          <BookingEmptyState searchTerm={searchTerm} selectedMonth={selectedQuarter} />
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

      {refundingBooking && (
        <RefundDialog
          open={showRefundDialog}
          onOpenChange={setShowRefundDialog}
          booking={refundingBooking}
          onRefund={handleRefund}
        />
      )}
    </div>
  );
};
