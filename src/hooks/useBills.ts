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
  // Transaction details (loaded via join)
  transaction_type?: 'Income' | 'Expense' | 'Refund' | 'Advance Paid' | 'Transfer';
  transaction_date?: string;
  transaction_amount?: number;
  transaction_description?: string | null;
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
    supabase.from('BillAllocations').select(`
      *,
      Transactions!inner (
        id,
        type,
        transaction_date,
        amount,
        description
      )
    `).eq('organization_id', orgId),
  ]);
  if (billRes.error) throw billRes.error;
  if (allocRes.error) throw allocRes.error;

  // Map allocations with transaction details
  const allocationsWithTx = (allocRes.data || []).map((alloc: any) => ({
    id: alloc.id,
    transaction_id: alloc.transaction_id,
    bill_id: alloc.bill_id,
    amount_applied: alloc.amount_applied,
    applied_at: alloc.applied_at,
    organization_id: alloc.organization_id,
    transaction_type: alloc.Transactions?.type,
    transaction_date: alloc.Transactions?.transaction_date,
    transaction_amount: alloc.Transactions?.amount,
    transaction_description: alloc.Transactions?.description,
  }));

  store.set({
    bills: (billRes.data || []) as Bill[],
    allocations: allocationsWithTx as BillAllocation[],
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
      // 1. Insert the allocation
      const { error: allocError } = await supabase.from('BillAllocations').insert([
        {
          transaction_id: data.transaction_id,
          bill_id: data.bill_id,
          amount_applied: data.amount_applied,
          organization_id: profile.organization_id,
        },
      ]);
      if (allocError) throw allocError;

      // 2. Get bill amount and recalculate status from DB
      const billRes = await supabase
        .from('Bills')
        .select('amount')
        .eq('id', data.bill_id)
        .single();
      
      if (billRes.data) {
        const billAmount = Number(billRes.data.amount);
        
        // Get all allocations for this bill (fresh from DB)
        const allocRes = await supabase
          .from('BillAllocations')
          .select('amount_applied')
          .eq('bill_id', data.bill_id)
          .eq('organization_id', profile.organization_id);

        if (allocRes.data) {
          const totalApplied = allocRes.data.reduce((sum, a) => sum + Number(a.amount_applied), 0);
          
          let billStatus: BillStatus = 'unpaid';
          if (totalApplied >= billAmount) {
            billStatus = 'paid';
          } else if (totalApplied > 0) {
            billStatus = 'partial';
          }

          await supabase.from('Bills').update({ status: billStatus }).eq('id', data.bill_id);
        }
      }

      // 3. Update transaction status based on total allocations
      const txRes = await supabase
        .from('Transactions')
        .select('amount')
        .eq('id', data.transaction_id)
        .single();

      if (txRes.data) {
        const txAmount = Number(txRes.data.amount);
        
        // Get all allocations for this transaction across ALL bills
        const txAllocRes = await supabase
          .from('BillAllocations')
          .select('amount_applied')
          .eq('transaction_id', data.transaction_id)
          .eq('organization_id', profile.organization_id);

        if (txAllocRes.data) {
          const totalAllocated = txAllocRes.data.reduce((sum, a) => sum + Number(a.amount_applied), 0);
          
          let txStatus: 'Available' | 'Fully Allocated' | 'Partially Allocated' | 'Void' = 'Available';
          if (totalAllocated >= txAmount) {
            txStatus = 'Fully Allocated';
          } else if (totalAllocated > 0) {
            txStatus = 'Partially Allocated';
          }

          await supabase
            .from('Transactions')
            .update({ transaction_status: txStatus })
            .eq('id', data.transaction_id);
        }
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
