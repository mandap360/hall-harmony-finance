
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import { useToast } from "@/hooks/use-toast";
import { PaymentHistoryCard } from "./PaymentHistoryCard";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const { accounts } = useAccounts();
  const { toast } = useToast();

  // Calculate amount received and amount refunded
  const amountReceived = booking?.rentReceived || 0;
  const amountRefunded = booking?.payments?.filter((p: any) => p.type === 'refund')?.reduce((sum: number, p: any) => sum + Math.abs(p.amount), 0) || 0;
  const maxRefundAmount = amountReceived - amountRefunded;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundAmount || !paymentMode) return;

    const refundAmountNum = parseFloat(refundAmount);
    
    // Format function date for transaction description
    const functionDate = booking ? new Date(booking.startDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) : '';

    const transactionDescription = `Refund (Cancellation) for ${functionDate}`;

    setIsProcessing(true);
    console.log('Processing refund:', {
      bookingId: booking.id,
      amount: refundAmountNum,
      paymentMode: paymentMode, // This should be the account ID, not name
      description: description || transactionDescription,
    });

    try {
      // Process the refund through the booking system
      await onRefund({
        bookingId: booking.id,
        amount: refundAmountNum,
        paymentMode: paymentMode, // Pass the account ID directly
        description: description || transactionDescription,
      });

      // Reset form and close dialog
      setRefundAmount("");
      setPaymentMode("");
      setDescription("");
      onOpenChange(false);
      
      toast({
        title: "Success",
        description: "Refund processed successfully",
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: "Error",
        description: "Failed to process refund. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Amount Summary */}
          <div className="flex gap-8 justify-center py-2">
            <div className="text-center">
              <div className="text-green-600 font-semibold text-lg">₹{amountReceived.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Amount Received</div>
            </div>
            <div className="text-center">
              <div className="text-red-600 font-semibold text-lg">₹{amountRefunded.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Amount Refunded</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="refundAmount">
                Refund Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                max={maxRefundAmount}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Enter refund amount"
                required
                disabled={isProcessing}
              />
              {maxRefundAmount <= 0 && (
                <p className="text-sm text-red-600 mt-1">No refundable amount available</p>
              )}
            </div>

            <div>
              <Label htmlFor="paymentMode">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select value={paymentMode} onValueChange={setPaymentMode} required disabled={isProcessing}>
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
                disabled={isProcessing}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isProcessing || maxRefundAmount <= 0 || parseFloat(refundAmount) > maxRefundAmount}
              >
                {isProcessing ? "Processing..." : "Process Refund"}
              </Button>
            </div>
          </form>

          {/* Payment History */}
          {booking?.payments && (
            <PaymentHistoryCard payments={booking.payments} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
