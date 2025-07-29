import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAdditionalIncome } from "@/hooks/useAdditionalIncome";
import { useCategories } from "@/hooks/useCategories";
import { AdditionalIncomeRefundDialog } from "@/components/AdditionalIncomeRefundDialog";
import { AddIncomeCategoryDialog } from "@/components/AddIncomeCategoryDialog";
import { supabase } from "@/integrations/supabase/client";

interface AdditionalIncomeTabProps {
  bookingId: string;
  booking: any;
}

export const AdditionalIncomeTab = ({ bookingId, booking }: AdditionalIncomeTabProps) => {
  const { toast } = useToast();
  const { additionalIncomes, loading, fetchAdditionalIncomes, addAdditionalIncome } = useAdditionalIncome();
  const { getIncomeCategories } = useCategories();
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);

  // Fetch additional incomes when component mounts or bookingId changes
  useEffect(() => {
    if (bookingId) {
      fetchAdditionalIncomes(bookingId);
    }
  }, [bookingId, fetchAdditionalIncomes]);

  // Calculate totals from payments table instead of secondary_income table
  const [totalAdditionalIncome, setTotalAdditionalIncome] = useState(0);
  const [allocatedAmount, setAllocatedAmount] = useState(0);

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!bookingId) return;

      try {
        // Get additional income payments from payments table
        const { data: payments, error } = await supabase
          .from('payments')
          .select(`
            amount,
            income_categories!category_id (
              name
            )
          `)
          .eq('booking_id', bookingId);

        if (error) throw error;

        const total = (payments || [])
          .filter(payment => payment.income_categories?.name === 'Secondary Income')
          .reduce((sum, payment) => sum + Number(payment.amount), 0);
        setTotalAdditionalIncome(total);

        // Calculate allocated amount from secondary_income table
        const allocated = additionalIncomes.reduce((sum, item) => sum + item.amount, 0);
        setAllocatedAmount(allocated);
      } catch (error) {
        console.error('Error fetching payment data:', error);
      }
    };

    fetchPaymentData();
  }, [bookingId, additionalIncomes]);

  const availableToAllocate = totalAdditionalIncome - allocatedAmount;
  const incomeCategories = getIncomeCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !categoryId) {
      toast({
        title: "Error",
        description: "Amount and category are required",
        variant: "destructive",
      });
      return;
    }

    const parsedAmount = parseFloat(amount);
    
    if (parsedAmount > availableToAllocate) {
      toast({
        title: "Error",
        description: `Cannot allocate more than available amount (₹${availableToAllocate.toLocaleString()})`,
        variant: "destructive",
      });
      return;
    }

    // Find the selected category name
    const selectedCategory = incomeCategories.find(cat => cat.id === categoryId);
    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select a valid category",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await addAdditionalIncome(bookingId, selectedCategory.name, parsedAmount);
      
      if (success) {
        toast({
          title: "Success",
          description: "Category allocation added successfully",
        });
        setAmount("");
        setCategoryId("");
      }
    } catch (error) {
      console.error('Error allocating category:', error);
      toast({
        title: "Error",
        description: "Failed to allocate category",
        variant: "destructive",
      });
    }
  };

  const handleRefund = async (refundAmount: number, accountId: string, description: string) => {
    try {
      // Create standardized refund description
      // Extract just the date part (YYYY-MM-DD) to compare dates without time
      const startDateOnly = booking.startDate.split('T')[0];
      const endDateOnly = booking.endDate.split('T')[0];
      
      const startDateFormatted = new Date(startDateOnly + 'T00:00:00').toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      
      const endDateFormatted = new Date(endDateOnly + 'T00:00:00').toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      const isSameDate = startDateOnly === endDateOnly;
      const dateRange = isSameDate ? startDateFormatted : `${startDateFormatted} - ${endDateFormatted}`;
      const refundDescription = `Additional Income Refund for ${dateRange}`;

      // Get "Excess Advance" subcategory ID (under Refund category)
      const { data: excessAdvanceCategory } = await supabase
        .from('income_categories')
        .select('id')
        .eq('name', 'Excess Advance')
        .eq('is_default', true)
        .single();

      // Add refund payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount: refundAmount,
          payment_date: new Date().toISOString().split('T')[0],
          category_id: excessAdvanceCategory?.id,
          description: refundDescription,
          payment_mode: accountId
        });

      if (paymentError) throw paymentError;

      // Add debit transaction to the selected account
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          account_id: accountId,
          transaction_type: 'debit',
          amount: refundAmount,
          description: refundDescription,
          reference_type: 'secondary_income_refund',
          reference_id: bookingId,
          transaction_date: new Date().toISOString().split('T')[0]
        });

      if (transactionError) throw transactionError;

      // Refresh data
      await fetchAdditionalIncomes(bookingId);
      
      // Dispatch event to notify parent components
      window.dispatchEvent(new CustomEvent('booking-updated'));

      toast({
        title: "Success",
        description: "Refund processed successfully",
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: "Error",
        description: "Failed to process refund",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <p>Loading additional income data...</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Allocate</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={availableToAllocate}
                required
              />
              <p className="text-sm text-gray-600">
                Available to allocate: ₹{availableToAllocate.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Income Category</Label>
              <Select value={categoryId} onValueChange={(value) => {
                if (value === "add_category") {
                  setIsAddCategoryDialogOpen(true);
                } else {
                  setCategoryId(value);
                }
              }} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select income category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add_category" className="text-blue-600 font-medium">
                    + Add New Category
                  </SelectItem>
                  {incomeCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={availableToAllocate <= 0}
            >
              Allocate to Category
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Allocated Categories */}
      {additionalIncomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-700">Allocated Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {additionalIncomes.map((income) => (
                <div key={income.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{income.category}</span>
                    <span className="text-gray-600 ml-2">₹{income.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-amber-700">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Total Additional Income:</span>
            <span>₹{totalAdditionalIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Allocated to Categories:</span>
            <span>₹{allocatedAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Available to Allocate:</span>
            <span>₹{availableToAllocate.toLocaleString()}</span>
          </div>
          <Button 
            onClick={() => setIsRefundDialogOpen(true)}
            disabled={availableToAllocate <= 0}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Process Refund (₹{availableToAllocate.toLocaleString()})
          </Button>
        </CardContent>
      </Card>

      <AdditionalIncomeRefundDialog
        open={isRefundDialogOpen}
        onOpenChange={setIsRefundDialogOpen}
        maxRefundAmount={availableToAllocate}
        bookingId={bookingId}
        onRefund={handleRefund}
      />

      <AddIncomeCategoryDialog
        open={isAddCategoryDialogOpen}
        onOpenChange={setIsAddCategoryDialogOpen}
        onCategoryAdded={(categoryName) => {
          // Refresh categories and auto-select the new one
          window.location.reload(); // Simple refresh for now
        }}
      />
    </div>
  );
};
