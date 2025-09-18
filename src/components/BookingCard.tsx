
import { Calendar, User, Phone, IndianRupee, Edit, Clock, X, ArrowDown } from "lucide-react";
import { PaymentStatCard } from "@/components/ui/payment-stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format, parseISO } from "date-fns";

interface BookingCardProps {
  booking: any;
  onEdit: (booking: any) => void;
  onCancel?: (bookingId: string) => void;
  onProcessRefund?: (booking: any) => void;
}

export const BookingCard = ({ booking, onEdit, onCancel, onProcessRefund }: BookingCardProps) => {
    const formatDate = (dateString: string) => {
    const datePart = dateString.split("T")[0];
    return format(parseISO(datePart), "dd MMM yyyy");
  };

  const formatTime = (dateString: string) => {
  const timePart = dateString.split("T")[1]?.substring(0, 5) || "00:00";
  const [hours, minutes] = timePart.split(":");
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
  };

  const formatTimeRange = (startDate: string, endDate: string) => {
    const start = formatTime(startDate);
    const end = formatTime(endDate);
    return `${start} - ${end}`;
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const startDateOnly = startDate.split('T')[0];
    const endDateOnly = endDate.split('T')[0];
    
    if (startDateOnly === endDateOnly) {
      return formatDate(startDate);
    } else {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
  };

  const getBookingStatus = () => {
    const now = new Date();
    const endDate = new Date(booking.endDate);
    const startDate = new Date(booking.startDate);
    
    if (booking.status === 'cancelled') {
      return { label: 'Cancelled', variant: 'destructive' as const };
    }
    
    if (endDate < now) {
      return { label: 'Completed', variant: 'secondary' as const };
    }
    
    if (startDate >= now) {
      return { label: 'Confirmed', variant: 'default' as const };
    }
    
    return { label: 'Ongoing', variant: 'outline' as const };
  };

  const canCancelBooking = () => {
    const now = new Date();
    const startDate = new Date(booking.startDate);
    return startDate >= now && booking.status !== 'cancelled';
  };

  const canEditBooking = () => {
    return booking.status !== 'cancelled';
  };

  const canProcessRefund = () => {
    // Show refund button for cancelled bookings that have any payments (advance or additional payments)
    const totalPaid = booking.rentReceived + (booking.additionalIncome || 0);
    return booking.status === 'cancelled' && totalPaid > 0 && !hasRefundProcessed();
  };

  const hasRefundProcessed = () => {
    return booking.income?.some(payment => payment.type === 'refund') || false;
  };

  const getRefundAmount = () => {
    const refundPayments = booking.income?.filter(payment => payment.type === 'refund') || [];
    return Math.abs(refundPayments.reduce((sum, payment) => sum + payment.amount, 0));
  };

  // Use the secondary income net value that already excludes refunds
  const secondaryIncome = booking.secondaryIncomeNet || 0;

  const status = getBookingStatus();

  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg text-gray-900">
              {booking.eventName}
            </h3>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <div className="flex items-center text-gray-600 mb-1">
            <User className="h-4 w-4 mr-2" />
            <span className="text-sm">{booking.clientName}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            <span className="text-sm">{booking.phoneNumber}</span>
          </div>
          
          {hasRefundProcessed() && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md">
              <span className="text-sm text-blue-700">
                Refund of ₹{getRefundAmount().toLocaleString('en-IN')} processed
              </span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {canEditBooking() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(booking)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canProcessRefund() && onProcessRefund && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onProcessRefund(booking)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Process Refund"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}
          {canCancelBooking() && onCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this booking? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onCancel(booking.id)}>
                    Yes, Cancel Booking
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-gray-700">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-sm">
            {formatDateRange(booking.startDate, booking.endDate)}
          </span>
        </div>
        
        <div className="flex items-center text-gray-700">
          <Clock className="h-4 w-4 mr-2" />
          <span className="text-sm">
            {formatTimeRange(booking.startDate, booking.endDate)}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-gray-100">
          <PaymentStatCard 
            label="Rent Finalized" 
            amount={booking.rentFinalized} 
            variant="blue" 
          />
          
          <PaymentStatCard 
            label="Rent Received" 
            amount={booking.rentReceived || 0} 
            variant="green" 
          />
          
          <PaymentStatCard 
            label="Secondary Income" 
            amount={secondaryIncome} 
            variant="purple" 
          />
        </div>
      </div>
    </Card>
  );
};
