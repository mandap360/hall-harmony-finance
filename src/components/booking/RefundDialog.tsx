
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";

interface RefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onRefund: (refundData: {
    bookingId: string;
    amount: number;
    paymentMode: string;
    description: string;
  }) => void;
}

export const RefundDialog = ({ open, onOpenChange, booking, onRefund }: RefundDialogProps) => {
  const [refundAmount, setRefundAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [description, setDescription] = useState("");
  const { accounts } = useAccounts();
  const { addTransaction } = useTransactions();

  const totalPaid = booking?.advance || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundAmount || !paymentMode) return;

    const refundAmountNum = parseFloat(refundAmount);
    const selectedAccount = accounts.find(acc => acc.id === paymentMode);

    // Format function date for transaction description
    const functionDate = booking ? new Date(booking.startDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) : '';

    const transactionDescription = `Rent Refund (Cancellation) - ${booking.eventName} for ${functionDate}`;

    // Add transaction record for the refund
    try {
      await addTransaction({
        account_id: paymentMode,
        transaction_type: 'debit',
        amount: refundAmountNum,
        description: description || transactionDescription,
        reference_type: 'booking_refund',
        reference_id: booking.id,
        transaction_date: new Date().toISOString().split('T')[0]
      });

      // Process the refund in the booking system
      onRefund({
        bookingId: booking.id,
        amount: refundAmountNum,
        paymentMode: selectedAccount?.name || paymentMode,
        description: description || transactionDescription,
      });

      // Reset form
      setRefundAmount("");
      setPaymentMode("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              Booking: <span className="font-medium">{booking?.eventName}</span>
            </p>
            <p className="text-sm text-gray-600">
              Total Paid: <span className="font-medium">₹{totalPaid}</span>
            </p>
          </div>

          <div>
            <Label htmlFor="refundAmount">
              Refund Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="refundAmount"
              type="number"
              step="0.01"
              max={totalPaid}
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder="Enter refund amount"
              required
            />
          </div>

          <div>
            <Label htmlFor="paymentMode">
              Payment Method <span className="text-red-500">*</span>
            </Label>
            <Select value={paymentMode} onValueChange={setPaymentMode} required>
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

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Refund description"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Process Refund</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
