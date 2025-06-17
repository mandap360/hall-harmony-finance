
import { PaymentSummaryCard } from "./PaymentSummaryCard";
import { AddPaymentForm } from "./AddPaymentForm";
import { PaymentHistoryCard } from "./PaymentHistoryCard";
import { useState } from "react";

interface PaymentsTabProps {
  booking: any;
  onAddPayment: (payment: { amount: string; date: string; type: string; description: string }) => void;
}

export const PaymentsTab = ({ booking, onAddPayment }: PaymentsTabProps) => {
  // Filter to show only payments added from the payment form (not additional income from categories page)
  const paymentsFromTab = booking.payments?.filter(
    (payment) => payment.type === 'rent' || payment.type === 'additional'
  ) || [];

  return (
    <div className="space-y-4">
      <PaymentSummaryCard booking={booking} />
      <AddPaymentForm onAddPayment={onAddPayment} />
      <PaymentHistoryCard payments={paymentsFromTab} />
    </div>
  );
};
