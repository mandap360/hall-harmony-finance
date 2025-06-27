
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndianRupee, AlertCircle } from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";
import { useToast } from "@/hooks/use-toast";

interface AdditionalIncomeRefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxRefundAmount: number;
  bookingId: string;
  onRefund: (amount: number, accountId: string, description: string) => Promise<void>;
}

export const AdditionalIncomeRefundDialog = ({
  open,
  onOpenChange,
  maxRefundAmount,
  bookingId,
  onRefund
}: AdditionalIncomeRefundDialogProps) => {
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [description, setDescription] = useState("Additional income refund to client");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { accounts } = useAccounts();
  const { toast } = useToast();

  const operationalAccounts = accounts.filter(account => account.account_type === 'operational');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const refundAmount = Number(amount);
    
    // Validation
    if (!refundAmount || refundAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid refund amount",
        variant: "destructive",
      });
      return;
    }
    
    if (refundAmount > maxRefundAmount) {
      toast({
        title: "Amount exceeds limit",
        description: `Maximum refund amount is ₹${maxRefundAmount.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }
    
    if (!accountId) {
      toast({
        title: "Account required",
        description: "Please select an account for the refund",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onRefund(refundAmount, accountId, description);
      onOpenChange(false);
      // Reset form
      setAmount("");
      setAccountId("");
      setDescription("Additional income refund to client");
    } catch (error) {
      console.error('Error processing refund:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setAmount("");
    setAccountId("");
    setDescription("Additional income refund to client");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-red-700 flex items-center">
            <IndianRupee className="h-5 w-5 mr-2" />
            Refund Additional Income
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center text-amber-700 mb-1">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Available to Refund</span>
            </div>
            <div className="flex items-center text-amber-800">
              <IndianRupee className="h-5 w-5" />
              <span className="text-xl font-bold">{maxRefundAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund-amount">Refund Amount</Label>
            <Input
              id="refund-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter refund amount"
              max={maxRefundAmount}
              className="border-red-200 focus:border-red-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund-account">Refund From Account</Label>
            <Select value={accountId} onValueChange={setAccountId} required>
              <SelectTrigger className="border-red-200 focus:border-red-500">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {operationalAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} (₹{account.balance.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund-description">Description (Optional)</Label>
            <Textarea
              id="refund-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="border-red-200 focus:border-red-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Process Refund"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
