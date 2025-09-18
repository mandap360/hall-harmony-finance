
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { Loader2 } from "lucide-react";

interface AddPaymentFormProps {
  onAddPayment: (payment: { 
    amount: string; 
    date: string; 
    categoryId: string; 
    description: string; 
    accountId: string; 
  }) => Promise<void>;
}

export const AddPaymentForm = ({ onAddPayment }: AddPaymentFormProps) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { accounts } = useAccounts();
  const { getIncomeCategories } = useCategories();
  const operationalAccounts = accounts.filter(acc => acc.account_type === 'operational');
  const incomeCategories = getIncomeCategories();
  const defaultIncomeCategories = incomeCategories.filter(cat => !cat.parent_id);
  
  // Find the "Advance" subcategory under "Secondary Income"
  const secondaryIncomeCategory = incomeCategories.find(cat => cat.name === "Secondary Income" && !cat.parent_id);
  const advanceCategory = incomeCategories.find(cat => 
    cat.parent_id === secondaryIncomeCategory?.id && cat.name === "Advance"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date || !accountId || !categoryId) return;

    setIsLoading(true);
    try {
      // Keep Secondary Income selection as is - the EditBookingDialog will handle the logic
      let finalCategoryId = categoryId;

      await onAddPayment({
        amount,
        date,
        categoryId: finalCategoryId,
        description,
        accountId
      });

      setAmount("");
      setDescription("");
    } catch (error) {
      console.error('Error adding payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-amber-700">Add Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Mode</Label>
            <Select value={accountId} onValueChange={setAccountId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent>
                {operationalAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} (₹{account.balance.toLocaleString('en-IN')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {defaultIncomeCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Payment description"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Payment...
              </>
            ) : (
              "Add Payment"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
