
import { Calendar, User, Phone, IndianRupee, Edit, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface BookingCardProps {
  booking: any;
  onEdit: (booking: any) => void;
  onCancel?: (bookingId: string) => void;
}

export const BookingCard = ({ booking, onEdit, onCancel }: BookingCardProps) => {
  const formatDate = (dateString: string) => {
    // Create date object from the ISO string but treat it as local time
    const dateParts = dateString.replace('T', ' ').replace('Z', '').split(/[-\s:]/);
    const date = new Date(
      parseInt(dateParts[0]), 
      parseInt(dateParts[1]) - 1, 
      parseInt(dateParts[2]), 
      parseInt(dateParts[3] || '0'), 
      parseInt(dateParts[4] || '0')
    );
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    // Create date object from the ISO string but treat it as local time
    const dateParts = dateString.replace('T', ' ').replace('Z', '').split(/[-\s:]/);
    const date = new Date(
      parseInt(dateParts[0]), 
      parseInt(dateParts[1]) - 1, 
      parseInt(dateParts[2]), 
      parseInt(dateParts[3] || '0'), 
      parseInt(dateParts[4] || '0')
    );
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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

  // Calculate additional income from payments only (not from categories)
  const additionalIncome = (booking.payments || [])
    .filter(payment => payment.type === 'additional' && !payment.description?.includes('categories'))
    .reduce((sum, payment) => sum + payment.amount, 0);

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
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(booking)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
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
          <div className="text-center">
            <div className="flex items-center justify-center text-blue-600 mb-1">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm font-semibold">{booking.rent}</span>
            </div>
            <p className="text-xs text-gray-500">Rent Finalized</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center text-green-600 mb-1">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm font-semibold">{booking.advance || 0}</span>
            </div>
            <p className="text-xs text-gray-500">Rent Received</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center text-purple-600 mb-1">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm font-semibold">{additionalIncome}</span>
            </div>
            <p className="text-xs text-gray-500">Additional Income</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
