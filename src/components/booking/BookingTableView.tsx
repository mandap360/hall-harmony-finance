import { format } from "date-fns";
import { Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface BookingTableViewProps {
  bookings: any[];
  onEditBooking: (booking: any) => void;
}

export const BookingTableView = ({ bookings, onEditBooking }: BookingTableViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getClientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
      {/* Table Header */}
      <div className="bg-muted/50 px-6 py-4 border-b border-border">
        <div className="grid grid-cols-7 gap-4 text-sm font-medium text-muted-foreground">
          <div>ID</div>
          <div>Client</div>
          <div>Date</div>
          <div>Time</div>
          <div>Service</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border">
        {bookings.map((booking) => {
          const startDate = new Date(booking.startDate);
          const endDate = new Date(booking.endDate);
          
          return (
            <div key={booking.id} className="px-6 py-4 hover:bg-muted/20 transition-colors">
              <div className="grid grid-cols-7 gap-4 items-center">
                {/* ID */}
                <div className="text-sm font-medium text-foreground">
                  #B-{booking.id.slice(-4)}
                </div>

                {/* Client */}
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8 bg-primary">
                    <AvatarFallback className="text-xs font-medium text-white">
                      {getClientInitials(booking.clientName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {booking.clientName}
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="text-sm text-foreground">
                  {format(startDate, "MMM dd, yyyy")}
                </div>

                {/* Time */}
                <div className="text-sm text-foreground">
                  {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                </div>

                {/* Service */}
                <div className="text-sm text-foreground">
                  {booking.eventName}
                </div>

                {/* Status */}
                <div>
                  <Badge className={`text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status === 'confirmed' ? 'Confirmed' : 
                     booking.status === 'pending' ? 'Pending' :
                     booking.status === 'cancelled' ? 'Cancelled' : booking.status}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditBooking(booking)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditBooking(booking)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {bookings.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-muted-foreground">No bookings found for this month</p>
        </div>
      )}
    </div>
  );
};