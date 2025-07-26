
import { AddPaymentForm } from "./AddPaymentForm";
import { PaymentHistoryCard } from "./PaymentHistoryCard";

interface PaymentsTabProps {
  booking: any;
  onAddPayment: (payment: { 
    amount: string; 
    date: string; 
    categoryId: string; 
    description: string; 
    accountId: string; 
  }) => void;
}

export const PaymentsTab = ({ booking, onAddPayment }: PaymentsTabProps) => {
  // Show all payments from the payments table (rent, advance, and additional)
  const allPayments = booking.payments || [];

  return (
    <div className="space-y-4">
      <AddPaymentForm onAddPayment={onAddPayment} />
      <PaymentHistoryCard payments={allPayments} />
    </div>
  );
};
