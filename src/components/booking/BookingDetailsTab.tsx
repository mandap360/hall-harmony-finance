
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    eventName: booking.eventName || "",
    clientName: booking.clientName || "",
    phoneNumber: booking.phoneNumber || "",
    startDate: booking.startDate?.split('T')[0] || "",
    startTime: booking.startDate?.split('T')[1]?.slice(0, 5) || "",
    endDate: booking.endDate?.split('T')[0] || "",
    endTime: booking.endDate?.split('T')[1]?.slice(0, 5) || "",
    rent: booking.rent?.toString() || "",
    notes: booking.notes || ""
  });

  const checkForOverlap = (newStart: string, newEnd: string, excludeId: string) => {
    const newStartTime = new Date(newStart).getTime();
    const newEndTime = new Date(newEnd).getTime();

    return bookings.some(existingBooking => {
      if (existingBooking.id === excludeId) return false; // Exclude current booking
      
      const existingStart = new Date(existingBooking.startDate).getTime();
      const existingEnd = new Date(existingBooking.endDate).getTime();
      
      // Check if there's any overlap
      const hasOverlap = newStartTime < existingEnd && newEndTime > existingStart;
      
      if (hasOverlap) {
        console.log('Overlap detected:', {
          newStart: new Date(newStart),
          newEnd: new Date(newEnd),
          existingStart: new Date(existingBooking.startDate),
          existingEnd: new Date(existingBooking.endDate),
          booking: existingBooking.eventName
        });
      }
      
      return hasOverlap;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = `${formData.startDate}T${formData.startTime}`;
    const endDateTime = `${formData.endDate}T${formData.endTime}`;
    
    // Validate that end time is after start time
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      toast({
        title: "Invalid time range",
        description: "End date and time must be after start date and time",
        variant: "destructive",
      });
      return;
    }

    // Check for overlapping bookings (excluding current booking)
    if (checkForOverlap(startDateTime, endDateTime, booking.id)) {
      toast({
        title: "Booking conflict",
        description: "This time slot overlaps with an existing booking. Please choose a different time.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedBooking = {
      ...booking,
      eventName: formData.eventName,
      clientName: formData.clientName,
      phoneNumber: formData.phoneNumber,
      startDate: startDateTime,
      endDate: endDateTime,
      rent: parseInt(formData.rent),
      notes: formData.notes
    };

    onSubmit(updatedBooking);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="eventName">Event Name <span className="text-red-500">*</span></Label>
        <Input
          id="eventName"
          value={formData.eventName}
          onChange={(e) => handleChange("eventName", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientName">Client Name <span className="text-red-500">*</span></Label>
        <Input
          id="clientName"
          value={formData.clientName}
          onChange={(e) => handleChange("clientName", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
        <Input
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => handleChange("phoneNumber", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time <span className="text-red-500">*</span></Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => handleChange("startTime", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time <span className="text-red-500">*</span></Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => handleChange("endTime", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rent">Rent Finalized <span className="text-red-500">*</span></Label>
        <Input
          id="rent"
          type="number"
          value={formData.rent}
          onChange={(e) => handleChange("rent", e.target.value)}
          required
        />
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
