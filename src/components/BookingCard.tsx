
import { Calendar, User, Phone, IndianRupee, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BookingCardProps {
  booking: any;
  onEdit: (booking: any) => void;
  onAddPayment: (booking: any) => void;
  userRole: 'admin' | 'manager';
}

export const BookingCard = ({ booking, onEdit, onAddPayment, userRole }: BookingCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200 border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {booking.eventName}
          </h3>
          <div className="flex items-center text-gray-600 mb-1">
            <User className="h-4 w-4 mr-2" />
            <span className="text-sm">{booking.clientName}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            <span className="text-sm">{booking.phoneNumber}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {userRole === 'admin' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(booking)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {booking.remainingBalance > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddPayment(booking)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-gray-700">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-sm">
            {formatDate(booking.startDate)} at {formatTime(booking.startDate)}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center text-green-600 mb-1">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm font-semibold">{booking.totalPaid?.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500">Paid</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center text-orange-600 mb-1">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm font-semibold">{booking.remainingBalance?.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500">Remaining</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center text-blue-600 mb-1">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm font-semibold">{booking.rent?.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
