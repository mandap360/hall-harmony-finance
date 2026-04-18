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

      // Update transaction status based on allocations
      const txAllocs = allocations.filter((a) => a.transaction_id === data.transaction_id);
      const totalAlloc = txAllocs.reduce((s, a) => s + Number(a.amount), 0) + data.amount;

      const { data: tx } = await supabase
        .from('Transactions')
        .select('amount')
        .eq('id', data.transaction_id)
        .maybeSingle();

      if (tx) {
        const txAmount = Number(tx.amount);
        let status: 'Available' | 'Partially Allocated' | 'Fully Allocated' = 'Available';
        if (totalAlloc >= txAmount) status = 'Fully Allocated';
        else if (totalAlloc > 0) status = 'Partially Allocated';
        await supabase.from('Transactions').update({ transaction_status: status }).eq('id', data.transaction_id);
      }

      await fetch();
      toast({ title: 'Success', description: 'Income allocated' });
    } catch (error) {
      console.error('Error allocating income:', error);
      toast({ title: 'Error', description: 'Failed to allocate', variant: 'destructive' });
      throw error;
    }
  };

  useEffect(() => {
    if (profile?.organization_id) fetch();
  }, [profile?.organization_id, fetch]);

  return { allocations, loading, allocate, refetch: fetch };
};
