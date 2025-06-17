
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BookingDetailsTabProps {
  booking: any;
  onSubmit: (booking: any) => void;
  onCancel: () => void;
}

export const BookingDetailsTab = ({ booking, onSubmit, onCancel }: BookingDetailsTabProps) => {
  const [formData, setFormData] = useState({
    eventName: "",
    clientName: "",
    phoneNumber: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    rent: "",
    advance: "",
    notes: ""
  });

  useEffect(() => {
    if (booking) {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      
      setFormData({
        eventName: booking.eventName,
        clientName: booking.clientName,
        phoneNumber: booking.phoneNumber,
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endDate: endDate.toISOString().split('T')[0],
        endTime: endDate.toTimeString().slice(0, 5),
        rent: booking.rent.toString(),
        advance: booking.advance.toString(),
        notes: booking.notes || ""
      });
    }
  }, [booking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedBooking = {
      ...booking,
      eventName: formData.eventName,
      clientName: formData.clientName,
      phoneNumber: formData.phoneNumber,
      startDate: `${formData.startDate}T${formData.startTime}`,
      endDate: `${formData.endDate}T${formData.endTime}`,
      rent: parseInt(formData.rent),
      advance: parseInt(formData.advance),
      notes: formData.notes
    };

    onSubmit(updatedBooking);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="eventName">Event Name *</Label>
        <Input
          id="eventName"
          value={formData.eventName}
          onChange={(e) => setFormData(prev => ({ ...prev, eventName: e.target.value }))}
          required
          className="border-amber-200 focus:border-amber-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientName">Client Name *</Label>
        <Input
          id="clientName"
          value={formData.clientName}
          onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
          required
          className="border-amber-200 focus:border-amber-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number *</Label>
        <Input
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
          required
          className="border-amber-200 focus:border-amber-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
            className="border-amber-200 focus:border-amber-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time *</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
            required
            className="border-amber-200 focus:border-amber-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rent">Rent *</Label>
          <Input
            id="rent"
            type="number"
            value={formData.rent}
            onChange={(e) => setFormData(prev => ({ ...prev, rent: e.target.value }))}
            required
            className="border-amber-200 focus:border-amber-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="advance">Advance *</Label>
          <Input
            id="advance"
            type="number"
            value={formData.advance}
            onChange={(e) => setFormData(prev => ({ ...prev, advance: e.target.value }))}
            required
            className="border-amber-200 focus:border-amber-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="border-amber-200 focus:border-amber-500"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="border-amber-200 text-amber-700 hover:bg-amber-50">
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
          Update Booking
        </Button>
      </div>
    </form>
  );
};
