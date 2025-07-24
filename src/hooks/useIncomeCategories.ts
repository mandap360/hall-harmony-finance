
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface IncomeCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  parent_id?: string;
  is_default?: boolean;
  organization_id?: string;
}

export const useIncomeCategories = () => {
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching income categories...');
      
      // First, get user's organization_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }

      const userOrgId = profile?.organization_id;
      console.log('User organization ID:', userOrgId);

      // Fetch both default categories (organization_id is null) and organization-specific categories
      const { data, error } = await supabase
        .from('income_categories')
        .select('*')
        .or(`organization_id.is.null,organization_id.eq.${userOrgId}`)
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log('Raw categories data:', data);

      const transformedCategories: IncomeCategory[] = (data || []).map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        createdAt: category.created_at,
        parent_id: category.parent_id,
        is_default: category.is_default,
        organization_id: category.organization_id
      }));

      console.log('Transformed categories:', transformedCategories);
      setCategories(transformedCategories);
    } catch (error) {
      console.error('Error fetching income categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch income categories. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (categoryData: { name: string; parent_id?: string | null }) => {
    try {
      console.log('Adding category:', categoryData);
      
      // Get user's organization_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }

      const { error } = await supabase
        .from('income_categories')
        .insert({
          name: categoryData.name,
          parent_id: categoryData.parent_id,
          organization_id: profile?.organization_id,
          is_default: false
        });

      if (error) {
        console.error('Error adding category:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Income category added successfully",
      });

      fetchCategories();
    } catch (error) {
      console.error('Error adding income category:', error);
      toast({
        title: "Error",
        description: "Failed to add income category. Please check the console for details.",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      console.log('Deleting category:', categoryId);
      
      // Check if category is a default category (organization_id is null)
      const categoryToDelete = categories.find(cat => cat.id === categoryId);
      if (categoryToDelete && !categoryToDelete.organization_id) {
        toast({
          title: "⚠️ This category cannot be deleted as it is mandatory.",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('income_categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('Error deleting category:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Income category deleted successfully",
      });

      fetchCategories();
    } catch (error) {
      console.error('Error deleting income category:', error);
      toast({
        title: "Error",
        description: "Failed to delete income category. Please check the console for details.",
        variant: "destructive",
      });
    }
  };

  const updateCategory = async (categoryId: string, categoryData: { name: string }) => {
    try {
      console.log('Updating category:', categoryId, categoryData);
      
      const { error } = await supabase
        .from('income_categories')
        .update({
          name: categoryData.name
        })
        .eq('id', categoryId);

      if (error) {
        console.error('Error updating category:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Income category updated successfully",
      });

      fetchCategories();
    } catch (error) {
      console.error('Error updating income category:', error);
      toast({
        title: "Error",
        description: "Failed to update income category. Please check the console for details.",
        variant: "destructive",
      });
    }
  };

  return {
    categories,
    loading,
    addCategory,
    deleteCategory,
    updateCategory,
    refetch: fetchCategories
  };
};
