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

export const usePayments = (bookingId?: string) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPayments = async () => {
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          bookings:booking_id (
            event_name,
            start_datetime,
            end_datetime
          )
        `)
        .order('payment_date', { ascending: false });

      if (bookingId) {
        query = query.eq('booking_id', bookingId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setPayments((data as any[])?.map(payment => ({
        ...payment,
        payment_type: payment.payment_type as 'rent' | 'advance' | 'additional'
      })) || []);
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
      const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select(`
          *,
          bookings:booking_id (
            event_name,
            start_datetime,
            end_datetime
          )
        `)
        .single();

      if (error) throw error;

      setPayments(prev => [{ 
        ...data, 
        payment_type: data.payment_type as 'rent' | 'advance' | 'additional'
      }, ...prev]);
      
      // Create transaction entry
      await createTransactionFromPayment(data);
      
      toast({
        title: "Success",
        description: "Payment added successfully",
      });

      return data;
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

  const createTransactionFromPayment = async (payment: any) => {
    try {
      // Get the default cash account
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('sub_type', 'cash')
        .eq('is_default', true)
        .single();

      if (accountsError) {
        console.error('Error fetching default cash account:', accountsError);
        return;
      }

      const booking = payment.bookings;
      
      // Function to format date range
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

      const description = booking 
        ? `${payment.payment_type === 'advance' ? 'Advance' : payment.payment_type === 'rent' ? 'Rent' : 'Additional'} payment for ${booking.event_name} (${formatDateRange(booking.start_datetime, booking.end_datetime)})`
        : `${payment.payment_type} payment`;

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          account_id: accounts.id,
          transaction_type: 'credit',
          amount: payment.amount,
          description: description,
          reference_type: 'payment',
          reference_id: payment.id,
          transaction_date: payment.payment_date
        }]);

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
      }
    } catch (error) {
      console.error('Error in createTransactionFromPayment:', error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    loading,
    addPayment,
    deletePayment,
    refreshPayments: fetchPayments,
  };
};
