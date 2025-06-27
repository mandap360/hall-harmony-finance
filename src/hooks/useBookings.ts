import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Booking {
  id: string;
  eventName: string;
  clientName: string;
  phoneNumber: string;
  startDate: string;
  endDate: string;
  rent: number;
  advance: number;
  notes?: string;
  paidAmount: number;
  additionalIncome: number;
  status?: string;
  payments: Array<{
    id: string;
    amount: number;
    date: string;
    type: string;
    description: string;
    payment_mode?: string;
  }>;
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log("Fetching bookings from Supabase...");
      
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('is_deleted', false)
        .order('start_datetime', { ascending: true });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        throw bookingsError;
      }

      // Fetch payments from the payments table only
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*');

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
      }

      console.log("Bookings data:", bookingsData);
      console.log("Payments data:", paymentsData);

      const transformedBookings: Booking[] = (bookingsData || []).map(booking => {
        // Get all payments for this booking from the payments table only
        const bookingPayments = (paymentsData || []).filter(payment => payment.booking_id === booking.id);
        
        // Separate rent/advance payments from additional income
        const rentPayments = bookingPayments.filter(payment => 
          payment.payment_type === 'advance' || payment.payment_type === 'rent'
        );
        
        const additionalPayments = bookingPayments.filter(payment => 
          payment.payment_type === 'additional'
        );

        // Calculate rent-related amounts (advance/rent payments only)
        const totalRentPaid = rentPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        
        // Calculate additional income separately
        const totalAdditionalIncome = additionalPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

        // Transform payments for display
        const allPayments = bookingPayments.map(payment => ({
          id: payment.id,
          amount: Number(payment.amount),
          date: payment.payment_date,
          type: payment.payment_type || 'rent',
          description: payment.description || '',
          payment_mode: payment.payment_mode
        }));

        return {
          id: booking.id,
          eventName: booking.event_name,
          clientName: booking.client_name,
          phoneNumber: booking.phone_number || '',
          startDate: booking.start_datetime,
          endDate: booking.end_datetime,
          rent: Number(booking.rent_finalized),
          advance: Math.max(Number(booking.rent_received), totalRentPaid),
          notes: '',
          paidAmount: totalRentPaid, // Only rent/advance payments
          additionalIncome: totalAdditionalIncome, // Separate additional income
          status: booking.status || 'confirmed',
          payments: allPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        };
      });

      console.log("Transformed bookings:", transformedBookings);
      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled'
        })
        .eq('id', bookingId);

      if (error) throw error;

      await fetchBookings();
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  const processRefund = async (refundData: {
    bookingId: string;
    amount: number;
    paymentMode: string; // This is now the account ID
    description: string;
  }) => {
    console.log('Starting refund processing:', refundData);
    
    try {
      // Get booking details to include function date in description
      const { data: booking } = await supabase
        .from('bookings')
        .select('event_name, start_datetime')
        .eq('id', refundData.bookingId)
        .single();

      const functionDate = booking ? new Date(booking.start_datetime).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : '';

      const refundDescription = `Rent Refund (Cancellation) - ${booking?.event_name || 'Event'} for ${functionDate}`;

      console.log('Processing refund with description:', refundDescription);

      // Step 1: Add a negative payment record to represent the refund
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: refundData.bookingId,
          amount: -Math.abs(refundData.amount), // Ensure negative amount
          payment_date: new Date().toISOString().split('T')[0],
          payment_type: 'refund',
          description: refundDescription,
          payment_mode: refundData.paymentMode // This is the account ID
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Error adding payment record:', paymentError);
        throw paymentError;
      }

      console.log('Payment record created:', paymentData);

      // Step 2: Add corresponding transaction record for account balance tracking
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          account_id: refundData.paymentMode, // This is the account ID
          transaction_type: 'debit',
          amount: Math.abs(refundData.amount), // Positive amount for debit transaction
          description: refundDescription,
          reference_type: 'booking_refund',
          reference_id: refundData.bookingId,
          transaction_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Error adding transaction record:', transactionError);
        // If transaction fails, we should rollback the payment
        await supabase
          .from('payments')
          .delete()
          .eq('id', paymentData.id);
        throw transactionError;
      }

      console.log('Transaction record created:', transactionData);

      // Refresh bookings data to show the updated state
      await fetchBookings();
      
      console.log('Refund processed successfully');
      toast({
        title: "Success",
        description: "Refund processed successfully",
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: "Error",
        description: "Failed to process refund. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to let the calling component handle it
    }
  };

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'payments' | 'paidAmount' | 'additionalIncome' | 'status'>) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          event_name: bookingData.eventName,
          client_name: bookingData.clientName,
          phone_number: bookingData.phoneNumber,
          start_datetime: bookingData.startDate,
          end_datetime: bookingData.endDate,
          rent_finalized: bookingData.rent,
          rent_received: bookingData.advance,
          status: 'confirmed'
        })
        .select()
        .single();

      if (error) throw error;

      // If there's an advance amount, create a payment record
      if (bookingData.advance > 0) {
        await supabase
          .from('payments')
          .insert({
            booking_id: data.id,
            amount: bookingData.advance,
            payment_date: new Date().toISOString().split('T')[0],
            payment_type: 'advance',
            description: 'Initial advance payment'
          });
      }

      await fetchBookings();
      toast({
        title: "Success",
        description: "Booking added successfully",
      });
    } catch (error) {
      console.error('Error adding booking:', error);
      toast({
        title: "Error",
        description: "Failed to add booking",
        variant: "destructive",
      });
    }
  };

  const updateBooking = async (updatedBooking: Booking) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          event_name: updatedBooking.eventName,
          client_name: updatedBooking.clientName,
          phone_number: updatedBooking.phoneNumber,
          start_datetime: updatedBooking.startDate,
          end_datetime: updatedBooking.endDate,
          rent_finalized: updatedBooking.rent,
          rent_received: updatedBooking.advance,
          status: updatedBooking.status || 'confirmed'
        })
        .eq('id', updatedBooking.id);

      if (error) throw error;

      await fetchBookings();
      toast({
        title: "Success",
        description: "Booking updated successfully",
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      });
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      await fetchBookings();
      toast({
        title: "Success",
        description: "Booking deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive",
      });
    }
  };

  const addPayment = async (bookingId: string, amount: number, date: string, type: string = 'rent', description?: string, paymentMode?: string) => {
    try {
      // Get booking details to include function date in description
      const { data: booking } = await supabase
        .from('bookings')
        .select('event_name, start_datetime')
        .eq('id', bookingId)
        .single();

      const functionDate = booking ? new Date(booking.start_datetime).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : '';

      const paymentDescription = description || `Payment for ${booking?.event_name || 'Event'} on ${functionDate}`;

      await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount: amount,
          payment_date: date,
          payment_type: type,
          description: paymentDescription,
          payment_mode: paymentMode
        });

      await fetchBookings();
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

  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    addBooking,
    updateBooking,
    deleteBooking,
    cancelBooking,
    processRefund,
    addPayment,
    refetch: fetchBookings
  };
};
