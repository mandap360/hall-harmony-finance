
import { Card } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";

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

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'rent':
        return 'Rent Payment';
      case 'advance':
        return 'Advance Payment';
      case 'additional':
        return 'Additional Income';
      default:
        return 'Payment';
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'rent':
        return 'text-blue-600';
      case 'advance':
        return 'text-green-600';
      case 'additional':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="p-4 border-amber-200">
      <h3 className="font-semibold mb-3 text-amber-800">Payment History</h3>
      <div className="space-y-2">
        {payments.map((payment) => (
          <div key={payment.id} className="flex justify-between items-center p-2 bg-amber-50 rounded border border-amber-100">
            <div className="flex-1">
              <div className={`flex items-center ${getPaymentTypeColor(payment.type)}`}>
                <IndianRupee className="h-4 w-4" />
                <span className="font-semibold">{payment.amount}</span>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(payment.date).toLocaleDateString('en-IN')} • {getPaymentTypeLabel(payment.type)}
              </p>
              <p className="text-xs text-gray-600">
                Payment Method: {getPaymentMethod(payment.payment_mode)}
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
