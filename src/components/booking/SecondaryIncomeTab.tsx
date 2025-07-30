import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

interface FormRow {
  id: string;
  categoryId: string;
  amount: string;
  isNew?: boolean;
}

export const SecondaryIncomeTab = ({ booking }: SecondaryIncomeTabProps) => {
  const [categories, setCategories] = useState<SecondaryIncomeCategory[]>([]);
  const [formRows, setFormRows] = useState<FormRow[]>([]);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch secondary income categories and existing allocations
  useEffect(() => {
    fetchData();
  }, [booking.id]);

  const fetchData = async () => {
    try {
      // Get all income categories to filter Secondary Income and its children
      const { data: categoriesData } = await supabase
        .from('income_categories')
        .select('id, name, parent_id');

      if (categoriesData) {
        // Filter to get Secondary Income parent and all its children
        const secondaryIncomeParent = categoriesData.find(cat => cat.name === 'Secondary Income' && !cat.parent_id);
        const secondaryIncomeCategories = categoriesData.filter(cat => 
          cat.id === secondaryIncomeParent?.id || cat.parent_id === secondaryIncomeParent?.id
        );
        setCategories(secondaryIncomeCategories);
      }

      // Get advance amount from secondary_income table for this booking
      const { data: advanceData } = await supabase
        .from('secondary_income')
        .select(`
          amount,
          income_categories!inner(name)
        `)
        .eq('booking_id', booking.id)
        .eq('income_categories.name', 'Advance');

      if (advanceData && advanceData.length > 0) {
        const totalAdvance = advanceData.reduce((sum, item) => sum + Number(item.amount), 0);
        setAdvanceAmount(totalAdvance);
      }

      // Get existing allocations from secondary_income table (excluding Advance)
      const { data: allocationsData } = await supabase
        .from('secondary_income')
        .select(`
          id,
          amount,
          category_id,
          income_categories!inner(name)
        `)
        .eq('booking_id', booking.id)
        .neq('income_categories.name', 'Advance');

      if (allocationsData && allocationsData.length > 0) {
        const rows = allocationsData.map(allocation => ({
          id: allocation.id,
          categoryId: allocation.category_id,
          amount: allocation.amount.toString(),
          isNew: false
        }));
        
        // Add one empty row for new entries
        rows.push({
          id: 'new-' + Date.now(),
          categoryId: '',
          amount: '',
          isNew: true
        });
        
        setFormRows(rows);
      } else {
        // If no existing allocations, start with one empty row
        setFormRows([{
          id: 'new-' + Date.now(),
          categoryId: '',
          amount: '',
          isNew: true
        }]);
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

  const updateFormRow = (id: string, field: 'categoryId' | 'amount', value: string) => {
    setFormRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const addNewRow = () => {
    const newRow: FormRow = {
      id: 'new-' + Date.now(),
      categoryId: '',
      amount: '',
      isNew: true
    };
    setFormRows(prev => [...prev, newRow]);
  };

  const removeRow = async (id: string, isNew?: boolean) => {
    if (isNew) {
      // Just remove from local state if it's a new row
      setFormRows(prev => prev.filter(row => row.id !== id));
    } else {
      // Delete from database if it's an existing allocation
      setLoading(true);
      try {
        const { error } = await supabase
          .from('secondary_income')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setFormRows(prev => prev.filter(row => row.id !== id));
        
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
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const validRows = formRows.filter(row => row.categoryId && row.amount && Number(row.amount) > 0);
      
      // Check if total allocation doesn't exceed advance amount
      const totalAllocated = validRows.reduce((sum, row) => sum + Number(row.amount), 0);
      if (totalAllocated > advanceAmount) {
        toast({
          title: "Invalid Amount",
          description: "Total allocation exceeds available advance amount",
          variant: "destructive",
        });
        return;
      }

      // Process new rows (insert)
      const newRows = validRows.filter(row => row.isNew);
      if (newRows.length > 0) {
        const insertData = newRows.map(row => ({
          booking_id: booking.id,
          amount: Number(row.amount),
          category_id: row.categoryId,
          organization_id: booking.organization_id
        }));

        const { error: insertError } = await supabase
          .from('secondary_income')
          .insert(insertData);

        if (insertError) throw insertError;
      }

      // Process existing rows (update)
      const existingRows = validRows.filter(row => !row.isNew);
      for (const row of existingRows) {
        const { error: updateError } = await supabase
          .from('secondary_income')
          .update({ amount: Number(row.amount) })
          .eq('id', row.id);

        if (updateError) throw updateError;
      }

      // Update Advance amount in secondary_income table
      const advanceCategory = categories.find(cat => cat.name === 'Advance');
      if (advanceCategory) {
        const { data: existingAdvance } = await supabase
          .from('secondary_income')
          .select('id')
          .eq('booking_id', booking.id)
          .eq('category_id', advanceCategory.id)
          .single();

        if (existingAdvance) {
          const { error: advanceUpdateError } = await supabase
            .from('secondary_income')
            .update({ amount: remainingAdvance })
            .eq('id', existingAdvance.id);

          if (advanceUpdateError) throw advanceUpdateError;
        } else {
          const { error: advanceInsertError } = await supabase
            .from('secondary_income')
            .insert({
              booking_id: booking.id,
              amount: remainingAdvance,
              category_id: advanceCategory.id,
              organization_id: booking.organization_id
            });

          if (advanceInsertError) throw advanceInsertError;
        }
      }

      toast({
        title: "Success",
        description: "Allocations saved successfully",
      });

      // Refresh data
      await fetchData();
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

  // Calculate remaining advance
  const totalAllocated = formRows.reduce((sum, row) => {
    if (row.categoryId && row.amount && Number(row.amount) > 0) {
      return sum + Number(row.amount);
    }
    return sum;
  }, 0);
  const remainingAdvance = advanceAmount - totalAllocated;

  // Get secondary income subcategories (excluding Advance)
  const secondaryIncomeParent = categories.find(cat => cat.name === 'Secondary Income' && !cat.parent_id);
  const availableCategories = categories.filter(cat => 
    cat.parent_id === secondaryIncomeParent?.id && 
    cat.name !== 'Advance'
  );

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Advance: <CurrencyDisplay amount={remainingAdvance} className="font-medium" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Headers */}
          <div className="grid grid-cols-[1fr_100px_40px_40px] gap-2 text-sm font-medium text-muted-foreground">
            <div>Category</div>
            <div>Amount</div>
            <div></div>
            <div></div>
          </div>
          
          {formRows.map((row, index) => (
            <div key={row.id} className="grid grid-cols-[1fr_100px_40px_40px] gap-2 items-center">
              <div>
                {row.isNew ? (
                  <Select 
                    value={row.categoryId} 
                    onValueChange={(value) => updateFormRow(row.id, 'categoryId', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-sm">{getCategoryName(row.categoryId)}</span>
                )}
              </div>
              
              <div>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={row.amount}
                  onChange={(e) => updateFormRow(row.id, 'amount', e.target.value)}
                  min="1"
                  className="h-9"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNewRow()}
                className="h-9 w-9 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              {formRows.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeRow(row.id, row.isNew)}
                  disabled={loading}
                  className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button 
            onClick={handleSave} 
            disabled={loading || formRows.every(row => !row.categoryId || !row.amount)}
            className="w-full"
          >
            Save
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};