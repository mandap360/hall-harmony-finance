
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";
import { CurrencyDisplay } from "@/components/ui/currency-display";

interface PaymentSummaryCardProps {
  booking: {
    rentFinalized: number;
    rentReceived: number;
    paidAmount: number;
    additionalIncome: number;
  };
}

export const PaymentSummaryCard = ({ booking }: PaymentSummaryCardProps) => {
  const remainingRent = booking.rentFinalized - booking.paidAmount;

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-700">Payment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-gray-600 mr-1">Rent Finalized:</span>
              <CurrencyDisplay amount={booking.rentFinalized} className="font-semibold" iconSize="sm" />
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-600 mr-1">Rent Received:</span>
              <CurrencyDisplay amount={booking.paidAmount} className="font-semibold text-green-600" iconSize="sm" />
            </div>
            
            {booking.additionalIncome > 0 && (
              <div className="flex items-center">
                <span className="text-gray-600 mr-1">Additional Income:</span>
                <CurrencyDisplay amount={booking.additionalIncome} className="font-semibold text-purple-600" iconSize="sm" />
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-600 mr-1">Rent Balance:</span>
            <CurrencyDisplay 
              amount={remainingRent} 
              className={`font-bold ${remainingRent > 0 ? 'text-red-600' : 'text-green-600'}`} 
              iconSize="sm" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
