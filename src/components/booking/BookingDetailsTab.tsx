
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BookingDetailsTabProps {
  booking: any;
  onSubmit: (booking: any) => void;
  onCancel: () => void;
}

export const BookingDetailsTab = ({ booking, onSubmit, onCancel }: BookingDetailsTabProps) => {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (booking) {
      setNotes(booking.notes || "");
    }
  }, [booking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedBooking = {
      ...booking,
      notes: notes
    };

    onSubmit(updatedBooking);
  };

  if (!booking) return null;

  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Read-only fields */}
      <div className="space-y-2">
        <Label className="text-gray-700">Event Name</Label>
        <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-700">
          {booking.eventName}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700">Client Name</Label>
        <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-700">
          {booking.clientName}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700">Phone Number</Label>
        <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-700">
          {booking.phoneNumber}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-700">Start Date</Label>
          <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-700">
            {startDate.toLocaleDateString('en-IN')}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-700">Start Time</Label>
          <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-700">
            {startDate.toTimeString().slice(0, 5)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-700">End Date</Label>
          <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-700">
            {endDate.toLocaleDateString('en-IN')}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-700">End Time</Label>
          <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-700">
            {endDate.toTimeString().slice(0, 5)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-700">Rent</Label>
          <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-700">
            ₹{booking.rent.toLocaleString()}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-700">Advance</Label>
          <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-700">
            ₹{booking.advance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Editable notes field */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-gray-700">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="border-amber-200 focus:border-amber-500"
          placeholder="Add notes about this booking..."
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="border-amber-200 text-amber-700 hover:bg-amber-50">
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
          Update Notes
        </Button>
      </div>
    </form>
  );
};
