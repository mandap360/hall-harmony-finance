
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTax } from "@/hooks/useTax";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expenseData: any) => void;
}

export const AddExpenseDialog = ({ open, onOpenChange, onSubmit }: AddExpenseDialogProps) => {
  const [formData, setFormData] = useState({
    vendorName: "",
    billNumber: "",
    category: "",
    amount: "",
    includesGST: true,
    gstPercentage: 18,
    date: new Date().toISOString().split('T')[0],
  });

  const { taxRates } = useTax();

  const expenseCategories = [
    "Office Supplies",
    "Utilities",
    "Maintenance",
    "Marketing",
    "Food & Catering",
    "Transportation",
    "Professional Services",
    "Equipment",
    "Other"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorName || !formData.amount || !formData.category) return;

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
    });

    setFormData({
      vendorName: "",
      billNumber: "",
      category: "",
      amount: "",
      includesGST: true,
      gstPercentage: 18,
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="vendorName">Vendor Name</Label>
            <Input
              id="vendorName"
              value={formData.vendorName}
              onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="billNumber">Bill Number</Label>
            <Input
              id="billNumber"
              value={formData.billNumber}
              onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="category">Expense Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="includesGST">GST</Label>
            <Select 
              value={formData.includesGST ? "including" : "excluding"} 
              onValueChange={(value) => setFormData({ ...formData, includesGST: value === "including" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="including">Including GST</SelectItem>
                <SelectItem value="excluding">Excluding GST</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gstPercentage">GST %</Label>
            <Select 
              value={formData.gstPercentage.toString()} 
              onValueChange={(value) => setFormData({ ...formData, gstPercentage: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {taxRates.map((tax) => (
                  <SelectItem key={tax.id} value={tax.percentage.toString()}>
                    {tax.percentage}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
