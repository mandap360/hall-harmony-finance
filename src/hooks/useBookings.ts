import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Booking {
  id: string;
  eventName: string;
  clientId: string | null;
  clientName: string;
  phoneNumber: string;
  email?: string;
  startDate: string;
  endDate: string;
  rentFinalized: number;
  rentReceived: number;
  notes?: string;
  status?: string;
  createdAt: string;
  organization_id?: string;
  /** Net rent receipt income from Transactions table */
  paidAmount: number;
  /** Net secondary income (Income - Refund tied to this booking) */
  secondaryIncomeNet: number;
  refundedAmount: number;
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchBookings = useCallback(async () => {
    if (!profile?.organization_id) return;

    try {
      setLoading(true);

      const [bookingsRes, txRes, secRes, clientsRes] = await Promise.all([
        supabase
          .from('Bookings')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('start_datetime', { ascending: true }),
        supabase
          .from('Transactions')
          .select('booking_id, type, amount')
          .eq('organization_id', profile.organization_id)
          .neq('transaction_status', 'Void'),
        supabase
          .from('SecondaryIncome')
          .select('booking_id, amount')
          .eq('organization_id', profile.organization_id),
        supabase
          .from('Clients')
          .select('client_id, name, phone_number, email')
          .eq('organization_id', profile.organization_id),
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (txRes.error) throw txRes.error;
      if (secRes.error) throw secRes.error;
      if (clientsRes.error) throw clientsRes.error;

      const txs = txRes.data || [];
      const secs = secRes.data || [];
      const clientMap = new Map(
        (clientsRes.data || []).map((c) => [c.client_id, c]),
      );

      const transformed: Booking[] = (bookingsRes.data || []).map((b) => {
        const bookingTxs = txs.filter((t) => t.booking_id === b.id);
        const incomeTxs = bookingTxs.filter((t) => t.type === 'Income');
        const refundTxs = bookingTxs.filter((t) => t.type === 'Refund');
        const refundedAmount = refundTxs.reduce((s, t) => s + Number(t.amount), 0);
        const paidAmount = incomeTxs.reduce((s, t) => s + Number(t.amount), 0);

        const secAmt = secs
          .filter((s) => s.booking_id === b.id)
          .reduce((sum, s) => sum + Number(s.amount), 0);

        const client = b.client_id ? clientMap.get(b.client_id) : null;

        return {
          id: b.id,
          eventName: b.event_name,
          clientId: b.client_id,
          clientName: client?.name || '',
          phoneNumber: client?.phone_number || '',
          email: client?.email || '',
          startDate: b.start_datetime,
          endDate: b.end_datetime,
          rentFinalized: Number(b.rent_finalized),
          rentReceived: Number(b.rent_received) || paidAmount,
          notes: b.notes || '',
          status: b.status || 'confirmed',
          createdAt: b.created_at || '',
          organization_id: b.organization_id || undefined,
          paidAmount,
          secondaryIncomeNet: secAmt - refundedAmount,
          refundedAmount,
        };
      });

      setBookings(transformed);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({ title: 'Error', description: 'Failed to fetch bookings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [profile?.organization_id, toast]);

  const addBooking = async (data: {
    eventName: string;
    clientId: string;
    startDate: string;
    endDate: string;
    rentFinalized: number;
    notes?: string;
  }) => {
    if (!profile?.organization_id) return;
    try {
      const { error } = await supabase.from('Bookings').insert([
        {
          event_name: data.eventName,
          client_id: data.clientId,
          start_datetime: data.startDate,
          end_datetime: data.endDate,
          rent_finalized: data.rentFinalized,
          rent_received: 0,
          notes: data.notes || null,
          status: 'confirmed',
          organization_id: profile.organization_id,
        },
      ]);
      if (error) throw error;
      await fetchBookings();
      toast({ title: 'Success', description: 'Booking added successfully' });
    } catch (error) {
      console.error('Error adding booking:', error);
      toast({ title: 'Error', description: 'Failed to add booking', variant: 'destructive' });
    }
  };

  const updateBooking = async (
    id: string,
    data: Partial<{
      eventName: string;
      clientId: string;
      startDate: string;
      endDate: string;
      rentFinalized: number;
      notes: string;
    }>,
  ) => {
    if (!profile?.organization_id) return;
    try {
      const updateData: Record<string, unknown> = {};
      if (data.eventName !== undefined) updateData.event_name = data.eventName;
      if (data.clientId !== undefined) updateData.client_id = data.clientId;
      if (data.startDate !== undefined) updateData.start_datetime = data.startDate;
      if (data.endDate !== undefined) updateData.end_datetime = data.endDate;
      if (data.rentFinalized !== undefined) updateData.rent_finalized = data.rentFinalized;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const { error } = await supabase
        .from('Bookings')
        .update(updateData)
        .eq('id', id)
        .eq('organization_id', profile.organization_id);

      if (error) throw error;
      await fetchBookings();
      toast({ title: 'Success', description: 'Booking updated' });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({ title: 'Error', description: 'Failed to update booking', variant: 'destructive' });
    }
  };

  const cancelBooking = async (id: string) => {
    if (!profile?.organization_id) return;
    try {
      const { error } = await supabase
        .from('Bookings')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('organization_id', profile.organization_id);
      if (error) throw error;
      await fetchBookings();
      toast({ title: 'Success', description: 'Booking cancelled' });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({ title: 'Error', description: 'Failed to cancel booking', variant: 'destructive' });
    }
  };

  const deleteBooking = async (id: string) => {
    if (!profile?.organization_id) return;
    try {
      const { error } = await supabase
        .from('Bookings')
        .delete()
        .eq('id', id)
        .eq('organization_id', profile.organization_id);
      if (error) throw error;
      await fetchBookings();
      toast({ title: 'Success', description: 'Booking deleted' });
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({ title: 'Error', description: 'Failed to delete booking', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (profile?.organization_id) fetchBookings();
  }, [profile?.organization_id, fetchBookings]);

  return {
    bookings,
    loading,
    addBooking,
    updateBooking,
    cancelBooking,
    deleteBooking,
    refetch: fetchBookings,
  };
};
