
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Booking {
  id: string;
  eventName: string;
  clientName: string;
  phoneNumber: string;
  startDate: string;
  endDate: string;
  rent: number; // Changed from totalRent to rent
  advance: number;
  notes?: string;
  totalPaid: number; // Total amount actually received
  remainingBalance: number;
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
  const { profile } = useAuth();

  const fetchBookings = async () => {
    if (!profile?.organization_id) return;
    
    try {
      setLoading(true);
      console.log("Fetching bookings from Supabase...");
      
      // Get current Indian Financial Year
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      
      let fyStartDate, fyEndDate;
      if (month >= 3) { // April onwards
        fyStartDate = new Date(year, 3, 1); // April 1st
        fyEndDate = new Date(year + 1, 2, 31); // March 31st next year
      } else { // January to March
        fyStartDate = new Date(year - 1, 3, 1); // April 1st previous year
        fyEndDate = new Date(year, 2, 31); // March 31st
      }

      // Fetch bookings from current FY
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .gte('start_datetime', fyStartDate.toISOString())
        .lte('start_datetime', fyEndDate.toISOString())
        .order('start_datetime', { ascending: true });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        throw bookingsError;
      }

      // Fetch all payments for these bookings
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('balance_payments')
        .select('*')
        .eq('organization_id', profile.organization_id);

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
      }

      // Transform the data
      const transformedBookings: Booking[] = (bookingsData || []).map(booking => {
        const bookingPayments = (paymentsData || []).filter(payment => payment.booking_id === booking.id);
        const totalPaid = booking.advance + bookingPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        const remainingBalance = booking.total_rent - totalPaid;

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
          totalPaid: totalPaid,
          remainingBalance: remainingBalance,
          payments: [
            {
              id: 'advance',
              amount: Number(booking.advance),
              date: booking.created_at,
              type: 'advance',
              description: 'Advance payment'
            },
            ...bookingPayments.map(payment => ({
              id: payment.id,
              amount: Number(payment.amount),
              date: payment.payment_date,
              type: payment.payment_type || 'balance',
              description: 'Balance payment'
            }))
          ]
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
    fetchBookings();
  }, [profile?.organization_id]);

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'payments' | 'totalPaid' | 'remainingBalance'>) => {
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
          total_rent: bookingData.rent,
          advance: bookingData.advance,
          organization_id: profile.organization_id
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

  const addPayment = async (bookingId: string, amount: number) => {
    if (!profile?.organization_id) return;
    
    try {
      const { error } = await supabase
        .from('balance_payments')
        .insert({
          booking_id: bookingId,
          amount: amount,
          payment_date: new Date().toISOString().split('T')[0],
          payment_type: 'balance',
          organization_id: profile.organization_id
        });

      if (error) throw error;

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

  const updateBooking = async (updatedBooking: Booking) => {
    if (!profile?.organization_id) return;
    
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
    if (!profile?.organization_id) return;
    
    try {
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
