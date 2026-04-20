import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface IncomeAllocation {
  id: string;
  transaction_id: string;
  category_id: string | null;
  amount: number;
  organization_id: string;
  created_at: string;
}

const recomputeStatus = async (transactionId: string) => {
  const { data: tx } = await supabase
    .from('Transactions')
    .select('amount, booking_id')
    .eq('id', transactionId)
    .maybeSingle();
  if (!tx) return;

  const { data: allocs } = await supabase
    .from('IncomeAllocations')
    .select('amount')
    .eq('transaction_id', transactionId);

  // Find any refund tied to this receipt (description tag)
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

  await supabase
    .from('Transactions')
    .update({ transaction_status: status })
    .eq('id', transactionId);
};

export const useIncomeAllocations = () => {
  const [allocations, setAllocations] = useState<IncomeAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetch = useCallback(async () => {
    if (!profile?.organization_id) return;
    try {
      const { data, error } = await supabase
        .from('IncomeAllocations')
        .select('*')
        .eq('organization_id', profile.organization_id);
      if (error) throw error;
      setAllocations((data || []) as IncomeAllocation[]);
    } catch (error) {
      console.error('Error fetching income allocations:', error);
    } finally {
      setLoading(false);
    }
  }, [profile?.organization_id]);

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
      await fetch();
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
      await fetch();
      toast({ title: 'Allocation removed' });
    } catch (error) {
      console.error('Error removing allocation:', error);
      toast({ title: 'Error', description: 'Failed to remove allocation', variant: 'destructive' });
      throw error;
    }
  };

  const getAllocationsForTransaction = useCallback(
    (transactionId: string) => allocations.filter((a) => a.transaction_id === transactionId),
    [allocations],
  );

  useEffect(() => {
    if (profile?.organization_id) fetch();
  }, [profile?.organization_id, fetch]);

  return {
    allocations,
    loading,
    allocate,
    removeAllocation,
    getAllocationsForTransaction,
    refetch: fetch,
  };
};
