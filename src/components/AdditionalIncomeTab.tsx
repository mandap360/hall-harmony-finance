
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, IndianRupee, AlertCircle } from "lucide-react";
import { useIncomeCategories } from "@/hooks/useIncomeCategories";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();
  
  // Calculate total additional income from payments
  const additionalIncome = (booking.payments || [])
    .filter(payment => payment.type === 'additional')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // State for income category breakdown
  const [breakdown, setBreakdown] = useState<IncomeCategory[]>([]);
  const [savedCategoryBreakdown, setSavedCategoryBreakdown] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // Calculate the remaining amount to be allocated
  const allocatedAmount = breakdown.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const remainingAmount = additionalIncome - allocatedAmount;
  const savedAmount = savedCategoryBreakdown.reduce((sum, item) => sum + Number(item.amount), 0);
  
  // Add a new empty category to the breakdown list
  const addCategoryToBreakdown = () => {
    if (savedCategoryBreakdown.length > 0) {
      toast({
        title: "Categories already saved",
        description: "Income categories have already been allocated for this booking",
        variant: "default",
      });
      return;
    }
    
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
    if (savedCategoryBreakdown.length > 0) {
      toast({
        title: "Already allocated",
        description: "Income categories have already been allocated for this booking",
        variant: "default",
      });
      return;
    }
    
    // Validation
    if (breakdown.some(item => !item.name || !item.amount)) {
      toast({
        title: "Validation error",
        description: "Please fill in all category names and amounts",
        variant: "destructive",
      });
      return;
    }
    
    // Check if total matches
    if (Math.abs(allocatedAmount - additionalIncome) > 0.01) {
      toast({
        title: "Amount mismatch",
        description: `The allocated amount (${allocatedAmount}) must match the total additional income (${additionalIncome})`,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Insert each income category
      const categoriesToInsert = breakdown.map(item => ({
        booking_id: bookingId,
        category: item.name,
        amount: item.amount
      }));
      
      const { error } = await supabase
        .from('additional_income')
        .insert(categoriesToInsert);
      
      if (error) throw error;
      
      setSavedCategoryBreakdown(breakdown.map(item => ({
        id: item.id,
        booking_id: bookingId,
        category: item.name,
        amount: item.amount,
        created_at: new Date().toISOString()
      })));
      
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
  
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div className="text-center">
          <div className="flex items-center justify-center text-amber-700 mb-1">
            <IndianRupee className="h-5 w-5" />
            <span className="text-2xl font-bold">{additionalIncome.toLocaleString()}</span>
          </div>
          <p className="text-sm text-amber-600">Total Additional Income</p>
          
          {savedCategoryBreakdown.length > 0 && (
            <p className="text-xs text-green-600 mt-2">
              ✓ Categories allocated: {savedAmount.toLocaleString()}
            </p>
          )}
        </div>
      </Card>

      {/* Add Category Breakdown */}
      {additionalIncome > 0 && savedCategoryBreakdown.length === 0 && (
        <Card className="p-6 border-orange-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Allocate Income Categories</h3>
            <Button 
              onClick={addCategoryToBreakdown} 
              variant="outline" 
              size="sm" 
              className="text-amber-600 border-amber-200 hover:bg-amber-50"
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
                <span>Allocated:</span>
                <span className={remainingAmount !== 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                  {allocatedAmount.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between text-sm mb-4">
                <span>Remaining:</span>
                <span className={remainingAmount !== 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                  {remainingAmount.toLocaleString()}
                </span>
              </div>
              
              {remainingAmount !== 0 && (
                <div className="flex items-center gap-2 text-xs text-red-600 mb-4 p-2 bg-red-50 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <p>
                    {remainingAmount > 0 
                      ? `You still have ₹${remainingAmount.toLocaleString()} to allocate` 
                      : `You've over-allocated by ₹${Math.abs(remainingAmount).toLocaleString()}`}
                  </p>
                </div>
              )}
              
              <Button
                onClick={saveBreakdown}
                disabled={remainingAmount !== 0 || isSubmitting}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                Save Category Allocation
              </Button>
            </>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>Click 'Add Category' to start allocating your additional income</p>
            </div>
          )}
        </Card>
      )}

      {/* Display saved category breakdown */}
      {savedCategoryBreakdown.length > 0 && (
        <Card className="p-6 border-orange-200">
          <h3 className="font-semibold mb-4 text-gray-800">Income Categories (Saved)</h3>
          <div className="space-y-3">
            {savedCategoryBreakdown.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div>
                  <p className="font-medium text-gray-800">{item.category}</p>
                  <div className="flex items-center text-amber-700 mt-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-semibold">{Number(item.amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
};
