import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createSharedStore, createSingleFlight } from '@/hooks/useSharedState';

export interface IncomeAllocation {
  id: string;
  transaction_id: string;
  category_id: string | null;
  amount: number;
  organization_id: string;
  created_at: string;
}

interface State {
  allocations: IncomeAllocation[];
  loading: boolean;
  orgId: string | null;
}

const store = createSharedStore<State>({ allocations: [], loading: true, orgId: null });
const singleFlight = createSingleFlight<void>();

const fetchAll = async (orgId: string) => {
  const { data, error } = await supabase
    .from('IncomeAllocations')
    .select('*')
    .eq('organization_id', orgId);
  if (error) throw error;
  store.set({ allocations: (data || []) as IncomeAllocation[], loading: false, orgId });
};

const recomputeStatus = async (transactionId: string) => {
  const { data: tx } = await supabase
    .from('Transactions')
    .select('amount')
    .eq('id', transactionId)
    .maybeSingle();
  if (!tx) return;

  const { data: allocs } = await supabase
    .from('IncomeAllocations')
    .select('amount')
    .eq('transaction_id', transactionId);

  const { data: refunds } = await supabase
    .from('Transactions')
    .select('amount')
    .eq('type', 'Refund')
    .like('description', `%[SEC-REFUND] for receipt ${transactionId}%`);

  const allocSum = (allocs || []).reduce((s, a) => s + Number(a.amount), 0);
  const refundSum = (refunds || []).reduce((s, r) => s + Number(r.amount), 0);
  const total = allocSum + refundSum;
  const txAmount = Number(tx.amount);

  let status: 'Available' | 'Partially Allocated' | 'Fully Allocated' = 'Available';
  if (total >= txAmount && txAmount > 0) status = 'Fully Allocated';
  else if (total > 0) status = 'Partially Allocated';

  await supabase.from('Transactions').update({ transaction_status: status }).eq('id', transactionId);
};

export const useIncomeAllocations = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const state = store.useStore();

  useEffect(() => {
    const orgId = profile?.organization_id;
    if (!orgId) return;
    if (state.orgId === orgId) return;
    singleFlight(() => fetchAll(orgId)).catch((err) =>
      console.error('Error fetching income allocations:', err),
    );
  }, [profile?.organization_id, state.orgId]);

  const refetch = async () => {
    if (!profile?.organization_id) return;
    await fetchAll(profile.organization_id);
  };

  const allocate = async (data: {
    transaction_id: string;
    category_id: string;
    amount: number;
  }) => {
    if (!profile?.organization_id) throw new Error('No organization');
    try {
      const { error } = await supabase.from('IncomeAllocations').insert([
        {
          transaction_id: data.transaction_id,
          category_id: data.category_id,
          amount: data.amount,
          organization_id: profile.organization_id,
        },
      ]);
      if (error) throw error;
      await recomputeStatus(data.transaction_id);
      await refetch();
      toast({ title: 'Success', description: 'Income allocated' });
    } catch (error) {
      console.error('Error allocating income:', error);
      toast({ title: 'Error', description: 'Failed to allocate', variant: 'destructive' });
      throw error;
    }
  };

  const removeAllocation = async (id: string, transactionId: string) => {
    try {
      const { error } = await supabase.from('IncomeAllocations').delete().eq('id', id);
      if (error) throw error;
      await recomputeStatus(transactionId);
      await refetch();
      toast({ title: 'Allocation removed' });
    } catch (error) {
      console.error('Error removing allocation:', error);
      toast({ title: 'Error', description: 'Failed to remove allocation', variant: 'destructive' });
      throw error;
    }
  };

  const getAllocationsForTransaction = useCallback(
    (transactionId: string) => state.allocations.filter((a) => a.transaction_id === transactionId),
    [state.allocations],
  );

  return {
    allocations: state.allocations,
    loading: state.loading,
    allocate,
    removeAllocation,
    getAllocationsForTransaction,
    refetch,
  };
};
