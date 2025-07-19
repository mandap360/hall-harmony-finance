import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBookings } from "@/hooks/useBookings";
import { useAccounts } from "@/hooks/useAccounts";
import { useToast } from "@/hooks/use-toast";

interface AddIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIncomeAdded?: () => void;
}

export const AddIncomeDialog = ({ open, onOpenChange, onIncomeAdded }: AddIncomeDialogProps) => {
  const [formData, setFormData] = useState({
    bookingId: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    type: "rent",
    description: "",
    paymentMode: ""
  });

  const { bookings, addPayment } = useBookings();
  const { accounts } = useAccounts();
  const { toast } = useToast();

  // Filter bookings to only show confirmed ones
  const availableBookings = bookings.filter(booking => booking.status !== 'cancelled');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bookingId || !formData.amount || !formData.paymentMode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await addPayment(
        formData.bookingId,
        parseFloat(formData.amount),
        formData.date,
        formData.type,
        formData.description,
        formData.paymentMode
      );

      // Reset form
      setFormData({
        bookingId: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        type: "rent",
        description: "",
        paymentMode: ""
      });

      onIncomeAdded?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bookingId">Booking *</Label>
            <Select value={formData.bookingId} onValueChange={(value) => handleChange("bookingId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select booking" />
              </SelectTrigger>
              <SelectContent>
                {availableBookings.map((booking) => (
                  <SelectItem key={booking.id} value={booking.id}>
                    {booking.eventName} - {booking.clientName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Income Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="advance">Advance</SelectItem>
                <SelectItem value="Secondary Income">Secondary Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMode">Payment Method *</Label>
            <Select value={formData.paymentMode} onValueChange={(value) => handleChange("paymentMode", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Income</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};