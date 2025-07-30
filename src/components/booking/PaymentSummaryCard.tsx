
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";

interface PaymentSummaryCardProps {
  booking: {
    rentFinalized: number;
    rentReceived: number;
    paidAmount: number;
    additionalIncome: number;
    status?: string;
    income?: Array<{ type: string; amount: number; }>;
  };
}

export const PaymentSummaryCard = ({ booking }: PaymentSummaryCardProps) => {
  const remainingRent = booking.rentFinalized - booking.paidAmount;
  
  // Check if this is a cancelled booking with refunds
  const isCancelledWithRefund = booking.status === 'cancelled' && 
    booking.income?.some(payment => payment.type === 'refund');
  
  const refundAmount = isCancelledWithRefund ? 
    Math.abs(booking.income?.filter(p => p.type === 'refund').reduce((sum, p) => sum + p.amount, 0) || 0) : 0;

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-700">Payment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            {isCancelledWithRefund ? (
              <>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-1">Amount Received:</span>
                  <CurrencyDisplay amount={booking.paidAmount} className="font-semibold text-green-600" displayMode="text-only" />
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-600 mr-1">Amount Refunded:</span>
                  <CurrencyDisplay amount={refundAmount} className="font-semibold text-red-600" displayMode="text-only" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-1">Rent Finalized:</span>
                  <CurrencyDisplay amount={booking.rentFinalized} className="font-semibold" displayMode="text-only" />
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-600 mr-1">Rent Received:</span>
                  <CurrencyDisplay amount={booking.paidAmount} className="font-semibold text-green-600" displayMode="text-only" />
                </div>
                
                {booking.additionalIncome > 0 && (
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-1">Secondary Income:</span>
                    <CurrencyDisplay amount={booking.additionalIncome} className="font-semibold text-purple-600" displayMode="text-only" />
                  </div>
                )}
              </>
            )}
          </div>
          
          {!isCancelledWithRefund && (
            <div className="flex items-center">
              <span className="text-gray-600 mr-1">Rent Balance:</span>
              <CurrencyDisplay 
                amount={remainingRent} 
                className={`font-bold ${remainingRent > 0 ? 'text-red-600' : 'text-green-600'}`} 
                displayMode="text-only" 
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
