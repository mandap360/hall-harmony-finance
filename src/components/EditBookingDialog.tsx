
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingDetailsTab } from "@/components/booking/BookingDetailsTab";
import { PaymentsTab } from "@/components/booking/PaymentsTab";
import { AdditionalIncomeTab } from "@/components/AdditionalIncomeTab";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useBookings } from "@/hooks/useBookings";

interface EditBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onSubmit: (booking: any) => void;
  onAddPayment?: (bookingId: string, amount: number, date: string, type: string, description?: string, paymentMode?: string) => Promise<void>;
}

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
    type: string; 
    description: string; 
    accountId: string; 
  }) => {
    if (!paymentData.amount || !paymentData.date || !paymentData.accountId) return;

    const amount = parseInt(paymentData.amount);
    
    try {
      // Add payment to database with payment_mode
      if (onAddPayment) {
        await onAddPayment(currentBooking.id, amount, paymentData.date, paymentData.type, paymentData.description, paymentData.accountId);
      }

      // Add corresponding transaction to the selected account
      await addTransaction({
        account_id: paymentData.accountId,
        transaction_type: 'credit',
        amount: amount,
        description: `${paymentData.type} payment for ${currentBooking.client_name} - ${currentBooking.event_name} (${new Date(currentBooking.end_datetime).toLocaleDateString()})`,
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
          <DialogTitle className="text-amber-800">Edit Booking</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-amber-200">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "details"
                ? "text-amber-700 border-b-2 border-amber-600 bg-amber-50"
                : "text-gray-500 hover:text-amber-600"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "payments"
                ? "text-amber-700 border-b-2 border-amber-600 bg-amber-50"
                : "text-gray-500 hover:text-amber-600"
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab("additional-income")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "additional-income"
                ? "text-amber-700 border-b-2 border-amber-600 bg-amber-50"
                : "text-gray-500 hover:text-amber-600"
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
