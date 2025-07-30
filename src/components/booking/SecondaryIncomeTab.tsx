import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";

interface SecondaryIncomeTabProps {
  booking: any;
}

interface SecondaryIncomeAllocation {
  id?: string;
  category_id: string;
  category_name: string;
  amount: number;
}

export const SecondaryIncomeTab = ({ booking }: SecondaryIncomeTabProps) => {
  const [secondaryIncomeCategories, setSecondaryIncomeCategories] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<SecondaryIncomeAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Calculate total advance available from payments
  const totalAdvanceReceived = booking?.income?.filter((income: any) => 
    income.category_name === 'Advance'
  ).reduce((sum: number, income: any) => sum + (income.amount || 0), 0) || 0;

  const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  const remainingToAllocate = totalAdvanceReceived - totalAllocated;

  useEffect(() => {
    fetchSecondaryIncomeCategories();
    fetchExistingAllocations();
  }, [booking.id]);

  const fetchSecondaryIncomeCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('income_categories')
        .select('id, name')
        .eq('parent_id', (await supabase
          .from('income_categories')
          .select('id')
          .eq('name', 'Secondary Income')
          .eq('is_default', true)
          .single()
        ).data?.id)
        .neq('name', 'Advance'); // Exclude Advance category

      if (error) throw error;
      setSecondaryIncomeCategories(data || []);
    } catch (error) {
      console.error('Error fetching secondary income categories:', error);
    }
  };

  const fetchExistingAllocations = async () => {
    try {
      const { data, error } = await supabase
        .from('secondary_income')
        .select('id, amount, category')
        .eq('booking_id', booking.id);

      if (error) throw error;

      const formattedAllocations = data?.map(item => ({
        id: item.id,
        category_id: '', // Will need to map category name to ID
        category_name: item.category,
        amount: Number(item.amount)
      })) || [];

      setAllocations(formattedAllocations);
    } catch (error) {
      console.error('Error fetching existing allocations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAllocation = () => {
    setAllocations([...allocations, {
      category_id: '',
      category_name: '',
      amount: 0
    }]);
  };

  const updateAllocation = (index: number, field: string, value: any) => {
    const updated = [...allocations];
    if (field === 'category_id') {
      const category = secondaryIncomeCategories.find(cat => cat.id === value);
      updated[index] = {
        ...updated[index],
        category_id: value,
        category_name: category?.name || ''
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setAllocations(updated);
  };

  const removeAllocation = async (index: number) => {
    const allocation = allocations[index];
    
    if (allocation.id) {
      try {
        const { error } = await supabase
          .from('secondary_income')
          .delete()
          .eq('id', allocation.id);

        if (error) throw error;
        
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
        return;
      }
    }

    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const saveAllocations = async () => {
    try {
      setLoading(true);

      for (const allocation of allocations) {
        if (!allocation.category_id || allocation.amount <= 0) continue;

        if (allocation.id) {
          // Update existing allocation
          const { error } = await supabase
            .from('secondary_income')
            .update({
              amount: allocation.amount,
              category: allocation.category_name
            })
            .eq('id', allocation.id);

          if (error) throw error;
        } else {
          // Create new allocation
          const { error } = await supabase
            .from('secondary_income')
            .insert({
              booking_id: booking.id,
              amount: allocation.amount,
              category: allocation.category_name,
              organization_id: booking.organization_id
            });

          if (error) throw error;
        }
      }

      toast({
        title: "Success",
        description: "Secondary income allocations saved successfully",
      });

      // Refresh allocations
      await fetchExistingAllocations();
    } catch (error) {
      console.error('Error saving allocations:', error);
      toast({
        title: "Error",
        description: "Failed to save allocations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Advance Allocation Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Total Advance Received:</span>
            <span className="font-semibold">{formatCurrency(totalAdvanceReceived)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Allocated:</span>
            <span className="font-semibold">{formatCurrency(totalAllocated)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span>Remaining to Allocate:</span>
            <span className={`font-semibold ${remainingToAllocate < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {formatCurrency(remainingToAllocate)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Allocations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Secondary Income Allocations</CardTitle>
          <Button 
            onClick={addAllocation} 
            size="sm"
            disabled={remainingToAllocate <= 0}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Allocation
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {allocations.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No allocations yet. Click "Add Allocation" to start.
            </p>
          ) : (
            allocations.map((allocation, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label htmlFor={`category-${index}`}>Category</Label>
                  <Select
                    value={allocation.category_id}
                    onValueChange={(value) => updateAllocation(index, 'category_id', value)}
                  >
                    <SelectTrigger id={`category-${index}`}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {secondaryIncomeCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <Label htmlFor={`amount-${index}`}>Amount</Label>
                  <Input
                    id={`amount-${index}`}
                    type="number"
                    value={allocation.amount}
                    onChange={(e) => updateAllocation(index, 'amount', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeAllocation(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={saveAllocations}
          disabled={loading || remainingToAllocate < 0}
        >
          Save Allocations
        </Button>
      </div>
    </div>
  );
};