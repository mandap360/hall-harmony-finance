
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";

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
    cgstPercentage: 6,
    sgstPercentage: 6,
    date: new Date().toISOString().split('T')[0],
  });

  const { getExpenseCategories } = useCategories();
  const expenseCategories = getExpenseCategories();

  const calculateTaxAmounts = () => {
    const baseAmount = parseFloat(formData.amount) || 0;
    const cgstAmount = (baseAmount * formData.cgstPercentage) / 100;
    const sgstAmount = (baseAmount * formData.sgstPercentage) / 100;
    const totalAmount = baseAmount + cgstAmount + sgstAmount;
    
    return { cgstAmount, sgstAmount, totalAmount };
  };

  const { cgstAmount, sgstAmount, totalAmount } = calculateTaxAmounts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorName || !formData.amount || !formData.category) return;

    const { cgstAmount, sgstAmount, totalAmount } = calculateTaxAmounts();

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      cgstAmount,
      sgstAmount,
      totalAmount,
    });

    setFormData({
      vendorName: "",
      billNumber: "",
      category: "",
      amount: "",
      cgstPercentage: 6,
      sgstPercentage: 6,
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
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Bill Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cgst">CGST</Label>
              <div className="flex items-center space-x-2">
                <Select 
                  value={formData.cgstPercentage.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, cgstPercentage: parseInt(value) })}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6%</SelectItem>
                    <SelectItem value="9">9%</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">₹{cgstAmount.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="sgst">SGST</Label>
              <div className="flex items-center space-x-2">
                <Select 
                  value={formData.sgstPercentage.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, sgstPercentage: parseInt(value) })}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6%</SelectItem>
                    <SelectItem value="9">9%</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">₹{sgstAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Amount:</span>
              <span className="font-bold text-lg">₹{totalAmount.toFixed(2)}</span>
            </div>
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
