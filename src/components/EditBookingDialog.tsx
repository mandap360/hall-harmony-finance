
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingDetailsTab } from "@/components/booking/BookingDetailsTab";
import { PaymentsTab } from "@/components/booking/PaymentsTab";
import { AdditionalIncomeTab } from "@/components/AdditionalIncomeTab";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useBookings } from "@/hooks/useBookings";
import { supabase } from "@/integrations/supabase/client";

interface EditBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onSubmit: (booking: any) => void;
  onAddPayment?: (bookingId: string, amount: number, date: string, type: string, description?: string, paymentMode?: string) => Promise<void>;
}

// Helper function to format transaction descriptions
const formatTransactionDescription = (
  paymentType: string,
  startDate: string,
  endDate: string,
  eventName: string,
  isRefund: boolean = false
): string => {
  // Extract just the date part (YYYY-MM-DD) to compare dates without time
  const startDateOnly = startDate.split('T')[0];
  const endDateOnly = endDate.split('T')[0];
  
  const startDateFormatted = new Date(startDateOnly + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  const endDateFormatted = new Date(endDateOnly + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const isSameDate = startDateOnly === endDateOnly;
  const dateRange = isSameDate ? startDateFormatted : `${startDateFormatted} - ${endDateFormatted}`;

  if (isRefund) {
    if (paymentType === 'additional') {
      return `Additional Income Refund for ${dateRange}`;
    } else {
      return `Rent Refund for ${dateRange}`;
    }
  } else {
    if (paymentType === 'additional') {
      return `Additional Income for ${dateRange}`;
    } else {
      return `Rent for ${dateRange}`;
    }
  }
};

export const EditBookingDialog = ({ open, onOpenChange, booking: initialBooking, onSubmit, onAddPayment }: EditBookingDialogProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const [currentBooking, setCurrentBooking] = useState(initialBooking);
  const { addTransaction } = useTransactions();
  const { refreshAccounts } = useAccounts();
  const { refetch: refreshBookings, bookings } = useBookings();

  // Update current booking when initial booking changes or when bookings are refreshed
  useEffect(() => {
    if (initialBooking) {
      // Find the updated booking from the bookings list
      const updatedBooking = bookings.find(b => b.id === initialBooking.id);
      setCurrentBooking(updatedBooking || initialBooking);
    }
  }, [initialBooking, bookings]);

  // Listen for booking updates
  useEffect(() => {
    const handleBookingUpdate = () => {
      refreshBookings();
    };

    window.addEventListener('booking-updated', handleBookingUpdate);
    return () => {
      window.removeEventListener('booking-updated', handleBookingUpdate);
    };
  }, [refreshBookings]);

  const handleAddPayment = async (paymentData: { 
    amount: string; 
    date: string; 
    categoryId: string; 
    description: string; 
    accountId: string; 
  }) => {
    if (!paymentData.amount || !paymentData.date || !paymentData.accountId || !paymentData.categoryId) return;

    const amount = parseInt(paymentData.amount);
    
    try {
      // Get category name from categoryId for description
      const { data: category } = await supabase
        .from('income_categories')
        .select('name')
        .eq('id', paymentData.categoryId)
        .single();

      const categoryName = category?.name || 'Unknown';

      // Create standardized description
      const transactionDescription = formatTransactionDescription(
        categoryName, 
        currentBooking.startDate, 
        currentBooking.endDate,
        currentBooking.eventName
      );

      // Add payment to database with category_id
      if (onAddPayment) {
        await onAddPayment(currentBooking.id, amount, paymentData.date, categoryName, transactionDescription, paymentData.accountId);
      }

      // Add corresponding transaction to the selected account
      await addTransaction({
        account_id: paymentData.accountId,
        transaction_type: 'credit',
        amount: amount,
        description: transactionDescription,
        reference_type: 'booking_payment',
        reference_id: currentBooking.id,
        transaction_date: paymentData.date
      });

      // Refresh accounts to show updated balances
      await refreshAccounts();
      
      // Refresh bookings to update payment history immediately
      await refreshBookings();
    } catch (error) {
      console.error('Error adding payment and transaction:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Booking</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-border">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "details"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "payments"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab("additional-income")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "additional-income"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Categories
          </button>
        </div>

        {activeTab === "details" && (
          <BookingDetailsTab
            booking={currentBooking}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}

        {activeTab === "payments" && (
          <PaymentsTab
            booking={currentBooking}
            onAddPayment={handleAddPayment}
          />
        )}

        {activeTab === "additional-income" && currentBooking && (
          <AdditionalIncomeTab bookingId={currentBooking.id} booking={currentBooking} />
        )}
      </DialogContent>
    </Dialog>
  );
};
