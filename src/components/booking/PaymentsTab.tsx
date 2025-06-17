
import { PaymentSummaryCard } from "./PaymentSummaryCard";
import { AddPaymentForm } from "./AddPaymentForm";
import { PaymentHistoryCard } from "./PaymentHistoryCard";

interface PaymentsTabProps {
  booking: any;
  onAddPayment: (payment: { amount: string; date: string; type: string; description: string }) => void;
}

export const PaymentsTab = ({ booking, onAddPayment }: PaymentsTabProps) => {
  return (
    <div className="space-y-4">
      <PaymentSummaryCard booking={booking} />
      <AddPaymentForm onAddPayment={onAddPayment} />
      <PaymentHistoryCard payments={booking.payments || []} />
    </div>
  );
};
