import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (account: any) => void;
}

export const AddAccountDialog = ({ open, onOpenChange, onSubmit }: AddAccountDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    account_type: "operational" as "operational" | "capital" | "party",
    opening_balance: "",
    gstin: "",
    phone_number: "",
    address: "",
    is_default: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      opening_balance: formData.opening_balance ? parseFloat(formData.opening_balance) : 0,
    });
    
    // Reset form
    setFormData({
      name: "",
      account_type: "operational",
      opening_balance: "",
      gstin: "",
      phone_number: "",
      address: "",
      is_default: false
    });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isPartyType = formData.account_type === "party";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{isPartyType ? "Party Name" : "Account Name"} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={isPartyType ? "e.g., ABC Traders" : "e.g., HDFC Bank, Petty Cash"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type *</Label>
            <Select value={formData.account_type} onValueChange={(value) => handleChange("account_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operational">Cash/Bank</SelectItem>
                <SelectItem value="capital">Owner's Capital</SelectItem>
                <SelectItem value="party">Party</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opening_balance">Opening Balance</Label>
            <Input
              id="opening_balance"
              type="number"
              step="0.01"
              value={formData.opening_balance}
              onChange={(e) => handleChange("opening_balance", e.target.value)}
              placeholder="0.00"
            />
          </div>

          {isPartyType && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number (Optional)</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => handleChange("phone_number", e.target.value)}
                  placeholder="e.g., 9876543210"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN (Optional)</Label>
                <Input
                  id="gstin"
                  value={formData.gstin}
                  onChange={(e) => handleChange("gstin", e.target.value)}
                  placeholder="e.g., 27AABCU9603R1ZM"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Enter party address"
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Account</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
