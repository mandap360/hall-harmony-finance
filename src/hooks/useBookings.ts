
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
  totalRent: number;
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
      
      // Fetch bookings from Supabase
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('start_datetime', { ascending: true });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        throw bookingsError;
      }

      console.log("Raw bookings data:", bookingsData);

      // Fetch balance payments for each booking
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('balance_payments')
        .select('*');

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        // Don't throw here, just log the error
      }

      console.log("Payments data:", paymentsData);

      // Transform the data to match the expected format
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
          totalRent: Number(booking.total_rent),
          advance: Number(booking.advance),
          notes: '',
          paidAmount: paidAmount,
          payments: bookingPayments.map(payment => ({
            id: payment.id,
            amount: Number(payment.amount),
            date: payment.payment_date,
            type: 'balance',
            description: 'Balance payment'
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
          total_rent: bookingData.totalRent,
          advance: bookingData.advance
        })
        .select()
        .single();

      if (error) throw error;

      await fetchBookings(); // Refresh the list
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
          total_rent: updatedBooking.totalRent,
          advance: updatedBooking.advance
        })
        .eq('id', updatedBooking.id);

      if (error) throw error;

      await fetchBookings(); // Refresh the list
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
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      await fetchBookings(); // Refresh the list
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

  return {
    bookings,
    loading,
    addBooking,
    updateBooking,
    deleteBooking,
    refetch: fetchBookings
  };
};
