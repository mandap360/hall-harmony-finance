
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
  const { profile } = useAuth();

  const fetchAdditionalIncomes = useCallback(async (bookingId: string) => {
    if (!profile?.organization_id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('secondary_income')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdditionalIncomes(data || []);
    } catch (error) {
      console.error('Error fetching additional income categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch additional income categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addAdditionalIncome = async (bookingId: string, category: string, amount: number) => {
    if (!profile?.organization_id) return false;
    
    try {
      const { data, error } = await supabase
        .from('secondary_income')
        .insert([
          {
            booking_id: bookingId,
            category,
            amount,
            organization_id: profile.organization_id,
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
      return true;
    } catch (error) {
      console.error('Error adding additional income category:', error);
      toast({
        title: "Error",
        description: "Failed to add additional income category",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteAdditionalIncome = async (id: string) => {
    try {
      const { error } = await supabase
        .from('secondary_income')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAdditionalIncomes(prev => prev.filter(income => income.id !== id));
      toast({
        title: "Success",
        description: "Category allocation removed successfully",
      });
    } catch (error) {
      console.error('Error deleting additional income category:', error);
      toast({
        title: "Error",
        description: "Failed to remove category allocation",
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
