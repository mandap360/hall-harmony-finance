import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createSharedStore, createSingleFlight } from '@/hooks/useSharedState';

export type BillStatus = 'unpaid' | 'partial' | 'paid';

export interface Bill {
  id: string;
  vendor_id: string;
  bill_number: string | null;
  category_id: string | null;
  date: string;
  amount: number;
  status: BillStatus;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface BillAllocation {
  id: string;
  transaction_id: string;
  bill_id: string;
  amount_applied: number;
  applied_at: string;
  organization_id: string;
}

interface State {
  bills: Bill[];
  allocations: BillAllocation[];
  loading: boolean;
  orgId: string | null;
}

const store = createSharedStore<State>({ bills: [], allocations: [], loading: true, orgId: null });
const singleFlight = createSingleFlight<void>();

const fetchAll = async (orgId: string) => {
  const [billRes, allocRes] = await Promise.all([
    supabase
      .from('Bills')
      .select('*')
      .eq('organization_id', orgId)
      .order('date', { ascending: false }),
    supabase.from('BillAllocations').select('*').eq('organization_id', orgId),
  ]);
  if (billRes.error) throw billRes.error;
  if (allocRes.error) throw allocRes.error;
  store.set({
    bills: (billRes.data || []) as Bill[],
    allocations: (allocRes.data || []) as BillAllocation[],
    loading: false,
    orgId,
  });
};

export const useBills = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const state = store.useStore();

  useEffect(() => {
    const orgId = profile?.organization_id;
    if (!orgId) return;
    if (state.orgId === orgId && (state.bills.length > 0 || state.allocations.length > 0)) return;
    singleFlight(() => fetchAll(orgId)).catch((err) => {
      console.error('Error fetching bills:', err);
      toast({ title: 'Error', description: 'Failed to fetch bills', variant: 'destructive' });
    });
  }, [profile?.organization_id, state.orgId, state.bills.length, state.allocations.length, toast]);

  const refetch = async () => {
    if (!profile?.organization_id) return;
    await fetchAll(profile.organization_id);
  };

  const addBill = async (data: {
    vendor_id: string;
    bill_number?: string;
    category_id?: string | null;
    date: string;
    amount: number;
  }) => {
    if (!profile?.organization_id) throw new Error('No organization');
    try {
      const { error } = await supabase.from('Bills').insert([
        {
          vendor_id: data.vendor_id,
          bill_number: data.bill_number || null,
          category_id: data.category_id || null,
          date: data.date,
          amount: data.amount,
          status: 'unpaid' as BillStatus,
          organization_id: profile.organization_id,
        },
      ]);
      if (error) throw error;
      await refetch();
      toast({ title: 'Success', description: 'Bill created' });
    } catch (error) {
      console.error('Error adding bill:', error);
      toast({ title: 'Error', description: 'Failed to add bill', variant: 'destructive' });
      throw error;
    }
  };

  const allocateToBill = async (data: {
    transaction_id: string;
    bill_id: string;
    amount_applied: number;
  }) => {
    if (!profile?.organization_id) throw new Error('No organization');
    try {
      const { error } = await supabase.from('BillAllocations').insert([
        {
          transaction_id: data.transaction_id,
          bill_id: data.bill_id,
          amount_applied: data.amount_applied,
          organization_id: profile.organization_id,
        },
      ]);
      if (error) throw error;

      const bill = state.bills.find((b) => b.id === data.bill_id);
      if (bill) {
        const totalApplied =
          state.allocations
            .filter((a) => a.bill_id === data.bill_id)
            .reduce((sum, a) => sum + Number(a.amount_applied), 0) + data.amount_applied;

        let status: BillStatus = 'unpaid';
        if (totalApplied >= Number(bill.amount)) status = 'paid';
        else if (totalApplied > 0) status = 'partial';

        await supabase.from('Bills').update({ status }).eq('id', data.bill_id);
      }

      await refetch();
      toast({ title: 'Success', description: 'Allocation recorded' });
    } catch (error) {
      console.error('Error allocating to bill:', error);
      toast({ title: 'Error', description: 'Failed to allocate', variant: 'destructive' });
      throw error;
    }
  };

  const deleteBill = async (id: string) => {
    try {
      const { error } = await supabase.from('Bills').delete().eq('id', id);
      if (error) throw error;
      await refetch();
      toast({ title: 'Success', description: 'Bill deleted' });
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({ title: 'Error', description: 'Failed to delete bill', variant: 'destructive' });
    }
  };

  return {
    bills: state.bills,
    allocations: state.allocations,
    loading: state.loading,
    addBill,
    allocateToBill,
    deleteBill,
    refetch,
  };
};
