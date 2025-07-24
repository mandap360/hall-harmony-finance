
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  createdAt: string;
  parent_id?: string;
  organization_id?: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Fetch income categories
      const { data: incomeData, error: incomeError } = await supabase
        .from('income_categories')
        .select('*')
        .order('name', { ascending: true });

      if (incomeError) throw incomeError;

      // Fetch expense categories
      const { data: expenseData, error: expenseError } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name', { ascending: true });

      if (expenseError) throw expenseError;

      // Transform to unified format
      const allCategories: Category[] = [
        ...(incomeData || []).map(cat => ({
          id: cat.id,
          name: cat.name,
          type: "income" as const,
          createdAt: cat.created_at,
          parent_id: cat.parent_id,
          organization_id: cat.organization_id
        })),
        ...(expenseData || []).map(cat => ({
          id: cat.id,
          name: cat.name,
          type: "expense" as const,
          createdAt: cat.created_at,
          parent_id: cat.parent_id,
          organization_id: cat.organization_id
        }))
      ];

      setCategories(allCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (categoryData: Omit<Category, "id" | "createdAt">) => {
    try {
      console.log('Adding category:', categoryData);
      const tableName = categoryData.type === 'income' ? 'income_categories' : 'expense_categories';
      
      const { data, error } = await supabase
        .from(tableName)
        .insert({
          name: categoryData.name,
          parent_id: categoryData.parent_id
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Category added successfully:', data);
      await fetchCategories();
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) return;

      // Check if category is a default category (organization_id is null)
      if (!category.organization_id) {
        toast({
          title: "⚠️ You cannot delete this category because it is a required system category.",
          variant: "destructive",
        });
        return;
      }

      const tableName = category.type === 'income' ? 'income_categories' : 'expense_categories';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      await fetchCategories();
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const getIncomeCategories = () => categories.filter(cat => cat.type === "income");
  const getExpenseCategories = () => categories.filter(cat => cat.type === "expense");

  return {
    categories,
    loading,
    addCategory,
    deleteCategory,
    getIncomeCategories,
    getExpenseCategories,
    refetch: fetchCategories
  };
};
