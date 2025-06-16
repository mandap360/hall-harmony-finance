
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface IncomeCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export const useIncomeCategories = () => {
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchIncomeCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('income_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setIncomeCategories(data || []);
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
    fetchIncomeCategories();
  }, []);

  return {
    incomeCategories,
    loading,
    refetch: fetchIncomeCategories,
  };
};
