
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useTax } from "@/hooks/useTax";
import { useVendors } from "@/hooks/useVendors";
import { useTaxCalculation } from "@/hooks/useTaxCalculation";
import { AddVendorDialog } from "@/components/AddVendorDialog";
import { APP_CONSTANTS, financialUtils } from "@/lib/utils";
import type { Expense } from "@/hooks/useExpenses";

interface ExpenseDetailsFormProps {
  expense: Expense;
  onUpdateExpense: (expenseData: any) => void;
  onCancel: () => void;
}

export const ExpenseDetailsForm = ({ expense, onUpdateExpense, onCancel }: ExpenseDetailsFormProps) => {
  const [formData, setFormData] = useState({
    vendorName: "",
    billNumber: "",
    date: "",
    category: "",
    amount: "",
    taxRateId: APP_CONSTANTS.DEFAULTS.TAX_RATE_ID as string,
  });
  const [showAddVendorDialog, setShowAddVendorDialog] = useState(false);

  const { getExpenseCategories } = useCategories();
  const { taxRates } = useTax();
  const { vendors, addVendor } = useVendors();
  const expenseCategories = getExpenseCategories();
  
  // Use tax calculation hook
  const { taxAmount, totalAmount, taxPercentage } = useTaxCalculation({
    amount: formData.amount,
    taxRateId: formData.taxRateId
  });

  const handleAddVendor = async (vendorData: any) => {
    await addVendor(vendorData);
    setFormData(prev => ({ ...prev, vendorName: vendorData.businessName }));
    setShowAddVendorDialog(false);
  };

  // Consolidated form initialization - handle both initial data and tax rate matching
  useEffect(() => {
    if (!expense) return;

    // Wait for all required data to be loaded
    if (taxRates.length === 0 || vendors.length === 0 || expenseCategories.length === 0) {
      return;
    }

    // Calculate the total tax percentage from existing tax data
    const totalTaxPercentage = (expense.cgstPercentage || 0) + (expense.sgstPercentage || 0);
    
    // Find matching tax rate
    const matchingTaxRate = taxRates.find(tax => tax.percentage === totalTaxPercentage);

    // Set form data with all values at once
    const newFormData = {
      vendorName: expense.vendorName || "",
      billNumber: expense.billNumber || "",
      date: expense.date || "",
      category: expense.category || "",
      amount: expense.amount?.toString() || "",
      taxRateId: matchingTaxRate?.id || APP_CONSTANTS.DEFAULTS.TAX_RATE_ID as string,
    };

    setFormData(newFormData);
  }, [expense, taxRates, vendors, expenseCategories]);

  // Remove duplicate tax calculation (now handled by useTaxCalculation hook)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.vendorName) return;

    const { cgstAmount, sgstAmount } = financialUtils.calculateTax(
      parseFloat(formData.amount), 
      taxPercentage
    );

    onUpdateExpense({
      ...expense,
      vendorName: formData.vendorName,
      billNumber: formData.billNumber,
      date: formData.date,
      category: formData.category,
      amount: parseFloat(formData.amount),
      cgstAmount,
      sgstAmount,
      cgstPercentage: taxPercentage / 2,
      sgstPercentage: taxPercentage / 2,
      totalAmount,
    });
  };

  // Remove console.log for production

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="vendorName">
          Payee <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Select 
            value={formData.vendorName} 
            onValueChange={(value) => {
              if (value === "add_new") {
                setShowAddVendorDialog(true);
              } else {
                setFormData({ ...formData, vendorName: value });
              }
            }}
            disabled={expense.isPaid}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.businessName}>
                  {vendor.businessName}
                </SelectItem>
              ))}
              <SelectItem value="add_new">+ Add New Vendor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="billNumber">Invoice No (Optional)</Label>
          <Input
            id="billNumber"
            value={formData.billNumber}
            onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
            disabled={expense.isPaid}
          />
        </div>
        <div>
          <Label htmlFor="date">
            Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            disabled={expense.isPaid}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">
          Expense Category <span className="text-red-500">*</span>
        </Label>
        <Select 
          value={formData.category} 
          onValueChange={(value) => setFormData({ ...formData, category: value })}
          disabled={expense.isPaid}
        >
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">
            Amount <span className="text-red-500">*</span>
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            disabled={expense.isPaid}
            required
          />
        </div>
        <div>
          <Label htmlFor="tax">
            Tax <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center space-x-2">
            <Select 
              value={formData.taxRateId} 
              onValueChange={(value) => setFormData({ ...formData, taxRateId: value })}
              disabled={expense.isPaid}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select tax rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={APP_CONSTANTS.DEFAULTS.TAX_RATE_ID}>No Tax</SelectItem>
                {taxRates.map((tax) => (
                  <SelectItem key={tax.id} value={tax.id}>
                    {tax.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {taxAmount > 0 && (
              <span className="text-sm text-gray-600 whitespace-nowrap">₹{taxAmount.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total Amount:</span>
          <span className="font-bold text-lg">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {expense.isPaid && (
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-green-800 text-sm">
            This expense has been paid and cannot be edited.
            {expense.accountName && ` Paid via ${expense.accountName}.`}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {!expense.isPaid && (
          <Button type="submit">Update Expense</Button>
        )}
      </div>

      <AddVendorDialog
        open={showAddVendorDialog}
        onOpenChange={setShowAddVendorDialog}
        onSubmit={handleAddVendor}
      />
    </form>
  );
};
