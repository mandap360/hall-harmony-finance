import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, IndianRupee, AlertCircle, RefreshCw } from "lucide-react";
import { useIncomeCategories } from "@/hooks/useIncomeCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdditionalIncomeRefundDialog } from "@/components/AdditionalIncomeRefundDialog";

interface AdditionalIncomeTabProps {
  bookingId: string;
  booking: any;
}

interface IncomeCategory {
  id: string;
  name: string;
  amount: number;
}

export const AdditionalIncomeTab = ({ bookingId, booking }: AdditionalIncomeTabProps) => {
  const { incomeCategories } = useIncomeCategories();
  const { addTransaction } = useTransactions();
  const { toast } = useToast();
  
  // Calculate total additional income from payments (excluding category-based income)
  const additionalIncome = (booking.payments || [])
    .filter(payment => payment.type === 'additional' && !payment.id.startsWith('categories-'))
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // State for income category breakdown
  const [breakdown, setBreakdown] = useState<IncomeCategory[]>([]);
  const [savedCategoryBreakdown, setSavedCategoryBreakdown] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  
  // Fetch existing income category breakdown
  useEffect(() => {
    const fetchAdditionalIncomeBreakdown = async () => {
      if (bookingId) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('additional_income')
            .select('*')
            .eq('booking_id', bookingId);
          
          if (error) throw error;
          setSavedCategoryBreakdown(data || []);
        } catch (error) {
          console.error('Error fetching income breakdown:', error);
          toast({
            title: "Error",
            description: "Failed to load income breakdown",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchAdditionalIncomeBreakdown();
  }, [bookingId]);
  
  // Calculate amounts
  const allocatedAmount = breakdown.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const savedAmount = savedCategoryBreakdown.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalAllocated = savedAmount + allocatedAmount;
  
  // Available to allocate: what can still be allocated (constant during input)
  const availableToAllocate = additionalIncome - savedAmount;
  
  // Remaining to allocate: what's left after current input (updates as user types)
  const remainingToAllocate = availableToAllocate - allocatedAmount;
  
  // Check if there's remaining amount to allocate OR if there are unsaved categories
  const shouldShowAllocationSection = additionalIncome > 0 && (
    savedCategoryBreakdown.length === 0 || 
    availableToAllocate > 0 || 
    breakdown.length > 0
  );
  
  // Add a new empty category to the breakdown list
  const addCategoryToBreakdown = () => {
    setBreakdown([...breakdown, { id: Date.now().toString(), name: "", amount: 0 }]);
  };
  
  // Remove a category from the breakdown list
  const removeCategoryFromBreakdown = (id: string) => {
    setBreakdown(breakdown.filter(item => item.id !== id));
  };
  
  // Update a category in the breakdown list
  const updateBreakdownItem = (id: string, field: 'name' | 'amount', value: string | number) => {
    setBreakdown(breakdown.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  // Save the breakdown to the database
  const saveBreakdown = async () => {
    // Validation
    if (breakdown.some(item => !item.name || !item.amount)) {
      toast({
        title: "Validation error",
        description: "Please fill in all category names and amounts",
        variant: "destructive",
      });
      return;
    }
    
    // Check for duplicate categories in current breakdown
    const duplicatesInBreakdown = breakdown.filter((item, index) => 
      breakdown.findIndex(b => b.name === item.name) !== index
    );
    
    if (duplicatesInBreakdown.length > 0) {
      toast({
        title: "Duplicate category",
        description: `Category "${duplicatesInBreakdown[0].name}" appears multiple times in your current selection`,
        variant: "destructive",
      });
      return;
    }
    
    // Check for categories already saved
    const alreadySavedCategories = breakdown.filter(item => 
      savedCategoryBreakdown.some(saved => saved.category === item.name)
    );
    
    if (alreadySavedCategories.length > 0) {
      toast({
        title: "Category already added",
        description: `Category "${alreadySavedCategories[0].name}" has already been added for this booking`,
        variant: "destructive",
      });
      return;
    }
    
    // Check if total exceeds available amount
    if (allocatedAmount > availableToAllocate) {
      toast({
        title: "Amount exceeds available",
        description: `You can only allocate ₹${availableToAllocate.toLocaleString()} more`,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Insert each income category (only allocation, no new payment creation)
      const categoriesToInsert = breakdown.map(item => ({
        booking_id: bookingId,
        category: item.name,
        amount: item.amount
      }));
      
      const { error } = await supabase
        .from('additional_income')
        .insert(categoriesToInsert);
      
      if (error) {
        if (error.code === '23505') {
          // Handle unique constraint violation with more specific error
          toast({
            title: "Category already exists",
            description: "One or more of these categories have already been added for this booking",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }
      
      // Update saved breakdown
      const newSavedItems = breakdown.map(item => ({
        id: item.id,
        booking_id: bookingId,
        category: item.name,
        amount: item.amount,
        created_at: new Date().toISOString()
      }));
      
      setSavedCategoryBreakdown([...savedCategoryBreakdown, ...newSavedItems]);
      setBreakdown([]);
      
      toast({
        title: "Success",
        description: "Income categories have been allocated successfully",
      });
    } catch (error) {
      console.error('Error saving income breakdown:', error);
      toast({
        title: "Error",
        description: "Failed to save income categories",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle refund - This should directly reduce the total additional income
  const handleRefund = async (refundAmount: number, accountId: string, description: string) => {
    try {
      // Step 1: Create debit transaction in the selected account
      await addTransaction({
        account_id: accountId,
        transaction_type: 'debit',
        amount: refundAmount,
        description: description,
        reference_type: 'additional_income_refund',
        reference_id: bookingId,
        transaction_date: new Date().toISOString().split('T')[0]
      });

      // Step 2: Add negative refund entry to booking's payment history to reduce total additional income
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          booking_id: bookingId,
          amount: -refundAmount, // Negative amount to reduce total additional income
          payment_date: new Date().toISOString().split('T')[0],
          payment_type: 'additional', // Keep it as additional type but negative amount
          description: `Additional Income Refund - ${description}`,
          payment_mode: accountId
        }]);

      if (paymentError) throw paymentError;

      toast({
        title: "Refund processed",
        description: `₹${refundAmount.toLocaleString()} has been refunded successfully`,
      });
      
      // The parent component should refresh booking data to reflect the changes
      // This will automatically update the additionalIncome calculation
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: "Error",
        description: "Failed to process refund",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div className="text-center">
          <div className="flex items-center justify-center text-amber-700 mb-1">
            <IndianRupee className="h-5 w-5" />
            <span className="text-2xl font-bold">{additionalIncome.toLocaleString()}</span>
          </div>
          <p className="text-sm text-amber-600">Total Additional Income Available</p>
          <p className="text-xs text-gray-500 mt-1">
            (Added from Payments tab only)
          </p>
          
          {savedCategoryBreakdown.length > 0 && (
            <>
              <p className="text-xs text-green-600 mt-2">
                ✓ Categories allocated: ₹{savedAmount.toLocaleString()}
              </p>
              {availableToAllocate > 0 && (
                <>
                  <p className="text-xs text-orange-600">
                    Available to allocate: ₹{availableToAllocate.toLocaleString()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRefundDialog(true)}
                    className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refund Available Amount
                  </Button>
                </>
              )}
              {availableToAllocate === 0 && totalAllocated === additionalIncome && (
                <p className="text-xs text-green-600">
                  ✓ All income has been allocated to categories
                </p>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Add Category Breakdown */}
      {shouldShowAllocationSection && (
        <Card className="p-6 border-orange-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">
              {savedCategoryBreakdown.length === 0 ? 'Allocate Income Categories' : 
               availableToAllocate > 0 ? 'Allocate Remaining Amount' : 'Add More Categories'}
            </h3>
            <Button 
              onClick={addCategoryToBreakdown} 
              variant="outline" 
              size="sm" 
              className="text-amber-600 border-amber-200 hover:bg-amber-50"
              disabled={availableToAllocate <= 0 && breakdown.length === 0}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Category
            </Button>
          </div>
          
          {breakdown.length > 0 ? (
            <>
              <div className="space-y-3 mb-4">
                {breakdown.map((item) => (
                  <div key={item.id} className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label className="text-gray-700">Category</Label>
                      <Select 
                        value={item.name} 
                        onValueChange={(value) => updateBreakdownItem(item.id, 'name', value)}
                      >
                        <SelectTrigger className="border-amber-200 focus:border-amber-500">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {incomeCategories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label className="text-gray-700">Amount</Label>
                      <Input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateBreakdownItem(item.id, 'amount', Number(e.target.value))}
                        className="border-amber-200 focus:border-amber-500"
                        max={availableToAllocate}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCategoryFromBreakdown(item.id)}
                      className="mb-1 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between text-sm mb-4">
                <span>Available to allocate:</span>
                <span className="font-medium text-amber-700">
                  ₹{Math.max(0, availableToAllocate).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between text-sm mb-4">
                <span>Current allocation:</span>
                <span className={allocatedAmount > availableToAllocate ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                  ₹{allocatedAmount.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between text-sm mb-4">
                <span>Remaining to allocate:</span>
                <span className="font-medium text-gray-700">
                  ₹{Math.max(0, remainingToAllocate).toLocaleString()}
                </span>
              </div>
              
              {allocatedAmount > availableToAllocate && (
                <div className="flex items-center gap-2 text-xs text-red-600 mb-4 p-2 bg-red-50 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <p>
                    You've over-allocated by ₹{(allocatedAmount - availableToAllocate).toLocaleString()}
                  </p>
                </div>
              )}
              
              <Button
                onClick={saveBreakdown}
                disabled={allocatedAmount === 0 || allocatedAmount > availableToAllocate || isSubmitting}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                {isSubmitting ? "Saving..." : "Save Category Allocation"}
              </Button>
            </>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>
                {savedCategoryBreakdown.length === 0 
                  ? "Click 'Add Category' to start allocating your additional income"
                  : availableToAllocate > 0
                  ? `Click 'Add Category' to allocate the remaining ₹${availableToAllocate.toLocaleString()}`
                  : "All income has been allocated. You can still add more categories if needed."
                }
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Display saved category breakdown */}
      {savedCategoryBreakdown.length > 0 && (
        <Card className="p-6 border-orange-200">
          <h3 className="font-semibold mb-4 text-gray-800">Income Categories (Allocated)</h3>
          <div className="space-y-3">
            {savedCategoryBreakdown.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div>
                  <p className="font-medium text-gray-800">{item.category}</p>
                  <div className={`flex items-center mt-1 ${Number(item.amount) < 0 ? 'text-red-700' : 'text-amber-700'}`}>
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-semibold">
                      {Number(item.amount) < 0 ? '-' : ''}
                      {Math.abs(Number(item.amount)).toLocaleString()}
                    </span>
                    {Number(item.amount) < 0 && (
                      <span className="ml-1 text-xs">(Refund)</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {availableToAllocate > 0 && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200 flex justify-between items-center">
              <p className="text-sm text-orange-700">
                <strong>Available to allocate:</strong> ₹{availableToAllocate.toLocaleString()} can still be allocated to categories
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRefundDialog(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refund Available Amount
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Empty state */}
      {additionalIncome === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No additional income has been added yet.</p>
          <p className="text-sm mt-1">
            Add additional income from the Payments tab first before allocating to categories.
          </p>
        </div>
      )}

      {/* Refund Dialog */}
      <AdditionalIncomeRefundDialog
        open={showRefundDialog}
        onOpenChange={setShowRefundDialog}
        maxRefundAmount={availableToAllocate}
        bookingId={bookingId}
        onRefund={handleRefund}
      />
    </div>
  );
};
