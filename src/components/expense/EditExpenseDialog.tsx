
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories } from "@/hooks/useCategories";
import { useVendors } from "@/hooks/useVendors";
import { useAccounts } from "@/hooks/useAccounts";
import { useTax } from "@/hooks/useTax";
import type { Expense } from "@/hooks/useExpenses";

interface EditExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onUpdateExpense: (expenseData: any) => void;
  onRecordPayment: (expenseId: string, accountId: string, paymentDate: string) => void;
}

export const EditExpenseDialog = ({ 
  open, 
  onOpenChange, 
  expense, 
  onUpdateExpense,
  onRecordPayment 
}: EditExpenseDialogProps) => {
  const [formData, setFormData] = useState({
    vendorName: "",
    billNumber: "",
    date: "",
    category: "",
    amount: "",
    taxRateId: "",
  });

  const [paymentData, setPaymentData] = useState({
    accountId: "",
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const { getExpenseCategories } = useCategories();
  const { vendors } = useVendors();
  const { accounts } = useAccounts();
  const { taxRates } = useTax();
  const expenseCategories = getExpenseCategories();
  const paymentAccounts = accounts.filter(acc => acc.account_type === 'operational' || acc.account_type === 'capital');

  useEffect(() => {
    if (expense) {
      // Calculate the tax rate ID based on existing tax percentages
      const totalTaxPercentage = expense.cgstPercentage + expense.sgstPercentage;
      const matchingTaxRate = taxRates.find(tax => tax.percentage === totalTaxPercentage);
      
      setFormData({
        vendorName: expense.vendorName,
        billNumber: expense.billNumber,
        date: expense.date,
        category: expense.category,
        amount: expense.amount.toString(),
        taxRateId: matchingTaxRate?.id || "",
      });
    }
  }, [expense, taxRates]);

  const calculateTaxAmounts = () => {
    const baseAmount = parseFloat(formData.amount) || 0;
    const selectedTaxRate = taxRates.find(tax => tax.id === formData.taxRateId);
    const taxPercentage = selectedTaxRate?.percentage || 0;
    const taxAmount = (baseAmount * taxPercentage) / 100;
    const totalAmount = baseAmount + taxAmount;
    
    return { taxAmount, totalAmount, taxPercentage };
  };

  const { taxAmount, totalAmount, taxPercentage } = calculateTaxAmounts();

  const handleUpdateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense || !formData.amount || !formData.category) return;

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

    onOpenChange(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense || !paymentData.accountId || !paymentData.paymentDate) return;

    onRecordPayment(expense.id, paymentData.accountId, paymentData.paymentDate);
    setPaymentData({
      accountId: "",
      paymentDate: new Date().toISOString().split('T')[0],
    });
    onOpenChange(false);
  };

  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Edit Details</TabsTrigger>
            <TabsTrigger value="payment" disabled={expense.isPaid}>
              {expense.isPaid ? "Already Paid" : "Record Payment"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <form onSubmit={handleUpdateExpense} className="space-y-4">
              <div>
                <Label htmlFor="vendorName">
                  Payee <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="vendorName"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  disabled={expense.isPaid}
                  required
                />
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
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                {!expense.isPaid && (
                  <Button type="submit">Update Expense</Button>
                )}
              </div>
            </form>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="space-y-1">
                <p><strong>Vendor:</strong> {expense.vendorName}</p>
                <p><strong>Bill Number:</strong> {expense.billNumber}</p>
                <p><strong>Amount:</strong> ₹{expense.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <Label htmlFor="account">Pay From</Label>
                <Select value={paymentData.accountId} onValueChange={(value) => setPaymentData({ ...paymentData, accountId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} (₹{account.balance.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!paymentData.accountId || !paymentData.paymentDate}>
                  Record Payment
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
