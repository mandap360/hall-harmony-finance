import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface IncomeCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  parent_id?: string;
}

export const useIncomeCategories = () => {
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('income_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const transformedCategories: IncomeCategory[] = (data || []).map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        createdAt: category.created_at,
        parent_id: category.parent_id
      }));

      setCategories(transformedCategories);
    } catch (error) {
      console.error('Error fetching income categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch income categories",
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
      const { error } = await supabase
        .from('income_categories')
        .insert({
          name: categoryData.name,
          parent_id: categoryData.parent_id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Income category added successfully",
      });

      fetchCategories();
    } catch (error) {
      console.error('Error adding income category:', error);
      toast({
        title: "Error",
        description: "Failed to add income category",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('income_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Income category deleted successfully",
      });

      fetchCategories();
    } catch (error) {
      console.error('Error deleting income category:', error);
      toast({
        title: "Error",
        description: "Failed to delete income category",
        variant: "destructive",
      });
    }
  };

  const updateCategory = async (categoryId: string, categoryData: { name: string }) => {
    try {
      const { error } = await supabase
        .from('income_categories')
        .update({
          name: categoryData.name
        })
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Income category updated successfully",
      });

      fetchCategories();
    } catch (error) {
      console.error('Error updating income category:', error);
      toast({
        title: "Error",
        description: "Failed to update income category",
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