
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdditionalIncome {
  id: string;
  booking_id: string;
  category: string;
  amount: number;
  created_at: string;
}

export const useAdditionalIncome = () => {
  const [additionalIncomes, setAdditionalIncomes] = useState<AdditionalIncome[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAdditionalIncomes = async (bookingId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('additional_income')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdditionalIncomes(data || []);
    } catch (error) {
      console.error('Error fetching additional incomes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch additional incomes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addAdditionalIncome = async (bookingId: string, category: string, amount: number) => {
    try {
      const { data, error } = await supabase
        .from('additional_income')
        .insert([
          {
            booking_id: bookingId,
            category,
            amount,
          }
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Error",
            description: "This income category has already been added for this booking",
            variant: "destructive",
          });
          return false;
        }
        throw error;
      }

      setAdditionalIncomes(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Additional income added successfully",
      });
      return true;
    } catch (error) {
      console.error('Error adding additional income:', error);
      toast({
        title: "Error",
        description: "Failed to add additional income",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteAdditionalIncome = async (id: string) => {
    try {
      const { error } = await supabase
        .from('additional_income')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAdditionalIncomes(prev => prev.filter(income => income.id !== id));
      toast({
        title: "Success",
        description: "Additional income deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting additional income:', error);
      toast({
        title: "Error",
        description: "Failed to delete additional income",
        variant: "destructive",
      });
    }
  };

  return {
    additionalIncomes,
    loading,
    fetchAdditionalIncomes,
    addAdditionalIncome,
    deleteAdditionalIncome,
  };
};
