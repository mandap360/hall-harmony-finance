import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { useBookings } from "@/hooks/useBookings";
import { Badge } from "@/components/ui/badge";
import { FinancialYear, isInFinancialYear } from "@/utils/financialYear";

interface ReceivablesViewProps {
  onBack: () => void;
  financialYear?: FinancialYear;
}

export const ReceivablesView = ({ onBack, financialYear }: ReceivablesViewProps) => {
  const { bookings } = useBookings();

  // Filter bookings for the specified financial year (or current if none provided) where rent is pending (excluding cancelled bookings)
  const pendingRentBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startDate);
    const isInTargetFY = financialYear ? 
      isInFinancialYear(bookingDate, financialYear) : 
      true; // If no financialYear provided, include all (backward compatibility)
    const hasPendingRent = booking.rentFinalized > booking.rentReceived;
    const isNotCancelled = booking.status !== 'cancelled';
    
    return isInTargetFY && hasPendingRent && isNotCancelled;
  });

  const totalReceivables = pendingRentBookings.reduce(
    (sum, booking) => sum + (booking.rentFinalized - booking.rentReceived), 
    0
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Receivables</h1>
            <p className="text-muted-foreground">Bookings with pending rent payments</p>
          </div>
        </div>

        <div className="mb-6">
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Total Receivables
                </h3>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  <CurrencyDisplay amount={totalReceivables} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {pendingRentBookings.length} pending booking{pendingRentBookings.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {pendingRentBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                <p className="text-lg font-medium mb-2">No pending receivables</p>
                <p className="text-sm">All bookings have been fully paid.</p>
              </div>
            </Card>
          ) : (
            pendingRentBookings.map((booking) => {
              const pendingAmount = booking.rentFinalized - booking.rentReceived;
              
              return (
                <Card key={booking.id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {booking.eventName}
                        </h3>
                        <Badge 
                          variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Client: {booking.clientName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Function Date: {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </p>
                      {booking.phoneNumber && (
                        <p className="text-sm text-muted-foreground">
                          Phone: {booking.phoneNumber}
                        </p>
                      )}
                    </div>
                    
                    <div className="lg:text-right space-y-2">
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Rent Finalized</p>
                          <p className="font-medium">
                            <CurrencyDisplay amount={booking.rentFinalized} />
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Rent Received</p>
                          <p className="font-medium">
                            <CurrencyDisplay amount={booking.rentReceived} />
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">Pending Amount</p>
                        <p className="text-lg font-bold text-red-600">
                          <CurrencyDisplay amount={pendingAmount} />
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};