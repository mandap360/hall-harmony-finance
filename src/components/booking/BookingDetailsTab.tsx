
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBookings } from "@/hooks/useBookings";
import { useToast } from "@/hooks/use-toast";

interface BookingDetailsTabProps {
  booking: any;
  onSubmit: (booking: any) => void;
  onCancel: () => void;
}

export const BookingDetailsTab = ({ booking, onSubmit, onCancel }: BookingDetailsTabProps) => {
  const { bookings } = useBookings();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    notes: booking.notes || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedBooking = {
      ...booking,
      notes: formData.notes
    };

    onSubmit(updatedBooking);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Simple date/time formatting without timezone conversion
  const formatDateTime = (dateTime: string) => {
    // Extract date and time directly from the ISO string
    const [datePart, timePart] = dateTime.split('T');
    const timeOnly = timePart ? timePart.substring(0, 5) : '00:00'; // Get HH:MM only
    return {
      date: datePart,
      time: timeOnly
    };
  };

  const startDateTime = formatDateTime(booking.startDate);
  const endDateTime = formatDateTime(booking.endDate);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="eventName">Event Name</Label>
        <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
          {booking.eventName}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientName">Client Name</Label>
        <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
          {booking.clientName}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
          {booking.phoneNumber}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {startDateTime.date}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {startDateTime.time}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {endDateTime.date}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {endDateTime.time}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rent">Rent Finalized</Label>
        <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
          ₹{booking.rent?.toLocaleString()}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update Booking</Button>
      </div>
    </form>
  );
};
