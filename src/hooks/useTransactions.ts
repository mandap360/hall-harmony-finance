import { useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createSharedStore, createSingleFlight } from '@/hooks/useSharedState';

export type TransactionType = 'Income' | 'Expense' | 'Refund' | 'Advance Paid' | 'Transfer';
export type TransactionStatus = 'Available' | 'Partially Allocated' | 'Fully Allocated' | 'Void';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  from_account_id: string | null;
  to_account_id: string | null;
  booking_id: string | null;
  entity_id: string | null;
  transaction_date: string;
  description: string | null;
  transaction_status: TransactionStatus;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionInsert {
  type: TransactionType;
  amount: number;
  from_account_id?: string | null;
  to_account_id?: string | null;
  booking_id?: string | null;
  entity_id?: string | null;
  transaction_date: string;
  description?: string | null;
  transaction_status?: TransactionStatus;
}

interface State {
  transactions: Transaction[];
  loading: boolean;
  orgId: string | null;
}

const store = createSharedStore<State>({ transactions: [], loading: true, orgId: null });
const singleFlight = createSingleFlight<void>();

const fetchAll = async (orgId: string) => {
  const { data, error } = await supabase
    .from('Transactions')
    .select('*')
    .eq('organization_id', orgId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  store.set({ transactions: (data || []) as Transaction[], loading: false, orgId });
};

export const useTransactions = (accountId?: string) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const state = store.useStore();

  useEffect(() => {
    const orgId = profile?.organization_id;
    if (!orgId) return;
    if (state.orgId === orgId && state.transactions.length > 0) return;
    singleFlight(() => fetchAll(orgId)).catch((err) => {
      console.error('Error fetching transactions:', err);
      toast({ title: 'Error', description: 'Failed to fetch transactions', variant: 'destructive' });
    });
  }, [profile?.organization_id, state.orgId, state.transactions.length, toast]);

  const refreshTransactions = async () => {
    if (!profile?.organization_id) return;
    await fetchAll(profile.organization_id);
  };

  const addTransaction = async (data: TransactionInsert) => {
    if (!profile?.organization_id) throw new Error('No organization');
    try {
      const { data: inserted, error } = await supabase
        .from('Transactions')
        .insert([
          {
            type: data.type,
            amount: data.amount,
            from_account_id: data.from_account_id || null,
            to_account_id: data.to_account_id || null,
            booking_id: data.booking_id || null,
            entity_id: data.entity_id || null,
            transaction_date: data.transaction_date,
            description: data.description || null,
            transaction_status: data.transaction_status || 'Available',
            organization_id: profile.organization_id,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      await refreshTransactions();
      toast({ title: 'Success', description: 'Transaction added successfully' });
      return inserted as Transaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({ title: 'Error', description: 'Failed to add transaction', variant: 'destructive' });
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase.from('Transactions').delete().eq('id', id);
      if (error) throw error;
      await refreshTransactions();
      toast({ title: 'Success', description: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({ title: 'Error', description: 'Failed to delete transaction', variant: 'destructive' });
      throw error;
    }
  };

  // If accountId passed, scope the result locally (no extra fetch).
  const filtered = useMemo(() => {
    if (!accountId) return state.transactions;
    return state.transactions.filter(
      (t) => t.from_account_id === accountId || t.to_account_id === accountId || t.entity_id === accountId,
    );
  }, [state.transactions, accountId]);

  return {
    transactions: filtered,
    loading: state.loading,
    addTransaction,
    deleteTransaction,
    refreshTransactions,
  };
};
