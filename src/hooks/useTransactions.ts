import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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

export const useTransactions = (accountId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchTransactions = useCallback(async () => {
    if (!profile?.organization_id) return;

    try {
      let query = supabase
        .from('Transactions')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (accountId) {
        query = query.or(`from_account_id.eq.${accountId},to_account_id.eq.${accountId},entity_id.eq.${accountId}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      setTransactions((data || []) as Transaction[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({ title: 'Error', description: 'Failed to fetch transactions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [profile?.organization_id, accountId, toast]);

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

      setTransactions((prev) => [inserted as Transaction, ...prev]);
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
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast({ title: 'Success', description: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({ title: 'Error', description: 'Failed to delete transaction', variant: 'destructive' });
      throw error;
    }
  };

  useEffect(() => {
    if (profile?.organization_id) fetchTransactions();
  }, [profile?.organization_id, fetchTransactions]);

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions,
  };
};
