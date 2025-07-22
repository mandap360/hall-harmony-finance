
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useVendors } from "@/hooks/useVendors";
import { useAccounts } from "@/hooks/useAccounts";
import { useTaxCalculation } from "@/hooks/useTaxCalculation";
import { useTax } from "@/hooks/useTax";
import { AddVendorDialog } from "@/components/AddVendorDialog";
import { IncomeDetailsForm } from "@/components/IncomeDetailsForm";
import { TransferForm } from "@/components/TransferForm";
import { dateUtils, APP_CONSTANTS } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expenseData: any) => void;
  onIncomeSubmit?: (incomeData: any) => void;
}

export const AddExpenseDialog = ({ open, onOpenChange, onSubmit, onIncomeSubmit }: AddExpenseDialogProps) => {
  const [formData, setFormData] = useState({
    vendorId: "",
    billNumber: "",
    date: dateUtils.getTodayString(),
    selectedCategoryId: "",
    amount: "",
    taxRateId: APP_CONSTANTS.DEFAULTS.TAX_RATE_ID as string,
    paidThrough: "",
  });

  const [showAddVendorDialog, setShowAddVendorDialog] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { getExpenseCategories } = useCategories();
  const { vendors, addVendor } = useVendors();
  const { accounts, transferAmount } = useAccounts();
  const { taxRates } = useTax();
  const expenseCategories = getExpenseCategories();
  
  // Filter parent categories (categories without parent_id)
  const parentCategories = expenseCategories.filter(cat => !cat.parent_id);
  
  // Get subcategories for a parent
  const getSubcategories = (parentId: string) => {
    return expenseCategories.filter(cat => cat.parent_id === parentId);
  };
  
  // Handle category item click
  const handleCategoryClick = (category: any, isSubcategory: boolean) => {
    if (isSubcategory) {
      setFormData({ ...formData, selectedCategoryId: category.id });
      setIsDropdownOpen(false);
      setExpandedCategoryId(null);
    } else {
      const hasSubcategories = getSubcategories(category.id).length > 0;
      if (hasSubcategories) {
        setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id);
      } else {
        setFormData({ ...formData, selectedCategoryId: category.id });
        setIsDropdownOpen(false);
        setExpandedCategoryId(null);
      }
    }
  };
  
  // Get display value for selected category
  const getSelectedCategoryDisplay = () => {
    if (!formData.selectedCategoryId) return "";
    
    const selectedCategory = expenseCategories.find(cat => cat.id === formData.selectedCategoryId);
    if (!selectedCategory) return "";
    
    if (selectedCategory.parent_id) {
      const parentCategory = expenseCategories.find(cat => cat.id === selectedCategory.parent_id);
      return parentCategory ? `${parentCategory.name}/${selectedCategory.name}` : selectedCategory.name;
    }
    
    return selectedCategory.name;
  };
  
  // Filter accounts for payment
  const paymentAccounts = accounts.filter(acc => 
    acc.account_type === APP_CONSTANTS.ACCOUNT_TYPES.OPERATIONAL || 
    acc.account_type === APP_CONSTANTS.ACCOUNT_TYPES.CAPITAL
  );

  // Use the tax calculation hook
  const { taxAmount, totalAmount, taxPercentage, cgstAmount, sgstAmount } = useTaxCalculation({
    amount: formData.amount,
    taxRateId: formData.taxRateId
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategoryName = expenseCategories.find(cat => cat.id === formData.selectedCategoryId)?.name || "";
    
    if (!formData.vendorId || !formData.amount || !formData.selectedCategoryId || !formData.paidThrough) return;

    const selectedVendor = vendors.find(v => v.id === formData.vendorId);

    onSubmit({
      ...formData,
      category: finalCategoryName,
      vendorName: selectedVendor?.businessName || "",
      amount: parseFloat(formData.amount),
      cgstAmount,
      sgstAmount,
      cgstPercentage: taxPercentage / 2,
      sgstPercentage: taxPercentage / 2,
      totalAmount,
      isPaid: formData.paidThrough !== APP_CONSTANTS.PAYMENT_STATUS.UNPAID,
      accountId: formData.paidThrough !== APP_CONSTANTS.PAYMENT_STATUS.UNPAID ? formData.paidThrough : null,
    });

    // Reset form
    setFormData({
      vendorId: "",
      billNumber: "",
      date: dateUtils.getTodayString(),
      selectedCategoryId: "",
      amount: "",
      taxRateId: APP_CONSTANTS.DEFAULTS.TAX_RATE_ID as string,
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

  const handleIncomeSubmit = (incomeData: any) => {
    if (onIncomeSubmit) {
      onIncomeSubmit(incomeData);
    }
    onOpenChange(false);
  };

  const handleTransferSubmit = async (fromAccountId: string, toAccountId: string, amount: number, description?: string, date?: string) => {
    try {
      await transferAmount(fromAccountId, toAccountId, amount, description, date);
      toast({
        title: "Success",
        description: "Transfer completed successfully",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to complete transfer",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="vendor">
                Party <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.vendorId} onValueChange={handleVendorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add_vendor" className="text-blue-600 font-medium">
                    + Add Party
                  </SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Invoice No and Date in same line */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billNumber">Invoice No (Optional)</Label>
                <Input
                  id="billNumber"
                  value={formData.billNumber}
                  onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
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
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">
                Expense Category <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.selectedCategoryId} 
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  selectedCategoryId: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category">
                    {getSelectedCategoryDisplay()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {parentCategories.map((category) => {
                    const subcategories = getSubcategories(category.id);
                    const hasSubcategories = subcategories.length > 0;
                    const isExpanded = expandedCategoryId === category.id;
                    
                    return (
                      <div key={category.id}>
                        <SelectItem 
                          value={hasSubcategories ? "" : category.id}
                          onClick={() => handleCategoryClick(category, false)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{category.name}</span>
                            {hasSubcategories && (
                              isExpanded ? (
                                <ChevronUp className="h-4 w-4 ml-2" />
                              ) : (
                                <ChevronDown className="h-4 w-4 ml-2" />
                              )
                            )}
                          </div>
                        </SelectItem>
                        {hasSubcategories && isExpanded && (
                          <>
                            {subcategories.map((subcategory) => (
                              <SelectItem 
                                key={subcategory.id} 
                                value={subcategory.id}
                                className="pl-6"
                                onClick={() => handleCategoryClick(subcategory, true)}
                              >
                                {subcategory.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </div>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Amount and Tax in same line */}
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

            <div>
              <Label htmlFor="paidThrough">
                Paid Through <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.paidThrough} onValueChange={(value) => setFormData({ ...formData, paidThrough: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={APP_CONSTANTS.PAYMENT_STATUS.UNPAID}>Unpaid</SelectItem>
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
