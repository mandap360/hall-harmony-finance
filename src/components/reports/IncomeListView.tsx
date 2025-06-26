
import { useState } from "react";
import { ArrowLeft, Calendar, User, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBookings } from "@/hooks/useBookings";

interface IncomeListViewProps {
  onBack: () => void;
}

export const IncomeListView = ({ onBack }: IncomeListViewProps) => {
  const { bookings } = useBookings();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get current FY bookings with payments
  const getCurrentFY = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    if (month >= 3) {
      return { startYear: year, endYear: year + 1 };
    } else {
      return { startYear: year - 1, endYear: year };
    }
  };

  const currentFY = getCurrentFY();
  
  const currentFYBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.startDate);
    const bookingYear = bookingDate.getFullYear();
    const bookingMonth = bookingDate.getMonth();
    
    if (bookingMonth >= 3) {
      return bookingYear === currentFY.startYear;
    } else {
      return bookingYear === currentFY.endYear;
    }
  }).filter(booking => (booking.payments?.length || 0) > 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Income Entries</h2>

        <div className="space-y-4">
          {currentFYBookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {booking.eventName}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-1">
                    <User className="h-4 w-4 mr-2" />
                    <span className="text-sm">{booking.clientName}</span>
                  </div>
                  <div className="flex items-center text-gray-700 mb-3">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    </span>
                  </div>
                  
                  {/* Payment Details */}
                  <div className="space-y-2">
                    {booking.payments?.map((payment, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {payment.type}
                        </Badge>
                        <div className="flex items-center text-green-600">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          <span className="font-semibold">₹{payment.amount.toLocaleString()}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          on {formatDate(payment.date)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {currentFYBookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No income entries found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
