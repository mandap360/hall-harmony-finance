
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
  rent: number;
  advance: number;
  notes?: string;
  paidAmount: number;
  payments: Payment[];
  createdAt: string;
  organization_id?: string;
  status?: string;
  additionalIncomeTotal?: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  type: string;
  description?: string;
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
          .from('payments')
          .select('*')
          .in('booking_id', bookingIds);
        
        if (paymentsError) {
          console.warn('Error fetching payments:', paymentsError);
        } else {
          paymentsData = payments || [];
        }

        // Fetch additional income for each booking
        const { data: additionalIncome, error: additionalIncomeError } = await supabase
          .from('additional_income')
          .select('*')
          .in('booking_id', bookingIds);
        
        console.log('Additional income query result:', { additionalIncome, additionalIncomeError, bookingIds });
        
        if (additionalIncomeError) {
          console.warn('Error fetching additional income:', additionalIncomeError);
        } else {
          additionalIncomeData = additionalIncome || [];
        }
      }

      // Transform the data to match the expected format
      const transformedBookings: Booking[] = (bookingsData || []).map(booking => {
        const bookingPayments = paymentsData.filter(payment => payment.booking_id === booking.id);
        const bookingAdditionalIncome = additionalIncomeData.filter(income => income.booking_id === booking.id);
        
        // Calculate total additional income for this booking
        const additionalIncomeTotal = bookingAdditionalIncome.reduce((total, income) => total + (income.amount || 0), 0);
        console.log(`Booking ${booking.id}: additionalIncome items:`, bookingAdditionalIncome, 'total:', additionalIncomeTotal);
        
        return {
          id: booking.id,
          eventName: booking.event_name,
          clientName: booking.client_name,
          phoneNumber: booking.phone_number,
          startDate: booking.start_datetime,
          endDate: booking.end_datetime,
          rent: booking.rent_finalized,
          advance: booking.rent_received,
          notes: booking.notes,
          paidAmount: booking.rent_received,
          status: booking.status || 'confirmed',
          additionalIncomeTotal,
          payments: bookingPayments.map((payment: any) => ({
            id: payment.id,
            amount: payment.amount,
            date: payment.payment_date,
            type: payment.payment_type,
            description: payment.description
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

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'paidAmount' | 'payments'>) => {
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
          rent_finalized: bookingData.rent,
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
      if (bookingData.rent !== undefined) updateData.rent_finalized = bookingData.rent;
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
      // Add refund as a negative payment
      const { error } = await supabase
        .from('payments')
        .insert({
          booking_id: refundData.bookingId,
          amount: -Math.abs(refundData.amount),
          payment_date: refundData.date,
          payment_type: 'refund',
          description: refundData.description,
          payment_mode: refundData.paymentMode,
          organization_id: profile.organization_id
        });

      if (error) throw error;

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

  const addPayment = async (bookingId: string, amount: number, date: string, type: string, description?: string, paymentMode?: string) => {
    if (!profile?.organization_id) return;

    try {
      // Add the payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount: amount,
          payment_date: date,
          payment_type: type,
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

      // Only update rent_received when payment type is 'rent'
      if (type === 'rent') {
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
