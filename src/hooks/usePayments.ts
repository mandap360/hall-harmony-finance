
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentDate: string;
  paymentType: string;
  description?: string;
  createdAt: string;
}

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPayments = async (bookingId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (bookingId) {
        query = query.eq('booking_id', bookingId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedPayments: Payment[] = (data || []).map(payment => ({
        id: payment.id,
        bookingId: payment.booking_id,
        amount: Number(payment.amount),
        paymentDate: payment.payment_date,
        paymentType: payment.payment_type,
        description: payment.description,
        createdAt: payment.created_at
      }));

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

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          booking_id: paymentData.bookingId,
          amount: paymentData.amount,
          payment_date: paymentData.paymentDate,
          payment_type: paymentData.paymentType,
          description: paymentData.description
        });

      if (error) throw error;

      await fetchPayments();
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

  return {
    payments,
    loading,
    addPayment,
    fetchPayments
  };
};
