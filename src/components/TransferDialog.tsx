
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Account } from "@/hooks/useAccounts";

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  onTransfer: (fromAccountId: string, toAccountId: string, amount: number, description?: string) => Promise<void>;
}

export const TransferDialog = ({ open, onOpenChange, accounts, onTransfer }: TransferDialogProps) => {
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromAccountId || !toAccountId || !amount) {
      return;
    }

    if (fromAccountId === toAccountId) {
      return;
    }

    setLoading(true);
    try {
      await onTransfer(fromAccountId, toAccountId, parseFloat(amount), description);
      setFromAccountId("");
      setToAccountId("");
      setAmount("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      // Error handled by the hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Amount</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromAccount">From Account</Label>
            <Select value={fromAccountId} onValueChange={setFromAccountId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select source account" />
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

          <div className="space-y-2">
            <Label htmlFor="toAccount">To Account</Label>
            <Select value={toAccountId} onValueChange={setToAccountId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select destination account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter(acc => acc.id !== fromAccountId).map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} (₹{account.balance.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Transfer description"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Transferring...' : 'Transfer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
