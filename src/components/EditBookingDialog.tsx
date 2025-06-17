
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingDetailsTab } from "@/components/booking/BookingDetailsTab";
import { PaymentsTab } from "@/components/booking/PaymentsTab";
import { AdditionalIncomeTab } from "@/components/AdditionalIncomeTab";

interface EditBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onSubmit: (booking: any) => void;
  onAddPayment?: (bookingId: string, amount: number, date: string, type: string, description?: string) => Promise<void>;
}

export const EditBookingDialog = ({ open, onOpenChange, booking, onSubmit, onAddPayment }: EditBookingDialogProps) => {
  const [activeTab, setActiveTab] = useState("details");

  const handleAddPayment = async (paymentData: { amount: string; date: string; type: string; description: string }) => {
    if (!paymentData.amount || !paymentData.date || !onAddPayment) return;

    const amount = parseInt(paymentData.amount);
    
    // Add payment to database
    await onAddPayment(booking.id, amount, paymentData.date, paymentData.type, paymentData.description);
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
            booking={booking}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}

        {activeTab === "payments" && (
          <PaymentsTab
            booking={booking}
            onAddPayment={handleAddPayment}
          />
        )}

        {activeTab === "additional-income" && booking && (
          <AdditionalIncomeTab bookingId={booking.id} booking={booking} />
        )}
      </DialogContent>
    </Dialog>
  );
};
