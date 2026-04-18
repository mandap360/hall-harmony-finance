import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Account {
  id: string;
  name: string;
  account_type: 'cash_bank' | 'owners_capital' | 'party';
  initial_balance: number;
  is_default: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
  /** Computed dynamically from Transactions */
  balance: number;
}

interface RawAccount {
  id: string;
  name: string;
  account_type: string;
  initial_balance: number;
  is_default: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

interface RawTransaction {
  from_account_id: string | null;
  to_account_id: string | null;
  amount: number;
}

const computeBalance = (accountId: string, initial: number, txs: RawTransaction[]): number => {
  let bal = Number(initial) || 0;
  for (const tx of txs) {
    const amt = Number(tx.amount) || 0;
    if (tx.to_account_id === accountId) bal += amt;
    if (tx.from_account_id === accountId) bal -= amt;
  }
  return bal;
};

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchAccounts = useCallback(async () => {
    if (!profile?.organization_id) return;

    try {
      const [accRes, txRes] = await Promise.all([
        supabase
          .from('Accounts')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: true }),
        supabase
          .from('Transactions')
          .select('from_account_id, to_account_id, amount')
          .eq('organization_id', profile.organization_id)
          .neq('transaction_status', 'Void'),
      ]);

      if (accRes.error) throw accRes.error;
      if (txRes.error) throw txRes.error;

      const rawAccounts = (accRes.data || []) as RawAccount[];
      const txs = (txRes.data || []) as RawTransaction[];

      const enriched: Account[] = rawAccounts.map((a) => ({
        ...a,
        account_type: a.account_type as Account['account_type'],
        initial_balance: Number(a.initial_balance) || 0,
        balance: computeBalance(a.id, Number(a.initial_balance) || 0, txs),
      }));

      setAccounts(enriched);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [profile?.organization_id, toast]);

  const addAccount = async (data: {
    name: string;
    account_type: Account['account_type'];
    initial_balance?: number;
    is_default?: boolean;
  }) => {
    if (!profile?.organization_id) return;

    try {
      const { error } = await supabase.from('Accounts').insert([
        {
          name: data.name,
          account_type: data.account_type,
          initial_balance: data.initial_balance || 0,
          is_default: data.is_default || false,
          organization_id: profile.organization_id,
        },
      ]);

      if (error) throw error;
      await fetchAccounts();
      toast({ title: 'Success', description: 'Account added successfully' });
    } catch (error) {
      console.error('Error adding account:', error);
      toast({ title: 'Error', description: 'Failed to add account', variant: 'destructive' });
      throw error;
    }
  };

  const updateAccount = async (
    id: string,
    updates: Partial<Pick<Account, 'name' | 'account_type' | 'initial_balance' | 'is_default'>>,
  ) => {
    try {
      const { error } = await supabase
        .from('Accounts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchAccounts();
      toast({ title: 'Success', description: 'Account updated successfully' });
    } catch (error) {
      console.error('Error updating account:', error);
      toast({ title: 'Error', description: 'Failed to update account', variant: 'destructive' });
      throw error;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase.from('Accounts').delete().eq('id', id);
      if (error) throw error;
      await fetchAccounts();
      toast({ title: 'Success', description: 'Account deleted successfully' });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({ title: 'Error', description: 'Failed to delete account', variant: 'destructive' });
      throw error;
    }
  };

  useEffect(() => {
    if (profile?.organization_id) fetchAccounts();
  }, [profile?.organization_id, fetchAccounts]);

  return {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts: fetchAccounts,
  };
};
