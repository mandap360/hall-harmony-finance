
import { Card } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";

interface PaymentHistoryCardProps {
  payments: Array<{
    id: string;
    amount: number;
    date: string;
    type: string;
    description: string;
  }>;
}

export const PaymentHistoryCard = ({ payments }: PaymentHistoryCardProps) => {
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
            <div>
              <div className="flex items-center text-green-600">
                <IndianRupee className="h-4 w-4" />
                <span className="font-semibold">{payment.amount}</span>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(payment.date).toLocaleDateString('en-IN')} • {payment.type === 'rent' ? 'Rent' : 'Additional Income'}
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
