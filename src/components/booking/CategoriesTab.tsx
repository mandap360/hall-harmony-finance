import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CategoriesTabProps {
  booking: any;
}

interface CategoryWithParent {
  id: string;
  name: string;
  parent_id?: string;
  parent_name?: string;
}

export const CategoriesTab = ({ booking }: CategoriesTabProps) => {
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [allocations, setAllocations] = useState<{ [key: string]: number }>({});
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [secondaryIncomeCategories, setSecondaryIncomeCategories] = useState<CategoryWithParent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch secondary income categories
    fetchSecondaryIncomeCategories();
    
    // Calculate total advance amount for this booking
    const advancePayments = booking.income?.filter((payment: any) => 
      payment.income_categories?.name === 'Advance'
    ) || [];
    
    const totalAdvance = advancePayments.reduce((sum: number, payment: any) => 
      sum + payment.amount, 0
    );
    
    setAdvanceAmount(totalAdvance);
    
    // Load existing allocations
    loadExistingAllocations();
  }, [booking]);

  const fetchSecondaryIncomeCategories = async () => {
    try {
      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.organization_id) return;

      // Fetch secondary income categories with parent information
      const { data: categories } = await supabase
        .from('income_categories')
        .select(`
          id,
          name,
          parent_id,
          parent:income_categories!parent_id(name)
        `)
        .or(`organization_id.is.null,organization_id.eq.${profile.organization_id}`)
        .not('parent_id', 'is', null);

      if (categories) {
        const secondaryCategories = categories.filter((cat: any) => 
          cat.parent?.name === 'Secondary Income' && 
          cat.name !== 'Advance' && 
          cat.name !== 'Unallocated'
        ).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          parent_id: cat.parent_id,
          parent_name: cat.parent?.name
        }));
        
        setSecondaryIncomeCategories(secondaryCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    // Calculate remaining amount
    const totalAllocated = Object.values(allocations).reduce((sum, amount) => sum + amount, 0);
    setRemainingAmount(advanceAmount - totalAllocated);
  }, [advanceAmount, allocations]);

  const loadExistingAllocations = async () => {
    try {
      // Get existing allocations for this booking
      const { data: existingAllocations } = await supabase
        .from('income')
        .select(`
          amount,
          category_id,
          income_categories!category_id(name)
        `)
        .eq('booking_id', booking.id)
        .in('income_categories.name', secondaryIncomeCategories.map(cat => cat.name));

      if (existingAllocations) {
        const allocationMap: { [key: string]: number } = {};
        existingAllocations.forEach((allocation: any) => {
          allocationMap[allocation.category_id] = allocation.amount;
        });
        setAllocations(allocationMap);
      }
    } catch (error) {
      console.error('Error loading allocations:', error);
    }
  };

  const handleAllocationChange = (categoryId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setAllocations(prev => ({
      ...prev,
      [categoryId]: numAmount
    }));
  };

  const handleSaveAllocations = async () => {
    try {
      // First, delete existing allocations for this booking (except Advance and Unallocated)
      const categoryNames = secondaryIncomeCategories.map(cat => cat.name);
      
      const { data: existingAllocations } = await supabase
        .from('income')
        .select(`
          id,
          income_categories!category_id(name)
        `)
        .eq('booking_id', booking.id);

      if (existingAllocations) {
        const allocationsToDelete = existingAllocations.filter((allocation: any) =>
          categoryNames.includes(allocation.income_categories?.name)
        );

        for (const allocation of allocationsToDelete) {
          await supabase
            .from('income')
            .delete()
            .eq('id', allocation.id);
        }
      }

      // Create new allocations
      for (const [categoryId, amount] of Object.entries(allocations)) {
        if (amount > 0) {
          await supabase
            .from('income')
            .insert({
              booking_id: booking.id,
              amount: amount,
              date: booking.startDate,
              category_id: categoryId,
              description: `Allocated from Advance - ${booking.eventName}`,
              organization_id: booking.organization_id
            });
        }
      }

      // Update Unallocated amount if there's remaining advance
      if (remainingAmount > 0) {
        // Get user's organization
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        // Find unallocated category
        const { data: unallocatedCategory } = await supabase
          .from('income_categories')
          .select('id')
          .eq('name', 'Unallocated')
          .or(`organization_id.is.null,organization_id.eq.${profile?.organization_id}`)
          .single();

        if (unallocatedCategory) {
          await supabase
            .from('income')
            .insert({
              booking_id: booking.id,
              amount: remainingAmount,
              date: booking.startDate,
              category_id: unallocatedCategory.id,
              description: `Unallocated Advance - ${booking.eventName}`,
              organization_id: booking.organization_id
            });
        }
      }

      toast({
        title: "Success",
        description: "Advance allocations saved successfully",
      });

      // Refresh the data
      window.dispatchEvent(new CustomEvent('booking-updated'));
      
    } catch (error) {
      console.error('Error saving allocations:', error);
      toast({
        title: "Error",
        description: "Failed to save allocations",
        variant: "destructive",
      });
    }
  };

  if (advanceAmount === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            No advance payments found for this booking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Advance Allocation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Advance:</span>
              <span className="ml-2 font-medium">₹{advanceAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Remaining:</span>
              <span className={`ml-2 font-medium ${remainingAmount < 0 ? 'text-destructive' : 'text-foreground'}`}>
                ₹{remainingAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {remainingAmount < 0 && (
            <p className="text-destructive text-sm">
              Allocation exceeds advance amount by ₹{Math.abs(remainingAmount).toLocaleString()}
            </p>
          )}

          <div className="space-y-3">
            {secondaryIncomeCategories.map((category) => (
              <div key={category.id} className="flex items-center space-x-3">
                <Label className="text-sm font-medium min-w-[120px]">
                  {category.name}:
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={allocations[category.id] || ''}
                  onChange={(e) => handleAllocationChange(category.id, e.target.value)}
                  className="flex-1"
                />
              </div>
            ))}
          </div>

          <Button 
            onClick={handleSaveAllocations}
            className="w-full"
            disabled={remainingAmount < 0}
          >
            Save Allocations
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};