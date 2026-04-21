import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createSharedStore, createSingleFlight } from '@/hooks/useSharedState';

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
  /** Net rent receipt income from Transactions (excludes [SEC] tagged) */
  paidAmount: number;
  /** Net secondary income (Income tagged [SEC] - Refund tagged [SEC-REFUND]) */
  secondaryIncomeNet: number;
  refundedAmount: number;
}

interface State {
  bookings: Booking[];
  loading: boolean;
  orgId: string | null;
}

const store = createSharedStore<State>({ bookings: [], loading: false, orgId: null });
const singleFlight = createSingleFlight<void>();

const isSecIncome = (t: { description: string | null }) =>
  (t.description || '').startsWith('[SEC] ');
const isSecRefund = (t: { description: string | null }) =>
  (t.description || '').includes('[SEC-REFUND]');

const fetchAll = async (orgId: string) => {
  store.set((s) => ({ ...s, loading: true }));
  const [bookingsRes, txRes, clientsRes] = await Promise.all([
    supabase
      .from('Bookings')
      .select('*')
      .eq('organization_id', orgId)
      .order('start_datetime', { ascending: true }),
    supabase
      .from('Transactions')
      .select('id, booking_id, type, amount, description')
      .eq('organization_id', orgId)
      .neq('transaction_status', 'Void'),
    supabase
      .from('Clients')
      .select('client_id, name, phone_number, email')
      .eq('organization_id', orgId),
  ]);

  if (bookingsRes.error) throw bookingsRes.error;
  if (txRes.error) throw txRes.error;
  if (clientsRes.error) throw clientsRes.error;

  const txs = txRes.data || [];
  const clientMap = new Map((clientsRes.data || []).map((c) => [c.client_id, c]));

    const allocRes = await supabase
      .from('IncomeAllocations')
      .select('transaction_id, amount, category_id, AccountCategories(name)')
      .eq('organization_id', orgId);
    if (allocRes.error) throw allocRes.error;
    const allocs = allocRes.data || [];

    const transformed: Booking[] = (bookingsRes.data || []).map((b) => {
      const bookingTxs = txs.filter((t) => t.booking_id === b.id);
      const incomeTxs = bookingTxs.filter((t) => t.type === 'Income');
      const refundTxs = bookingTxs.filter((t) => t.type === 'Refund');

      const rentReceived = allocs
        .filter((a) => a.AccountCategories?.name === 'Rent' && bookingTxs.some((t) => t.id === a.transaction_id))
        .reduce((s, a) => s + Number(a.amount), 0);

      const secondaryIncome = incomeTxs
        .filter((t) => isSecIncome(t))
        .reduce((s, t) => s + Number(t.amount), 0);

      const primaryRefunds = refundTxs
        .filter((t) => !isSecRefund(t))
        .reduce((s, t) => s + Number(t.amount), 0);
      const secondaryRefunds = refundTxs
        .filter((t) => isSecRefund(t))
        .reduce((s, t) => s + Number(t.amount), 0);

      const paidAmount = rentReceived;
      const refundedAmount = primaryRefunds + secondaryRefunds;
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
      rentReceived: paidAmount,
      notes: b.notes || '',
      status: b.status || 'confirmed',
      createdAt: b.created_at || '',
      organization_id: b.organization_id || undefined,
      paidAmount,
      secondaryIncomeNet: secondaryIncome - secondaryRefunds,
      refundedAmount,
    };
  });

  store.set({ bookings: transformed, loading: false, orgId });
};

export const useBookings = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const state = store.useStore();

  useEffect(() => {
    const orgId = profile?.organization_id;
    if (!orgId) return;
    if (state.orgId === orgId && state.bookings.length > 0) return;
    singleFlight(() => fetchAll(orgId)).catch((err) => {
      console.error('Error fetching bookings:', err);
      toast({ title: 'Error', description: 'Failed to fetch bookings', variant: 'destructive' });
    });
  }, [profile?.organization_id, state.orgId, state.bookings.length, toast]);

  const refetch = async () => {
    if (!profile?.organization_id) return;
    await fetchAll(profile.organization_id);
  };

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
      await refetch();
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
      await refetch();
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
      await refetch();
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
      await refetch();
      toast({ title: 'Success', description: 'Booking deleted' });
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({ title: 'Error', description: 'Failed to delete booking', variant: 'destructive' });
    }
  };

  return {
    bookings: state.bookings,
    loading: state.loading,
    addBooking,
    updateBooking,
    cancelBooking,
    deleteBooking,
    refetch,
  };
};
