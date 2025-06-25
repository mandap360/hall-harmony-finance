
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useVendors } from "@/hooks/useVendors";
import { useAccounts } from "@/hooks/useAccounts";
import { useTax } from "@/hooks/useTax";
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
    date: new Date().toISOString().split('T')[0],
    category: "",
    amount: "",
    taxRateId: "",
    paidThrough: "",
  });

  const [showAddVendorDialog, setShowAddVendorDialog] = useState(false);

  const { getExpenseCategories } = useCategories();
  const { vendors, addVendor } = useVendors();
  const { accounts } = useAccounts();
  const { taxRates } = useTax();
  const expenseCategories = getExpenseCategories();
  const paymentAccounts = accounts.filter(acc => acc.account_type === 'operational' || acc.account_type === 'capital');

  const calculateTaxAmounts = () => {
    const baseAmount = parseFloat(formData.amount) || 0;
    const selectedTaxRate = taxRates.find(tax => tax.id === formData.taxRateId);
    const taxPercentage = selectedTaxRate?.percentage || 0;
    const taxAmount = (baseAmount * taxPercentage) / 100;
    const totalAmount = baseAmount + taxAmount;
    
    return { taxAmount, totalAmount, taxPercentage };
  };

  const { taxAmount, totalAmount, taxPercentage } = calculateTaxAmounts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorId || !formData.amount || !formData.category || !formData.paidThrough) return;

    const selectedVendor = vendors.find(v => v.id === formData.vendorId);
    const { taxAmount, totalAmount } = calculateTaxAmounts();

    onSubmit({
      ...formData,
      vendorName: selectedVendor?.businessName || "",
      amount: parseFloat(formData.amount),
      cgstAmount: taxAmount / 2, // Split tax equally between CGST and SGST for backwards compatibility
      sgstAmount: taxAmount / 2,
      cgstPercentage: taxPercentage / 2,
      sgstPercentage: taxPercentage / 2,
      totalAmount,
      isPaid: formData.paidThrough !== "unpaid",
      accountId: formData.paidThrough !== "unpaid" ? formData.paidThrough : null,
    });

    setFormData({
      vendorId: "",
      billNumber: "",
      date: new Date().toISOString().split('T')[0],
      category: "",
      amount: "",
      taxRateId: "",
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
              <Label htmlFor="date">Bill Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
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

            <div>
              <Label htmlFor="tax">Tax</Label>
              <div className="flex items-center space-x-2">
                <Select 
                  value={formData.taxRateId} 
                  onValueChange={(value) => setFormData({ ...formData, taxRateId: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select tax rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_tax">No Tax</SelectItem>
                    {taxRates.map((tax) => (
                      <SelectItem key={tax.id} value={tax.id}>
                        {tax.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {taxAmount > 0 && (
                  <span className="text-sm text-gray-600">₹{taxAmount.toFixed(2)}</span>
                )}
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
