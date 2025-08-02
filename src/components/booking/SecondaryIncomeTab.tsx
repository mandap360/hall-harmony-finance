import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
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
  const [originalAdvanceAmount, setOriginalAdvanceAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const { toast } = useToast();
  const { accounts } = useAccounts();
  const { addTransaction } = useTransactions();

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
        // Filter to get Secondary Income parent and all its children (excluding refund categories)
        const secondaryIncomeParent = categoriesData.find(cat => cat.name === 'Secondary Income' && !cat.parent_id);
        const secondaryIncomeCategories = categoriesData.filter(cat => 
          (cat.id === secondaryIncomeParent?.id || cat.parent_id === secondaryIncomeParent?.id) &&
          !cat.name.toLowerCase().includes('refund')
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
        setOriginalAdvanceAmount(totalAdvance);
      }

      // Get existing allocations from secondary_income table (excluding Advance and Refund)
      const { data: allocationsData } = await supabase
        .from('secondary_income')
        .select(`
          id,
          amount,
          category_id,
          income_categories!inner(name)
        `)
        .eq('booking_id', booking.id)
        .neq('income_categories.name', 'Advance')
        .not('income_categories.name', 'ilike', '%refund%');

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
      // Delete from database if it's an existing allocation and add amount back to advance
      setLoading(true);
      try {
        const rowToDelete = formRows.find(row => row.id === id);
        const deletedAmount = Number(rowToDelete?.amount || 0);

        // Delete the allocation
        const { error } = await supabase
          .from('secondary_income')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Update advance amount by adding back the deleted amount
        const advanceCategory = categories.find(cat => cat.name === 'Advance');
        if (advanceCategory && deletedAmount > 0) {
          const { data: existingAdvance } = await supabase
            .from('secondary_income')
            .select('id, amount')
            .eq('booking_id', booking.id)
            .eq('category_id', advanceCategory.id)
            .maybeSingle();

          if (existingAdvance) {
            const newAdvanceAmount = Number(existingAdvance.amount) + deletedAmount;
            const { error: advanceUpdateError } = await supabase
              .from('secondary_income')
              .update({ amount: newAdvanceAmount })
              .eq('id', existingAdvance.id);

            if (advanceUpdateError) throw advanceUpdateError;
            
            // Update local state
            setOriginalAdvanceAmount(prev => prev + deletedAmount);
          }
        }

        setFormRows(prev => prev.filter(row => row.id !== id));
        
        toast({
          title: "Success",
          description: "Allocation removed and advance updated successfully",
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
      // Validate rows
      const validRows = formRows.filter(row => {
        return row.categoryId && row.amount && Number(row.amount) > 0;
      });
      
      // Check if new allocations don't exceed remaining advance amount
      const newValidRows = validRows.filter(row => row.isNew);
      const totalNewAllocations = newValidRows.reduce((sum, row) => sum + Number(row.amount), 0);
      if (totalNewAllocations > remainingAdvance) {
        toast({
          title: "Invalid Amount",
          description: "New allocations exceed available advance amount",
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

      // Update Advance amount to the remaining advance displayed in UI
      const advanceCategory = categories.find(cat => cat.name === 'Advance');
      if (advanceCategory) {
        const { data: existingAdvance } = await supabase
          .from('secondary_income')
          .select('id')
          .eq('booking_id', booking.id)
          .eq('category_id', advanceCategory.id)
          .maybeSingle();

        if (existingAdvance) {
          const { error: advanceUpdateError } = await supabase
            .from('secondary_income')
            .update({ amount: remainingAdvance })
            .eq('id', existingAdvance.id);

          if (advanceUpdateError) throw advanceUpdateError;
        } else if (remainingAdvance > 0) {
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

  const handleRefund = async (paymentMethodId: string) => {
    setRefundLoading(true);
    
    try {
      // Validation: Check if remaining advance is greater than 0
      if (remainingAdvance <= 0) {
        toast({
          title: "Error",
          description: "No advance amount available for refund",
          variant: "destructive",
        });
        return;
      }

      // Find refund category
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('income_categories')
        .select('id, name, parent_id');

      if (categoriesError) throw categoriesError;

      const secondaryIncomeParent = categoriesData?.find(cat => cat.name === 'Secondary Income' && !cat.parent_id);
      const refundCategory = categoriesData?.find(cat => 
        cat.parent_id === secondaryIncomeParent?.id && 
        cat.name.toLowerCase().includes('refund')
      );

      if (!refundCategory) {
        toast({
          title: "Error",
          description: "Refund category not found",
          variant: "destructive",
        });
        return;
      }

      const refundAmount = remainingAdvance;
      const refundDescription = `${refundCategory.name} - ${secondaryIncomeParent?.name}`;

      // 1) Add/Update entry in secondary_income table
      const { data: existingRefund } = await supabase
        .from('secondary_income')
        .select('id, amount')
        .eq('booking_id', booking.id)
        .eq('category_id', refundCategory.id)
        .maybeSingle();

      if (existingRefund) {
        // Update existing refund entry with negative amount
        const newAmount = Number(existingRefund.amount) - refundAmount;
        const { error: updateRefundError } = await supabase
          .from('secondary_income')
          .update({ amount: newAmount })
          .eq('id', existingRefund.id);

        if (updateRefundError) throw updateRefundError;
      } else {
        // Create new refund entry with negative amount
        const { error: insertRefundError } = await supabase
          .from('secondary_income')
          .insert({
            booking_id: booking.id,
            amount: -refundAmount,
            category_id: refundCategory.id,
            organization_id: booking.organization_id
          });

        if (insertRefundError) throw insertRefundError;
      }

      // 2) Add entry to income table (negative amount)
      const { error: incomeError } = await supabase
        .from('income')
        .insert({
          booking_id: booking.id,
          amount: -refundAmount,
          payment_date: new Date().toISOString().split('T')[0],
          organization_id: booking.organization_id,
          category_id: refundCategory.id,
          payment_mode: paymentMethodId,
          description: refundDescription
        });

      if (incomeError) throw incomeError;

      // 3) Add entry to transactions table (debit)
      await addTransaction({
        account_id: paymentMethodId,
        transaction_type: 'debit' as 'debit',
        amount: refundAmount,
        description: refundDescription,
        reference_type: 'booking',
        reference_id: booking.id,
        transaction_date: new Date().toISOString().split('T')[0]
      });

      // Update advance amount by reducing the refund amount
      const advanceCategory = categories.find(cat => cat.name === 'Advance');
      if (advanceCategory) {
        const { data: existingAdvance } = await supabase
          .from('secondary_income')
          .select('id, amount')
          .eq('booking_id', booking.id)
          .eq('category_id', advanceCategory.id)
          .maybeSingle();

        if (existingAdvance) {
          const newAdvanceAmount = Number(existingAdvance.amount) - refundAmount;
          const { error: advanceUpdateError } = await supabase
            .from('secondary_income')
            .update({ amount: newAdvanceAmount })
            .eq('id', existingAdvance.id);

          if (advanceUpdateError) throw advanceUpdateError;
        }
      }

      toast({
        title: "Success",
        description: "Refund processed successfully",
      });

      setRefundDialogOpen(false);
      await fetchData();
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: "Error",
        description: `Failed to process refund: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setRefundLoading(false);
    }
  };

  // Calculate amounts for new allocations only
  const totalNewAllocations = formRows.reduce((sum, row) => {
    if (row.isNew && row.categoryId && row.amount && Number(row.amount) > 0) {
      return sum + Number(row.amount);
    }
    return sum;
  }, 0);
  
  const remainingAdvance = originalAdvanceAmount - totalNewAllocations;

  // Check if there are only existing rows (no new valid rows)
  const hasNewValidRows = formRows.some(row => 
    row.isNew && row.categoryId && row.amount && Number(row.amount) > 0
  );

  // Get secondary income subcategories (excluding Advance and Refund)
  const secondaryIncomeParent = categories.find(cat => cat.name === 'Secondary Income' && !cat.parent_id);
  const availableCategories = categories.filter(cat => 
    cat.parent_id === secondaryIncomeParent?.id && 
    cat.name !== 'Advance' &&
    !cat.name.toLowerCase().includes('refund')
  );

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || '';
  };

  const operationalAccounts = accounts.filter(account => account.account_type === 'operational');

  return (
    <div className="space-y-4">
      {/* Remaining Advance Card */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium text-muted-foreground mb-1">
            Remaining Advance
          </div>
          <div className="text-2xl font-bold">
            <CurrencyDisplay amount={remainingAdvance} />
          </div>
        </CardContent>
      </Card>

      {/* Allocation Form */}
      <div className="space-y-3">
        {formRows.map((row, index) => (
          <div key={row.id} className="flex gap-2 items-center">
            <div className="flex-1">
              {row.isNew ? (
                <Select 
                  value={row.categoryId} 
                  onValueChange={(value) => updateFormRow(row.id, 'categoryId', value)}
                >
                  <SelectTrigger>
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
                <div className="px-3 py-2 border rounded-md bg-muted">
                  {getCategoryName(row.categoryId)}
                </div>
              )}
            </div>
            
            <div className="w-24">
              <Input
                type="number"
                placeholder="0.00"
                value={row.amount}
                onChange={(e) => updateFormRow(row.id, 'amount', e.target.value)}
                min="1"
                disabled={!row.isNew}
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNewRow()}
              className="w-10 h-10 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            {formRows.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeRow(row.id, row.isNew)}
                disabled={loading}
                className="w-10 h-10 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="destructive"
              disabled={remainingAdvance <= 0 || refundLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {refundLoading ? "Processing..." : "Refund"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Payment Method</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Refund Amount</label>
                <div className="text-lg font-semibold">
                  <CurrencyDisplay amount={remainingAdvance} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-3 block">Select Account</label>
                <div className="space-y-2">
                  {operationalAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted"
                      onClick={() => handleRefund(account.id)}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={account.id}
                        className="cursor-pointer"
                        readOnly
                      />
                      <label className="cursor-pointer flex-1">{account.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          onClick={handleSave} 
          disabled={loading || !hasNewValidRows || remainingAdvance < 0}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};