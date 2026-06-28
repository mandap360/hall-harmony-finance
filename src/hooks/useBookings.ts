import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createSharedStore, createSingleFlight } from '@/hooks/useSharedState';
import {
  findOverlappingBooking,
  formatOverlapMessage,
  doBookingRangesOverlap,
  type BookingTimeRange,
} from '@/utils/bookingOverlap';
import { compareBookingDateTime, normalizeBookingDateTime } from '@/utils/bookingDateTime';
import {
  showErrorToast,
  showSuccessToast,
  toastAddError,
  toastDeleteError,
  toastFetchError,
  toastUpdateError,
  toastAdded,
  toastDeleted,
  toastUpdated,
} from '@/utils/toastHelpers';
import { CRUD_MESSAGES, ENTITY_NAMES, VALIDATION_MESSAGES } from '@/utils/messages';

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
  /** Sum of allocations to "Rent" category for this booking */
  paidAmount: number;
  /** Sum of allocations to "Secondary Deposit" minus secondary refunds */
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
let addBookingInFlight = false;

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
      .select('transaction_id, amount, category_id, AccountCategories(name, is_secondary_income)')
      .eq('organization_id', orgId);
    if (allocRes.error) throw allocRes.error;
    const allocs = allocRes.data || [];

    const transformed: Booking[] = (bookingsRes.data || []).map((b) => {
      const bookingTxs = txs.filter((t) => t.booking_id === b.id);
      const bookingTxIds = new Set(bookingTxs.map((t) => t.id));
      const refundTxs = bookingTxs.filter((t) => t.type === 'Refund');

      // Rent received = sum of allocations to "Rent" category for this booking's transactions
      const rentReceived = allocs
        .filter((a) => a.AccountCategories?.name === 'Rent' && bookingTxIds.has(a.transaction_id))
        .reduce((s, a) => s + Number(a.amount), 0);

      // Secondary pool received = sum of allocations to "Secondary Deposit" anchor category
      const secondaryReceived = allocs
        .filter((a) => a.AccountCategories?.name === 'Secondary Deposit' && bookingTxIds.has(a.transaction_id))
        .reduce((s, a) => s + Number(a.amount), 0);

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
      startDate: normalizeBookingDateTime(b.start_datetime),
      endDate: normalizeBookingDateTime(b.end_datetime),
      rentFinalized: Number(b.rent_finalized),
      rentReceived: paidAmount,
      notes: b.notes || '',
      status: b.status || 'confirmed',
      createdAt: b.created_at || '',
      organization_id: b.organization_id || undefined,
      paidAmount,
      secondaryIncomeNet: secondaryReceived - secondaryRefunds,
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
    if (!orgId) {
      store.set({ bookings: [], loading: false, orgId: null });
      return;
    }
    if (state.orgId === orgId && state.bookings.length > 0) return;
    singleFlight(() => fetchAll(orgId)).catch((err) => {
      console.error('Error fetching bookings:', err);
      store.set({ bookings: [], loading: false, orgId });
      toastFetchError(toast, ENTITY_NAMES.bookings);
    });
  }, [profile?.organization_id, state.orgId, state.bookings.length, toast]);

  const refetch = async () => {
    if (!profile?.organization_id) return;
    await fetchAll(profile.organization_id);
  };

  const fetchOverlappingFromDb = async (
    startDate: string,
    endDate: string,
    excludeId?: string,
  ): Promise<BookingTimeRange | null> => {
    if (!profile?.organization_id) return null;

    let query = supabase
      .from('Bookings')
      .select('id, event_name, start_datetime, end_datetime, status')
      .eq('organization_id', profile.organization_id)
      .neq('status', 'cancelled')
      .lt('start_datetime', endDate)
      .gt('end_datetime', startDate);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.limit(1).maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const conflict: BookingTimeRange = {
      id: data.id,
      eventName: data.event_name,
      startDate: normalizeBookingDateTime(data.start_datetime),
      endDate: normalizeBookingDateTime(data.end_datetime),
      status: data.status || undefined,
    };

    // Re-check with wall-clock compare (DB timestamptz can disagree with naive inputs).
    if (!doBookingRangesOverlap(startDate, endDate, conflict.startDate, conflict.endDate)) {
      return null;
    }

    return conflict;
  };

  const checkBookingOverlap = async (
    startDate: string,
    endDate: string,
    excludeId?: string,
  ): Promise<BookingTimeRange | null> => {
    const localConflict = findOverlappingBooking(state.bookings, startDate, endDate, excludeId);
    if (localConflict) return localConflict;

    return fetchOverlappingFromDb(startDate, endDate, excludeId);
  };

  const addBooking = async (data: {
    eventName: string;
    clientId: string;
    startDate: string;
    endDate: string;
    rentFinalized: number;
    notes?: string;
  }): Promise<boolean> => {
    if (!profile?.organization_id) return false;
    if (addBookingInFlight) return false;

    addBookingInFlight = true;
    try {
      if (compareBookingDateTime(data.startDate, data.endDate) >= 0) {
        showErrorToast(
          toast,
          VALIDATION_MESSAGES.timeRangeInvalid.description,
          VALIDATION_MESSAGES.timeRangeInvalid.title,
        );
        return false;
      }

      const conflict = await checkBookingOverlap(data.startDate, data.endDate);
      if (conflict) {
        const conflictMsg = VALIDATION_MESSAGES.bookingConflict(formatOverlapMessage(conflict));
        showErrorToast(toast, conflictMsg.description, conflictMsg.title);
        return false;
      }

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
      toastAdded(toast, 'Booking');
      return true;
    } catch (error) {
      console.error('Error adding booking:', error);
      toastAddError(toast, ENTITY_NAMES.booking);
      return false;
    } finally {
      addBookingInFlight = false;
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
  ): Promise<boolean> => {
    if (!profile?.organization_id) return false;
    try {
      const existing = state.bookings.find((b) => b.id === id);
      const nextStart = data.startDate ?? existing?.startDate;
      const nextEnd = data.endDate ?? existing?.endDate;

      if (nextStart && nextEnd) {
        if (compareBookingDateTime(nextStart, nextEnd) >= 0) {
          showErrorToast(
            toast,
            VALIDATION_MESSAGES.timeRangeInvalid.description,
            VALIDATION_MESSAGES.timeRangeInvalid.title,
          );
          return false;
        }

        const conflict = await checkBookingOverlap(nextStart, nextEnd, id);
        if (conflict) {
          const conflictMsg = VALIDATION_MESSAGES.bookingConflictOnUpdate(formatOverlapMessage(conflict));
          showErrorToast(toast, conflictMsg.description, conflictMsg.title);
          return false;
        }
      }

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
      toastUpdated(toast, 'Booking');
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      toastUpdateError(toast, ENTITY_NAMES.booking);
      return false;
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
      showSuccessToast(toast, CRUD_MESSAGES.cancelled('Booking'));
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toastUpdateError(toast, ENTITY_NAMES.booking);
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
      toastDeleted(toast, 'Booking');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toastDeleteError(toast, ENTITY_NAMES.booking);
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
