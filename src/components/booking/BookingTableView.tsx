import { format } from "date-fns";
import { Eye, Edit, Calendar, User, Clock, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface BookingTableViewProps {
  bookings: any[];
  onEditBooking: (booking: any) => void;
}

export const BookingTableView = ({ bookings, onEditBooking }: BookingTableViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
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
    <div className="space-y-4">
      {bookings.map((booking) => {
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        
        return (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {booking.eventName}
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getStatusColor(booking.status)} px-3 py-1`}>
                    {booking.status === 'confirmed' ? 'Confirmed' : 
                     booking.status === 'pending' ? 'Pending' :
                     booking.status === 'cancelled' ? 'Cancelled' : booking.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditBooking(booking)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{booking.clientName}</span>
                </div>
                
                {booking.phoneNumber && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{booking.phoneNumber}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {format(startDate, "dd MMM yyyy")}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {format(startDate, "hh:mm a")} - {format(endDate, "hh:mm a")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    ₹ {booking.rentFinalized?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Rent Finalized</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    ₹ {booking.rentReceived?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Rent Received</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">
                    ₹ 0
                  </div>
                  <div className="text-xs text-muted-foreground">Additional Income</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};