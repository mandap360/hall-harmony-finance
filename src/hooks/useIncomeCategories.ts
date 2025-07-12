import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface IncomeCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
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
        createdAt: category.created_at
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

  return {
    incomeCategories: categories,
    loading,
    refetch: fetchCategories
  };
};