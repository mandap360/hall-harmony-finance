
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Income {
  id: string;
  bookingId: string;
  amount: number;
  date: string;
  type: "rent" | "advance" | "Secondary Income" | "refund";
  description: string;
  payment_mode?: string;
}

export const useIncome = () => {
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchIncome = async () => {
    try {
      setLoading(true);
      console.log("Fetching income from Supabase...");
      
      // Get current user's organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        console.error('No profile found for user');
        return;
      }

      const { data: incomeData, error } = await supabase
        .from('income')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching income:', error);
        throw error;
      }

      console.log("Raw income data:", incomeData);

      // Transform the data and ensure category_id is used correctly
      const transformedIncome: Income[] = (incomeData || []).map(payment => ({
        id: payment.id,
        bookingId: payment.booking_id,
        amount: Number(payment.amount),
        date: payment.payment_date,
        type: payment.category_id as "rent" | "advance" | "Secondary Income" | "refund",
        description: payment.description || '',
        payment_mode: payment.payment_mode
      }));

      console.log("Transformed income:", transformedIncome);
      setIncome(transformedIncome);
    } catch (error) {
      console.error('Error fetching income:', error);
      toast({
        title: "Error",
        description: "Failed to fetch income",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  const addIncome = async (incomeData: Omit<Income, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('income')
        .insert({
          booking_id: incomeData.bookingId,
          amount: incomeData.amount,
          payment_date: incomeData.date,
          category_id: incomeData.type,
          description: incomeData.description
        })
        .select()
        .single();

      if (error) throw error;

      // Transform the returned data to match our interface
      const newIncome: Income = {
        id: data.id,
        bookingId: data.booking_id,
        amount: Number(data.amount),
        date: data.payment_date,
        type: data.category_id as "rent" | "advance" | "Secondary Income" | "refund",
        description: data.description || ''
      };

      setIncome(prev => [newIncome, ...prev]);
      
      toast({
        title: "Success",
        description: "Income added successfully",
      });
    } catch (error) {
      console.error('Error adding income:', error);
      toast({
        title: "Error",
        description: "Failed to add income",
        variant: "destructive",
      });
    }
  };

  const getCurrentFYIncome = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    let fyStartYear, fyEndYear;
    if (month >= 3) { // April onwards (month is 0-indexed)
      fyStartYear = year;
      fyEndYear = year + 1;
    } else { // January to March
      fyStartYear = year - 1;
      fyEndYear = year;
    }

    return income.filter(payment => {
      const paymentDate = new Date(payment.date);
      const paymentYear = paymentDate.getFullYear();
      const paymentMonth = paymentDate.getMonth();
      
      if (paymentMonth >= 3) { // April onwards
        return paymentYear === fyStartYear;
      } else { // January to March
        return paymentYear === fyEndYear;
      }
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const end = new Date(endDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    if (start === end) {
      return start;
    } else {
      return `${start} - ${end}`;
    }
  };

  return {
    income,
    loading,
    addIncome,
    refetch: fetchIncome,
    getCurrentFYIncome,
    formatDateRange
  };
};