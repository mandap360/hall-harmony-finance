
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
      
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          payments (
            id,
            amount,
            payment_date,
            payment_type,
            description
          )
        `)
        .eq('organization_id', profile.organization_id)
        .order('start_datetime', { ascending: true });

      if (bookingsError) throw bookingsError;

      // Transform the data to match the expected format
      const transformedBookings: Booking[] = (bookingsData || []).map(booking => ({
        id: booking.id,
        eventName: booking.event_name,
        clientName: booking.client_name,
        phoneNumber: booking.phone_number,
        startDate: booking.start_datetime,
        endDate: booking.end_datetime,
        rent: booking.rent_finalized,
        advance: 0, // Will be calculated from payments
        notes: booking.notes,
        paidAmount: booking.rent_received,
        payments: (booking.payments || []).map((payment: any) => ({
          id: payment.id,
          amount: payment.amount,
          date: payment.payment_date,
          type: payment.payment_type,
          description: payment.description
        })),
        createdAt: booking.created_at,
        organization_id: booking.organization_id
      }));

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

  return {
    bookings,
    loading,
    addBooking,
    updateBooking,
    deleteBooking,
    refetch: fetchBookings,
  };
};
