
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useVendors } from "@/hooks/useVendors";
import { useAccounts } from "@/hooks/useAccounts";
import { AddVendorDialog } from "@/components/AddVendorDialog";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expenseData: any) => void;
}

export const AddExpenseDialog = ({ open, onOpenChange, onSubmit }: AddExpenseDialogProps) => {
  const [formData, setFormData] = useState({
    vendorId: "",
    billNumber: "",
    category: "",
    amount: "",
    cgstPercentage: 6,
    sgstPercentage: 6,
    date: new Date().toISOString().split('T')[0],
    paidThrough: "",
  });

  const [showAddVendorDialog, setShowAddVendorDialog] = useState(false);

  const { getExpenseCategories } = useCategories();
  const { vendors, addVendor } = useVendors();
  const { accounts } = useAccounts();
  const expenseCategories = getExpenseCategories();
  const paymentAccounts = accounts.filter(acc => acc.account_type === 'operational' || acc.account_type === 'capital');

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
    if (!formData.vendorId || !formData.amount || !formData.category || !formData.paidThrough) return;

    const selectedVendor = vendors.find(v => v.id === formData.vendorId);
    const { cgstAmount, sgstAmount, totalAmount } = calculateTaxAmounts();

    onSubmit({
      ...formData,
      vendorName: selectedVendor?.businessName || "",
      amount: parseFloat(formData.amount),
      cgstAmount,
      sgstAmount,
      totalAmount,
      isPaid: formData.paidThrough !== "unpaid",
      accountId: formData.paidThrough !== "unpaid" ? formData.paidThrough : null,
    });

    setFormData({
      vendorId: "",
      billNumber: "",
      category: "",
      amount: "",
      cgstPercentage: 6,
      sgstPercentage: 6,
      date: new Date().toISOString().split('T')[0],
      paidThrough: "",
    });
  };

  const handleAddVendor = (vendorData: any) => {
    addVendor(vendorData);
    setShowAddVendorDialog(false);
  };

  const handleVendorChange = (value: string) => {
    if (value === "add_vendor") {
      setShowAddVendorDialog(true);
    } else {
      setFormData({ ...formData, vendorId: value });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="vendor">Vendor</Label>
              <Select value={formData.vendorId} onValueChange={handleVendorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add_vendor" className="text-blue-600 font-medium">
                    + Add Vendor
                  </SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="paidThrough">Paid Through</Label>
              <Select value={formData.paidThrough} onValueChange={(value) => setFormData({ ...formData, paidThrough: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  {paymentAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} (₹{account.balance.toLocaleString()})
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

      <AddVendorDialog
        open={showAddVendorDialog}
        onOpenChange={setShowAddVendorDialog}
        onSubmit={handleAddVendor}
      />
    </>
  );
};
