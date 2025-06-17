
import { Card } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";

interface PaymentSummaryCardProps {
  booking: any;
}

export const PaymentSummaryCard = ({ booking }: PaymentSummaryCardProps) => {
  const additionalIncome = (booking.payments || [])
    .filter(payment => payment.type === 'additional')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="flex items-center justify-center text-blue-600 mb-1">
            <IndianRupee className="h-4 w-4" />
            <span className="font-semibold">{booking.rent}</span>
          </div>
          <p className="text-xs text-gray-500">Rent</p>
        </div>
        <div>
          <div className="flex items-center justify-center text-green-600 mb-1">
            <IndianRupee className="h-4 w-4" />
            <span className="font-semibold">{booking.advance}</span>
          </div>
          <p className="text-xs text-gray-500">Advance</p>
        </div>
        <div>
          <div className="flex items-center justify-center text-purple-600 mb-1">
            <IndianRupee className="h-4 w-4" />
            <span className="font-semibold">{additionalIncome}</span>
          </div>
          <p className="text-xs text-gray-500">Additional Income</p>
        </div>
      </div>
    </Card>
  );
};
