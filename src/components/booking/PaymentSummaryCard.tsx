
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
  // Calculate additional income from payments that are not rent/advance
  const additionalIncome = booking.paidAmount - booking.advance;
  const remainingAmount = booking.rent - booking.paidAmount;

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
              <div className="flex items-center font-semibold">
                <IndianRupee className="h-3 w-3" />
                {booking.rent}
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-600 mr-1">Rent Received:</span>
              <div className="flex items-center font-semibold text-green-600">
                <IndianRupee className="h-3 w-3" />
                {booking.paidAmount}
              </div>
            </div>
            
            {additionalIncome > 0 && (
              <div className="flex items-center">
                <span className="text-gray-600 mr-1">Additional Income:</span>
                <div className="flex items-center font-semibold text-purple-600">
                  <IndianRupee className="h-3 w-3" />
                  {additionalIncome}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-600 mr-1">Balance:</span>
            <div className={`flex items-center font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              <IndianRupee className="h-3 w-3" />
              {remainingAmount}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
