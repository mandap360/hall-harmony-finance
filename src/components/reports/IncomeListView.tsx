
import { useState } from "react";
import { ArrowLeft, Calendar, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookings } from "@/hooks/useBookings";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

  // Get current FY entries and flatten payments
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
  });

  // Create income entries from payments
  const incomeEntries = currentFYBookings
    .filter(booking => (booking.payments?.length || 0) > 0)
    .flatMap(booking => 
      booking.payments?.map(payment => ({
        date: payment.date,
        description: `${payment.type === 'advance' ? 'Advance' : payment.type === 'rent' ? 'Rent' : 'Additional'} payment from ${booking.clientName} for ${booking.eventName} (${formatDate(booking.startDate)} - ${formatDate(booking.endDate)})`,
        amount: payment.amount
      })) || []
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
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

        {incomeEntries.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-32 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeEntries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(entry.date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {entry.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end text-green-600 font-semibold">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        ₹{entry.amount.toLocaleString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No income entries found</p>
          </div>
        )}
      </div>
    </div>
  );
};
