
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import { IndianRupee, AlertCircle } from "lucide-react";

interface AdditionalIncomeRefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxRefundAmount: number;
  bookingId: string;
  onRefund: (refundAmount: number, accountId: string, description: string) => Promise<void>;
}

export const AdditionalIncomeRefundDialog = ({
  open,
  onOpenChange,
  maxRefundAmount,
  bookingId,
  onRefund
}: AdditionalIncomeRefundDialogProps) => {
  const { accounts } = useAccounts();
  const [accountId, setAccountId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountId || maxRefundAmount <= 0) return;

    setIsProcessing(true);
    try {
      await onRefund(maxRefundAmount, accountId, "Available amount refunded to client");
      onOpenChange(false);
      setAccountId("");
    } catch (error) {
      console.error('Error processing refund:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setAccountId("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-700">Refund Secondary Income</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Refund Amount Display */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center text-red-700 mb-1">
                <IndianRupee className="h-5 w-5" />
                <span className="text-2xl font-bold">{maxRefundAmount.toLocaleString()}</span>
              </div>
              <p className="text-sm text-red-600">Amount to be refunded</p>
              <p className="text-xs text-gray-600 mt-1">
                (Full available amount will be refunded)
              </p>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <Label htmlFor="accountId" className="text-gray-700">
              Select Payment Method *
            </Label>
            <Select value={accountId} onValueChange={setAccountId} required>
              <SelectTrigger className="border-red-200 focus:border-red-500">
                <SelectValue placeholder="Choose account to debit from" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} (₹{account.balance.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 text-xs text-orange-600 p-3 bg-orange-50 rounded border border-orange-200">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">This action will:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Reduce total secondary income by ₹{maxRefundAmount.toLocaleString()}</li>
                <li>Debit ₹{maxRefundAmount.toLocaleString()} from selected account</li>
                <li>Add refund entry to payment history</li>
                <li>Set "Available to allocate" to ₹0</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!accountId || maxRefundAmount <= 0 || isProcessing}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Processing..." : "Process Refund"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
