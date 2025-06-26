
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_date: string;
  payment_type: 'advance' | 'rent' | 'additional';
  description?: string;
  payment_mode?: string;
  created_at: string;
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

      // Type the data properly by casting payment_type to the expected union type
      const typedPayments: Payment[] = (data || []).map(payment => ({
        ...payment,
        payment_type: payment.payment_type as 'advance' | 'rent' | 'additional'
      }));

      setPayments(typedPayments);
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

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'created_at'>) => {
    try {
      // First, get the booking details to create proper transaction description
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('event_name, start_datetime, end_datetime')
        .eq('id', paymentData.booking_id)
        .single();

      if (bookingError) {
        console.error('Error fetching booking details:', bookingError);
      }

      const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single();

      if (error) throw error;

      // Add corresponding transaction if payment_mode is provided
      if (paymentData.payment_mode) {
        const formatDate = (dateString: string) => {
          return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
        };

        let transactionDescription = `Payment - ${paymentData.payment_type}`;
        
        if (booking) {
          const startDate = formatDate(booking.start_datetime);
          const endDate = formatDate(booking.end_datetime);
          transactionDescription = `Payment - ${booking.event_name} (${startDate} - ${endDate})`;
        }

        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            account_id: paymentData.payment_mode,
            transaction_type: 'credit',
            amount: paymentData.amount,
            description: transactionDescription,
            reference_type: 'payment',
            reference_id: data.id,
            transaction_date: paymentData.payment_date
          });

        if (transactionError) {
          console.error('Error creating transaction:', transactionError);
        }
      }

      // Type the returned data properly
      const typedPayment: Payment = {
        ...data,
        payment_type: data.payment_type as 'advance' | 'rent' | 'additional'
      };

      setPayments(prev => [typedPayment, ...prev]);
      toast({
        title: "Success",
        description: "Payment added successfully",
      });

      return typedPayment;
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: "Failed to add payment",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    loading,
    addPayment,
    fetchPayments,
  };
};
