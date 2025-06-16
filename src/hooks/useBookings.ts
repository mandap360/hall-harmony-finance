
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
  payments: Array<{
    id: string;
    amount: number;
    date: string;
    type: string;
    description: string;
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
        .order('start_datetime', { ascending: true });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        throw bookingsError;
      }

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*');

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
      }

      console.log("Bookings data:", bookingsData);
      console.log("Payments data:", paymentsData);

      const transformedBookings: Booking[] = (bookingsData || []).map(booking => {
        const bookingPayments = (paymentsData || []).filter(payment => payment.booking_id === booking.id);
        const paidAmount = bookingPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

        return {
          id: booking.id,
          eventName: booking.event_name,
          clientName: booking.client_name,
          phoneNumber: booking.phone_number || '',
          startDate: booking.start_datetime,
          endDate: booking.end_datetime,
          rent: Number(booking.total_rent),
          advance: Number(booking.advance),
          notes: '',
          paidAmount: paidAmount,
          payments: bookingPayments.map(payment => ({
            id: payment.id,
            amount: Number(payment.amount),
            date: payment.payment_date,
            type: payment.payment_type || 'rent',
            description: payment.description || ''
          }))
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

  useEffect(() => {
    fetchBookings();
  }, []);

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'payments' | 'paidAmount'>) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          event_name: bookingData.eventName,
          client_name: bookingData.clientName,
          phone_number: bookingData.phoneNumber,
          start_datetime: bookingData.startDate,
          end_datetime: bookingData.endDate,
          total_rent: bookingData.rent,
          advance: bookingData.advance
        })
        .select()
        .single();

      if (error) throw error;

      // Add the advance payment if greater than 0
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
          total_rent: updatedBooking.rent,
          advance: updatedBooking.advance
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
      // Delete payments first
      await supabase
        .from('payments')
        .delete()
        .eq('booking_id', bookingId);

      const { error } = await supabase
        .from('bookings')
        .delete()
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

  const addPayment = async (bookingId: string, amount: number, date: string, description?: string) => {
    try {
      await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount: amount,
          payment_date: date,
          payment_type: 'rent',
          description: description
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

  return {
    bookings,
    loading,
    addBooking,
    updateBooking,
    deleteBooking,
    addPayment,
    refetch: fetchBookings
  };
};
