import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Booking {
  id: string;
  eventName: string;
  clientName: string;
  phoneNumber?: string;
  startDate: string;
  endDate: string;
  rentFinalized: number;
  rentReceived: number;
  notes?: string;
  paidAmount: number;
  income: Payment[];
  createdAt: string;
  organization_id?: string;
  status?: string;
  refundedAmount?: number;
  secondaryIncomeNet?: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  type: string;
  description?: string;
  payment_mode?: string;
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchBookings = async () => {
    if (!profile?.organization_id) return;
    
    try {
      setLoading(true);
      
      // First fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('start_datetime', { ascending: true });

      if (bookingsError) throw bookingsError;

      // Then fetch payments for each booking
      const bookingIds = bookingsData?.map(booking => booking.id) || [];
      let paymentsData: any[] = [];
      let additionalIncomeData: any[] = [];
      
      if (bookingIds.length > 0) {
        const { data: payments, error: paymentsError } = await supabase
          .from('income')
          .select('*')
          .in('booking_id', bookingIds);
        
        if (paymentsError) {
          console.warn('Error fetching payments:', paymentsError);
        } else {
          paymentsData = payments || [];
        }

        // Fetch additional income for each booking
        const { data: additionalIncome, error: additionalIncomeError } = await supabase
          .from('secondary_income')
          .select('*')
          .in('booking_id', bookingIds);
        
        console.log('Additional income query result:', { additionalIncome, additionalIncomeError, bookingIds });
        
        if (additionalIncomeError) {
          console.warn('Error fetching additional income:', additionalIncomeError);
        } else {
          additionalIncomeData = additionalIncome || [];
        }
      }

      // Get income categories to identify "Advance" and "Refund" categories
      const { data: incomeCategories } = await supabase
        .from('income_categories')
        .select('id, name, parent_id')
        .in('name', ['Secondary Income', 'Advance', 'Refund']);

      const secondaryIncomeCategory = incomeCategories?.find(cat => cat.name === 'Secondary Income');
      const advanceCategory = incomeCategories?.find(cat => cat.name === 'Advance');
      const refundCategory = incomeCategories?.find(cat => cat.name === 'Refund');

      // Transform the data to match the expected format
      const transformedBookings: Booking[] = (bookingsData || []).map(booking => {
        const bookingPayments = paymentsData.filter(payment => payment.booking_id === booking.id);
        const bookingAdditionalIncome = additionalIncomeData.filter(income => income.booking_id === booking.id);
        
        // Filter refund payments (those with negative amounts or refund category)
        const refundPayments = bookingPayments.filter(payment => payment.amount < 0);
        const totalRefunded = Math.abs(refundPayments.reduce((total, payment) => total + payment.amount, 0));
        
        // Calculate net secondary income: Advance - Refund
        const advanceAmount = bookingPayments
          .filter(payment => payment.category_id === advanceCategory?.id)
          .reduce((total, payment) => total + payment.amount, 0);
          
        const refundAmount = bookingPayments
          .filter(payment => payment.category_id === refundCategory?.id)
          .reduce((total, payment) => total + Math.abs(payment.amount), 0);
        
        // Add amounts from secondary_income table
        const secondaryIncomeFromTable = bookingAdditionalIncome
          .reduce((total, income) => total + income.amount, 0);
        
        const secondaryIncomeNet = advanceAmount + secondaryIncomeFromTable - refundAmount;
        
        return {
          id: booking.id,
          eventName: booking.event_name,
          clientName: booking.client_name,
          phoneNumber: booking.phone_number,
          startDate: booking.start_datetime,
          endDate: booking.end_datetime,
          rentFinalized: booking.rent_finalized,
          rentReceived: booking.rent_received,
          notes: booking.notes,
          paidAmount: booking.rent_received,
          status: booking.status || 'confirmed',
          refundedAmount: totalRefunded,
          secondaryIncomeNet, // Net secondary income (Advance - Refund)
          income: bookingPayments.map((payment: any) => ({
            id: payment.id,
            amount: payment.amount,
            date: payment.payment_date,
            type: payment.category_id,
            description: payment.description,
            payment_mode: payment.payment_mode
          })),
          createdAt: booking.created_at,
          organization_id: booking.organization_id
        };
      });

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

  useEffect(() => {
    if (profile?.organization_id) {
      fetchBookings();
    }
  }, [profile?.organization_id]);

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'paidAmount' | 'income'>) => {
    if (!profile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          event_name: bookingData.eventName,
          client_name: bookingData.clientName,
          phone_number: bookingData.phoneNumber,
          start_datetime: bookingData.startDate,
          end_datetime: bookingData.endDate,
          rent_finalized: bookingData.rentFinalized,
          rent_received: 0,
          notes: bookingData.notes,
          organization_id: profile.organization_id,
          status: 'confirmed'
        })
        .select()
        .single();

      if (error) throw error;

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

  const updateBooking = async (id: string, bookingData: Partial<Booking>) => {
    if (!profile?.organization_id) return;

    try {
      const updateData: any = {};
      
      if (bookingData.eventName) updateData.event_name = bookingData.eventName;
      if (bookingData.clientName) updateData.client_name = bookingData.clientName;
      if (bookingData.phoneNumber !== undefined) updateData.phone_number = bookingData.phoneNumber;
      if (bookingData.startDate) updateData.start_datetime = bookingData.startDate;
      if (bookingData.endDate) updateData.end_datetime = bookingData.endDate;
      if (bookingData.rentFinalized !== undefined) updateData.rent_finalized = bookingData.rentFinalized;
      if (bookingData.notes !== undefined) updateData.notes = bookingData.notes;

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .eq('organization_id', profile.organization_id);

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

  const deleteBooking = async (id: string) => {
    if (!profile?.organization_id) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id)
        .eq('organization_id', profile.organization_id);

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

  const cancelBooking = async (id: string) => {
    if (!profile?.organization_id) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('organization_id', profile.organization_id);

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

  const processRefund = async (refundData: any) => {
    if (!profile?.organization_id) return;

    try {
      // Get "Refund - Cancellation" subcategory ID
      const { data: bookingCancellationCategory } = await supabase
        .from('income_categories')
        .select('id')
        .eq('name', 'Refund - Cancellation')
        .maybeSingle();

      // Add refund payment with negative amount
      const { data: paymentData, error: paymentError } = await supabase
        .from('income')
        .insert({
          booking_id: refundData.bookingId,
          amount: -Math.abs(refundData.amount), // Store as negative for refunds
          payment_date: refundData.date || new Date().toISOString().split('T')[0],
          category_id: bookingCancellationCategory?.id,
          description: refundData.description,
          payment_mode: refundData.paymentMode,
          organization_id: profile.organization_id
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Also create a transaction entry for the account
      if (refundData.paymentMode) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            account_id: refundData.paymentMode,
            transaction_type: 'debit',
            amount: refundData.amount,
            description: refundData.description,
            reference_type: 'refund',
            reference_id: paymentData.id,
            transaction_date: refundData.date || new Date().toISOString().split('T')[0]
          });

        if (transactionError) throw transactionError;
      }

      await fetchBookings();
      toast({
        title: "Success",
        description: "Refund processed successfully",
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: "Error",
        description: "Failed to process refund",
        variant: "destructive",
      });
    }
  };

  const addPayment = async (bookingId: string, amount: number, date: string, categoryId: string, description?: string, paymentMode?: string) => {
    if (!profile?.organization_id) return;

    try {
      // Add the payment record
      const { error: paymentError } = await supabase
        .from('income')
        .insert({
          booking_id: bookingId,
          amount: amount,
          payment_date: date,
          category_id: categoryId,
          description: description,
          payment_mode: paymentMode,
          organization_id: profile.organization_id
        });

      if (paymentError) throw paymentError;

      // Get current booking to calculate new rent_received amount
      const { data: currentBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('rent_received')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      // Get category name to check if it's a rent payment
      const { data: category } = await supabase
        .from('income_categories')
        .select('name')
        .eq('id', categoryId)
        .single();

      // Only update rent_received for rent-related categories
      if (category?.name === 'Rent') {
        const newRentReceived = (currentBooking.rent_received || 0) + amount;
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ rent_received: newRentReceived })
          .eq('id', bookingId);

        if (updateError) throw updateError;
      }


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

  return {
    bookings,
    loading,
    addBooking,
    updateBooking,
    deleteBooking,
    cancelBooking,
    processRefund,
    addPayment,
    refetch: fetchBookings,
  };
};