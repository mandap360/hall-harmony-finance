
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  date: string;
  type: "rent" | "advance" | "additional";
  description: string;
  payment_mode?: string;
}

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      console.log("Fetching payments from Supabase...");
      
      const { data: paymentsData, error } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        throw error;
      }

      console.log("Raw payments data:", paymentsData);

      // Transform the data and ensure payment_type is cast correctly
      const transformedPayments: Payment[] = (paymentsData || []).map(payment => ({
        id: payment.id,
        bookingId: payment.booking_id,
        amount: Number(payment.amount),
        date: payment.payment_date,
        type: payment.payment_type as "rent" | "advance" | "additional",
        description: payment.description || '',
        payment_mode: payment.payment_mode
      }));

      console.log("Transformed payments:", transformedPayments);
      setPayments(transformedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const addPayment = async (paymentData: Omit<Payment, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          booking_id: paymentData.bookingId,
          amount: paymentData.amount,
          payment_date: paymentData.date,
          payment_type: paymentData.type,
          description: paymentData.description
        })
        .select()
        .single();

      if (error) throw error;

      // Transform the returned data to match our interface
      const newPayment: Payment = {
        id: data.id,
        bookingId: data.booking_id,
        amount: Number(data.amount),
        date: data.payment_date,
        type: data.payment_type as "rent" | "advance" | "additional",
        description: data.description || ''
      };

      setPayments(prev => [newPayment, ...prev]);
      
      toast({
        title: "Success",
        description: "Payment added successfully",
      });
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: "Failed to add payment",
        variant: "destructive",
      });
    }
  };

  const getCurrentFYPayments = () => {
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

    return payments.filter(payment => {
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
    payments,
    loading,
    addPayment,
    refetch: fetchPayments,
    getCurrentFYPayments,
    formatDateRange
  };
};
