
import { Card } from "@/components/ui/card";
import { useAccounts } from "@/hooks/useAccounts";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { PaymentTypeBadge } from "@/components/ui/payment-type-badge";

interface PaymentHistoryCardProps {
  payments: Array<{
    id: string;
    amount: number;
    date: string;
    type: string;
    description: string;
    payment_mode?: string;
  }>;
}

export const PaymentHistoryCard = ({ payments }: PaymentHistoryCardProps) => {
  const { accounts } = useAccounts();

  const getPaymentMethod = (paymentModeId?: string) => {
    if (!paymentModeId) return 'Not specified';
    const account = accounts.find(acc => acc.id === paymentModeId);
    return account ? account.name : 'Unknown';
  };

  if (!payments || payments.length === 0) {
    return (
      <Card className="p-4 border-amber-200">
        <h3 className="font-semibold mb-3 text-amber-800">Payment History</h3>
        <div className="text-center py-3 text-gray-500">
          <p className="text-sm">No payments added yet</p>
        </div>
      </Card>
    );
  }


  return (
    <Card className="p-4 border-amber-200">
      <h3 className="font-semibold mb-3 text-amber-800">Payment History</h3>
      <div className="space-y-2">
        {payments.map((payment) => (
          <div key={payment.id} className="flex justify-between items-center p-2 bg-amber-50 rounded border border-amber-100">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CurrencyDisplay amount={payment.amount} className="font-semibold" displayMode="text-only" />
                <PaymentTypeBadge type={payment.type} />
              </div>
              <p className="text-xs text-gray-500">
                {new Date(payment.date).toLocaleDateString('en-IN')}
              </p>
              <p className="text-xs text-gray-600">
                Payment mode: {getPaymentMethod(payment.payment_mode)}
              </p>
              {payment.description && (
                <p className="text-xs text-gray-600">{payment.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
