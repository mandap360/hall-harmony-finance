import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export type AccountCategoryType = 'income' | 'expense';

export interface AccountCategory {
  id: string;
  name: string;
  type: AccountCategoryType;
  is_secondary_income: boolean;
  organization_id: string | null;
  is_default: boolean;
  created_at: string;
}

export const useAccountCategories = () => {
  const [categories, setCategories] = useState<AccountCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchCategories = useCallback(async () => {
    if (!profile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('AccountCategories')
        .select('*')
        .or(`organization_id.is.null,organization_id.eq.${profile.organization_id}`)
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories((data || []) as AccountCategory[]);
    } catch (error) {
      console.error('Error fetching account categories:', error);
      toast({ title: 'Error', description: 'Failed to fetch categories', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [profile?.organization_id, toast]);

  const addCategory = async (data: {
    name: string;
    type: AccountCategoryType;
    is_secondary_income?: boolean;
  }) => {
    if (!profile?.organization_id) return;

    try {
      const { error } = await supabase.from('AccountCategories').insert([
        {
          name: data.name,
          type: data.type,
          is_secondary_income: data.is_secondary_income || false,
          organization_id: profile.organization_id,
          is_default: false,
        },
      ]);

      if (error) throw error;
      await fetchCategories();
      toast({ title: 'Success', description: 'Category added successfully' });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({ title: 'Error', description: 'Failed to add category', variant: 'destructive' });
    }
  };

  const updateCategory = async (
    id: string,
    data: Partial<Pick<AccountCategory, 'name' | 'type' | 'is_secondary_income'>>,
  ) => {
    const cat = categories.find((c) => c.id === id);
    if (cat && !cat.organization_id) {
      toast({ title: 'Cannot edit default category', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase.from('AccountCategories').update(data).eq('id', id);
      if (error) throw error;
      await fetchCategories();
      toast({ title: 'Success', description: 'Category updated' });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({ title: 'Error', description: 'Failed to update category', variant: 'destructive' });
    }
  };

  const deleteCategory = async (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (cat && !cat.organization_id) {
      toast({ title: 'Cannot delete default category', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase.from('AccountCategories').delete().eq('id', id);
      if (error) throw error;
      await fetchCategories();
      toast({ title: 'Success', description: 'Category deleted' });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (profile?.organization_id) fetchCategories();
  }, [profile?.organization_id, fetchCategories]);

  return {
    categories,
    incomeCategories: categories.filter((c) => c.type === 'income'),
    expenseCategories: categories.filter((c) => c.type === 'expense'),
    secondaryIncomeCategories: categories.filter((c) => c.is_secondary_income),
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
};
