import { format, parseISO } from "date-fns";
import { Eye, Edit, Calendar, User, Clock, Phone, X, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentStatCard } from "@/components/ui/payment-stat-card";

interface BookingTableViewProps {
  bookings: any[];
  onEditBooking: (booking: any) => void;
  onCancelBooking?: (bookingId: string) => void;
  onProcessRefund?: (booking: any) => void;
}

export const BookingTableView = ({
  bookings,
  onEditBooking,
  onCancelBooking,
  onProcessRefund,
}: BookingTableViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  const canProcessRefund = (booking: any) => {
    const totalPaid = (booking.rentReceived || 0) + (booking.secondaryIncomeNet || 0);
    return booking.status === 'cancelled' && totalPaid > 0;
  };

  const canEditBooking = (booking: any) => {
    return booking.status !== 'cancelled';
  };

  const canCancelBooking = (booking: any) => {
    const now = new Date();
    // Always parse only the date part so no timezone shift occurs!
    const startDate = parseISO(booking.startDate.split("T")[0]);
    return startDate >= now && booking.status !== 'cancelled';
  };

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No bookings found</h3>
        <p className="text-muted-foreground text-center">
          There are no bookings for the selected month. Start by creating a new booking.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookings.map((booking) => {
        // Always parse ONLY the date part for display!
        const startDate = parseISO(booking.startDate.split("T")[0]);
        const endDate = parseISO(booking.endDate.split("T")[0]);

        return (
          <Card key={booking.id} className="transition-shadow hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-medium text-foreground truncate pr-2">
                  {booking.eventName}
                </h3>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Badge className={`${getStatusColor(booking.status)} px-2 py-1 text-xs ${booking.status === 'cancelled' ? 'hover:bg-red-500 hover:text-white' : ''}`}>
                    {booking.status === 'confirmed' ? 'Confirmed' : 
                     booking.status === 'pending' ? 'Pending' :
                     booking.status === 'cancelled' ? 'Cancelled' : booking.status}
                  </Badge>
                  {booking.status === 'cancelled' && canProcessRefund(booking) && onProcessRefund && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onProcessRefund(booking)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-green-600"
                        title="Process Refund"
                      >
                        <img src="/lovable-uploads/98d88b70-fb2e-49e2-a3a6-d0031e683c47.png" alt="Refund" className="h-5 w-5" />
                    </Button>
                  )}
                  {canEditBooking(booking) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditBooking(booking)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  {canCancelBooking(booking) && onCancelBooking && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancelBooking(booking.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                      title="Cancel booking"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground truncate">{booking.clientName}</span>
                </div>

                {booking.phoneNumber && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground">{booking.phoneNumber}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">
                    {format(startDate, "dd MMM yyyy")}
                    {format(startDate, "dd MMM yyyy") !== format(endDate, "dd MMM yyyy") && 
                      ` - ${format(endDate, "dd MMM yyyy")}`
                    }
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">
                    {(() => {
                     // Extract time directly from the datetime string to avoid timezone conversion
                      const startTime = booking.startDate.split('T')[1]?.substring(0, 5) || '00:00';
                      const endTime = booking.endDate.split('T')[1]?.substring(0, 5) || '00:00';
                      
                      // Convert to 12-hour format
                      const formatTo12Hour = (time: string) => {
                        const [hours, minutes] = time.split(':');
                        const hour = parseInt(hours);
                        const period = hour >= 12 ? 'PM' : 'AM';
                        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                        return `${displayHour}:${minutes} ${period}`;
                      };

                      return `${formatTo12Hour(startTime)} - ${formatTo12Hour(endTime)}`;
                    })()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                <PaymentStatCard
                  label="Rent Finalized"
                  amount={booking.rentFinalized || 0}
                  variant="blue"
                />

                <PaymentStatCard
                  label="Rent Received"
                  amount={booking.rentReceived || 0}
                  variant="green"
                />

                <PaymentStatCard
                  label="Secondary Income"
                  amount={booking.secondaryIncomeNet || 0}
                  variant="purple"
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};