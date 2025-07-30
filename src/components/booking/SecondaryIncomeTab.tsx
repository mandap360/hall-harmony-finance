import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface SecondaryIncomeTabProps {
  booking: any;
}

interface SecondaryIncomeCategory {
  id: string;
  name: string;
  parent_id: string | null;
}

interface Allocation {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
}

export const SecondaryIncomeTab = ({ booking }: SecondaryIncomeTabProps) => {
  const [categories, setCategories] = useState<SecondaryIncomeCategory[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allocationAmount, setAllocationAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch secondary income categories and existing allocations
  useEffect(() => {
    fetchData();
  }, [booking.id]);

  const fetchData = async () => {
    try {
      // Get Secondary Income categories (parent and children)
      const { data: categoriesData } = await supabase
        .from('income_categories')
        .select('id, name, parent_id')
        .or('name.eq.Secondary Income,parent_id.in.(select id from income_categories where name = "Secondary Income")');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Get existing income records for this booking to calculate advance amount
      const { data: incomeData } = await supabase
        .from('income')
        .select(`
          id,
          amount,
          category_id,
          income_categories!inner(name, parent_id, parent:income_categories!parent_id(name))
        `)
        .eq('booking_id', booking.id);

      if (incomeData) {
        // Calculate advance amount (Advance subcategory payments)
        const advancePayments = incomeData.filter(income => 
          income.income_categories.name === 'Advance' || 
          income.income_categories.parent?.name === 'Secondary Income'
        );
        
        const totalAdvance = advancePayments
          .filter(payment => payment.income_categories.name === 'Advance')
          .reduce((sum, payment) => sum + Number(payment.amount), 0);
        
        setAdvanceAmount(totalAdvance);

        // Get existing allocations (non-Advance secondary income)
        const existingAllocations = incomeData
          .filter(income => 
            income.income_categories.parent?.name === 'Secondary Income' && 
            income.income_categories.name !== 'Advance'
          )
          .map(income => ({
            id: income.id,
            categoryId: income.category_id,
            categoryName: income.income_categories.name,
            amount: Number(income.amount)
          }));
        
        setAllocations(existingAllocations);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load secondary income data",
        variant: "destructive",
      });
    }
  };

  const handleAddAllocation = async () => {
    if (!selectedCategory || !allocationAmount || Number(allocationAmount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select a category and enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const amount = Number(allocationAmount);
    const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
    
    if (totalAllocated + amount > advanceAmount) {
      toast({
        title: "Insufficient Advance",
        description: "Allocation amount exceeds available advance balance",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedCat = categories.find(cat => cat.id === selectedCategory);
      
      // Add income record for allocation
      const { data: incomeData, error } = await supabase
        .from('income')
        .insert({
          booking_id: booking.id,
          amount: amount,
          category_id: selectedCategory,
          payment_date: new Date().toISOString().split('T')[0],
          description: `Allocated from Advance to ${selectedCat?.name}`,
          organization_id: booking.organization_id
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setAllocations(prev => [...prev, {
        id: incomeData.id,
        categoryId: selectedCategory,
        categoryName: selectedCat?.name || '',
        amount: amount
      }]);

      setSelectedCategory("");
      setAllocationAmount("");
      
      toast({
        title: "Success",
        description: "Allocation added successfully",
      });
    } catch (error) {
      console.error('Error adding allocation:', error);
      toast({
        title: "Error",
        description: "Failed to add allocation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAllocation = async (allocationId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', allocationId);

      if (error) throw error;

      setAllocations(prev => prev.filter(allocation => allocation.id !== allocationId));
      
      toast({
        title: "Success",
        description: "Allocation removed successfully",
      });
    } catch (error) {
      console.error('Error removing allocation:', error);
      toast({
        title: "Error",
        description: "Failed to remove allocation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  const remainingAdvance = advanceAmount - totalAllocated;

  // Get secondary income subcategories (excluding Advance)
  const secondaryIncomeParent = categories.find(cat => cat.name === 'Secondary Income' && !cat.parent_id);
  const availableCategories = categories.filter(cat => 
    cat.parent_id === secondaryIncomeParent?.id && 
    cat.name !== 'Advance'
  );

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Advance Allocation Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Advance Received:</span>
            <CurrencyDisplay amount={advanceAmount} className="font-medium" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Allocated:</span>
            <CurrencyDisplay amount={totalAllocated} className="font-medium" />
          </div>
          <div className="flex justify-between items-center border-t pt-2">
            <span className="font-medium">Remaining Advance:</span>
            <CurrencyDisplay 
              amount={remainingAdvance} 
              className={`font-medium ${remainingAdvance < 0 ? 'text-destructive' : 'text-primary'}`} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Add New Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Allocate to Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={allocationAmount}
                onChange={(e) => setAllocationAmount(e.target.value)}
                min="1"
                max={remainingAdvance}
              />
            </div>
          </div>
          <Button 
            onClick={handleAddAllocation} 
            disabled={loading || !selectedCategory || !allocationAmount || remainingAdvance <= 0}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Allocation
          </Button>
        </CardContent>
      </Card>

      {/* Existing Allocations */}
      {allocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allocations.map((allocation) => (
                <div key={allocation.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{allocation.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CurrencyDisplay amount={allocation.amount} className="font-medium" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveAllocation(allocation.id)}
                      disabled={loading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
