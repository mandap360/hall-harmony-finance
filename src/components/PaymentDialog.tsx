
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndianRupee } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onSubmit: (amount: number) => void;
}

export const PaymentDialog = ({ open, onOpenChange, booking, onSubmit }: PaymentDialogProps) => {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = Number(amount);
    if (paymentAmount > 0 && paymentAmount <= booking.remainingBalance) {
      onSubmit(paymentAmount);
      setAmount("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-rose-600" />
            Add Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-rose-50 p-4 rounded-lg space-y-2">
            <p className="font-semibold text-gray-900">{booking?.eventName}</p>
            <p className="text-sm text-gray-600">{booking?.clientName}</p>
            <div className="flex justify-between text-sm">
              <span>Total Rent:</span>
              <span className="font-semibold">₹{booking?.rent?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Paid Amount:</span>
              <span className="font-semibold text-green-600">₹{booking?.totalPaid?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span>Remaining Balance:</span>
              <span className="font-semibold text-rose-600">₹{booking?.remainingBalance?.toLocaleString()}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Payment Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={booking?.remainingBalance}
                min="1"
                required
                className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
              />
              <p className="text-xs text-gray-500">
                Maximum: ₹{booking?.remainingBalance?.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                disabled={!amount || Number(amount) <= 0 || Number(amount) > booking?.remainingBalance}
              >
                Add Payment
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
