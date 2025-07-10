
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useTax } from "@/hooks/useTax";
import { useVendors } from "@/hooks/useVendors";
import { AddVendorDialog } from "@/components/AddVendorDialog";
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
    taxRateId: "no_tax",
  });
  const [showAddVendorDialog, setShowAddVendorDialog] = useState(false);

  const { getExpenseCategories } = useCategories();
  const { taxRates } = useTax();
  const { vendors, addVendor } = useVendors();
  const expenseCategories = getExpenseCategories();

  // Initialize form data immediately when expense changes
  useEffect(() => {
    console.log("ExpenseDetailsForm - initializing form with expense data:", expense);
    
    if (expense) {
      setFormData({
        vendorName: expense.vendorName || "",
        billNumber: expense.billNumber || "",
        date: expense.date || "",
        category: expense.category || "",
        amount: expense.amount?.toString() || "",
        taxRateId: "no_tax", // Set default first, will be updated in tax matching effect
      });
    }
  }, [expense]);

  const handleAddVendor = async (vendorData: any) => {
    await addVendor(vendorData);
    setFormData(prev => ({ ...prev, vendorName: vendorData.businessName }));
    setShowAddVendorDialog(false);
  };

  // Handle tax rate matching separately after taxRates are loaded
  useEffect(() => {
    console.log("ExpenseDetailsForm - tax rates loaded:", taxRates);
    console.log("ExpenseDetailsForm - current expense:", expense);
    
    if (expense && taxRates.length > 0) {
      // Calculate the total tax percentage from existing tax data
      const totalTaxPercentage = (expense.cgstPercentage || 0) + (expense.sgstPercentage || 0);
      console.log("Total tax percentage from expense:", totalTaxPercentage);
      
      // Find matching tax rate
      const matchingTaxRate = taxRates.find(tax => tax.percentage === totalTaxPercentage);
      console.log("Matching tax rate found:", matchingTaxRate);
      
      // Update only the tax rate ID in form data
      setFormData(prev => ({
        ...prev,
        taxRateId: matchingTaxRate?.id || "no_tax",
      }));
    }
  }, [expense, taxRates]);

  const calculateTaxAmounts = () => {
    const baseAmount = parseFloat(formData.amount) || 0;
    if (formData.taxRateId === "no_tax") {
      return { taxAmount: 0, totalAmount: baseAmount, taxPercentage: 0 };
    }
    
    const selectedTaxRate = taxRates.find(tax => tax.id === formData.taxRateId);
    const taxPercentage = selectedTaxRate?.percentage || 0;
    const taxAmount = (baseAmount * taxPercentage) / 100;
    const totalAmount = baseAmount + taxAmount;
    
    return { taxAmount, totalAmount, taxPercentage };
  };

  const { taxAmount, totalAmount, taxPercentage } = calculateTaxAmounts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.vendorName) return;

    const { taxAmount, totalAmount, taxPercentage } = calculateTaxAmounts();

    onUpdateExpense({
      ...expense,
      vendorName: formData.vendorName,
      billNumber: formData.billNumber,
      date: formData.date,
      category: formData.category,
      amount: parseFloat(formData.amount),
      cgstAmount: taxAmount / 2,
      sgstAmount: taxAmount / 2,
      cgstPercentage: taxPercentage / 2,
      sgstPercentage: taxPercentage / 2,
      totalAmount,
    });
  };

  console.log("Current form data:", formData);

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
                <SelectItem value="no_tax">No Tax</SelectItem>
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
