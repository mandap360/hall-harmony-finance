
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccounts } from "@/hooks/useAccounts";
import { useToast } from "@/hooks/use-toast";

interface SetOpeningBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  currentOpeningBalance: number;
}

export const SetOpeningBalanceDialog = ({ 
  open, 
  onOpenChange, 
  accountId, 
  currentOpeningBalance 
}: SetOpeningBalanceDialogProps) => {
  const [openingBalance, setOpeningBalance] = useState(currentOpeningBalance.toString());
  const { updateAccount, refreshAccounts } = useAccounts();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateAccount(accountId, { 
        opening_balance: parseFloat(openingBalance) || 0 
      });
      await refreshAccounts();
      
      toast({
        title: "Success",
        description: "Opening balance updated successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating opening balance:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Opening Balance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openingBalance">Opening Balance (₹)</Label>
            <Input
              id="openingBalance"
              type="number"
              step="0.01"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="Enter opening balance"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Balance
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
