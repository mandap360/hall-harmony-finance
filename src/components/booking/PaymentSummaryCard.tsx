
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";

interface PaymentSummaryCardProps {
  booking: {
    rent: number;
    advance: number;
    paidAmount: number;
  };
}

export const PaymentSummaryCard = ({ booking }: PaymentSummaryCardProps) => {
  const remainingAmount = booking.rent - booking.paidAmount;

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-700">Payment Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Rent Finalized:</span>
          <div className="flex items-center text-lg font-semibold">
            <IndianRupee className="h-4 w-4" />
            {booking.rent}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Rent Received:</span>
          <div className="flex items-center text-lg font-semibold text-green-600">
            <IndianRupee className="h-4 w-4" />
            {booking.paidAmount}
          </div>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Balance Remaining:</span>
            <div className={`flex items-center text-lg font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              <IndianRupee className="h-4 w-4" />
              {remainingAmount}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
