
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBookings } from "@/hooks/useBookings";
import { useToast } from "@/hooks/use-toast";

interface AddBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (booking: any) => void;
}

export const AddBookingDialog = ({ open, onOpenChange, onSubmit }: AddBookingDialogProps) => {
  const { bookings } = useBookings();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    eventName: "",
    clientName: "",
    phoneNumber: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    rent: "",
    notes: ""
  });

  const checkForOverlap = (newStart: string, newEnd: string) => {
    console.log('Checking overlap for new booking:', {
      newStart,
      newEnd
    });

    return bookings.some(booking => {
      // Direct string comparison - no timezone conversion
      // Two intervals overlap if newStart < existingEnd AND newEnd > existingStart
      const hasOverlap = newStart < booking.endDate && newEnd > booking.startDate;
      
      console.log('Checking against existing booking:', {
        existingBooking: booking.eventName,
        existingStart: booking.startDate,
        existingEnd: booking.endDate,
        newStart,
        newEnd,
        condition1: newStart < booking.endDate,
        condition2: newEnd > booking.startDate,
        hasOverlap
      });
      
      return hasOverlap;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = `${formData.startDate}T${formData.startTime}`;
    const endDateTime = `${formData.endDate}T${formData.endTime}`;
    
    // Validate that end time is after start time
    if (endDateTime <= startDateTime) {
      toast({
        title: "Invalid time range",
        description: "End date and time must be after start date and time",
        variant: "destructive",
      });
      return;
    }

    // Check for overlapping bookings
    if (checkForOverlap(startDateTime, endDateTime)) {
      toast({
        title: "Booking conflict",
        description: "This time slot overlaps with an existing booking. Please choose a different time.",
        variant: "destructive",
      });
      return;
    }
    
    const bookingData = {
      id: Date.now().toString(),
      eventName: formData.eventName,
      clientName: formData.clientName,
      phoneNumber: formData.phoneNumber,
      startDate: startDateTime,
      endDate: endDateTime,
      rentFinalized: parseInt(formData.rent),
      rentReceived: 0, // Default rent received to 0
      notes: formData.notes, // Include notes in the booking data
      paidAmount: 0,
      payments: []
    };

    onSubmit(bookingData);
    
    // Reset form
    setFormData({
      eventName: "",
      clientName: "",
      phoneNumber: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      rent: "",
      notes: ""
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Booking</DialogTitle>
        </DialogHeader>
        
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
            <Label htmlFor="rentFinalized">Rent Finalized <span className="text-red-500">*</span></Label>
            <Input
              id="rentFinalized"
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Booking</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
