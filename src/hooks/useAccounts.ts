
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Account {
  id: string;
  name: string;
  account_type: 'operational' | 'capital' | 'other';
  sub_type?: string;
  balance: number;
  opening_balance: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchAccounts = async () => {
    if (!profile?.organization_id) return;
    
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Calculate current balance for each account based on opening balance + transactions
      const accountsWithCalculatedBalance = await Promise.all(
        (data || []).map(async (account) => {
          const { data: transactions, error: txError } = await supabase
            .from('transactions')
            .select('transaction_type, amount')
            .eq('account_id', account.id);

          if (txError) {
            console.error('Error fetching transactions for account:', txError);
            return account;
          }

          // Calculate balance from opening balance + all transactions
          const openingBalance = account.opening_balance || 0;
          const transactionBalance = (transactions || []).reduce((sum, tx) => {
            return sum + (tx.transaction_type === 'credit' ? tx.amount : -tx.amount);
          }, 0);

          return {
            ...account,
            balance: openingBalance + transactionBalance
          };
        })
      );

      setAccounts(accountsWithCalculatedBalance as Account[]);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData: Omit<Account, 'id' | 'created_at' | 'updated_at' | 'balance'>) => {
    if (!profile?.organization_id) return;
    
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([{ ...accountData, balance: 0, opening_balance: 0, organization_id: profile.organization_id }])
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => [...prev, data as Account]);
      toast({
        title: "Success",
        description: "Account added successfully",
      });

      return data as Account;
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: "Error",
        description: "Failed to add account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Recalculate balance if opening_balance was updated
      if (updates.opening_balance !== undefined) {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('transaction_type, amount')
          .eq('account_id', id);

        const transactionBalance = (transactions || []).reduce((sum, tx) => {
          return sum + (tx.transaction_type === 'credit' ? tx.amount : -tx.amount);
        }, 0);

        const calculatedBalance = (updates.opening_balance || 0) + transactionBalance;
        
        setAccounts(prev => prev.map(account => 
          account.id === id ? { ...data as Account, balance: calculatedBalance } : account
        ));
      } else {
        setAccounts(prev => prev.map(account => 
          account.id === id ? data as Account : account
        ));
      }

      toast({
        title: "Success",
        description: "Account updated successfully",
      });

      return data as Account;
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAccounts(prev => prev.filter(account => account.id !== id));
      toast({
        title: "Success",
        description: "Account deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const transferAmount = async (fromAccountId: string, toAccountId: string, amount: number, description?: string, transferDate?: string) => {
    try {
      // Get account names for better descriptions
      const { data: fromAccount } = await supabase
        .from('accounts')
        .select('name')
        .eq('id', fromAccountId)
        .single();

      const { data: toAccount } = await supabase
        .from('accounts')
        .select('name')
        .eq('id', toAccountId)
        .single();

      // Create debit transaction for source account
      await (supabase.rpc as any)('update_account_balance', {
        account_uuid: fromAccountId,
        amount_change: -amount
      });

      // Create credit transaction for destination account
      await (supabase.rpc as any)('update_account_balance', {
        account_uuid: toAccountId,
        amount_change: amount
      });

      // Add transaction records with account names in descriptions
      const transactionDate = transferDate || new Date().toISOString().split('T')[0];
      
      const { error: debitError } = await supabase
        .from('transactions')
        .insert([{
          account_id: fromAccountId,
          transaction_type: 'debit',
          amount: amount,
          description: description || `Transfer to ${toAccount?.name || 'account'}`,
          reference_type: 'transfer',
          reference_id: toAccountId,
          transaction_date: transactionDate
        }]);

      if (debitError) throw debitError;

      const { error: creditError } = await supabase
        .from('transactions')
        .insert([{
          account_id: toAccountId,
          transaction_type: 'credit',
          amount: amount,
          description: description || `Transfer from ${fromAccount?.name || 'account'}`,
          reference_type: 'transfer',
          reference_id: fromAccountId,
          transaction_date: transactionDate
        }]);

      if (creditError) throw creditError;

      // Refresh accounts to show updated balances
      await fetchAccounts();

      toast({
        title: "Success",
        description: "Amount transferred successfully",
      });
    } catch (error) {
      console.error('Error transferring amount:', error);
      toast({
        title: "Error",
        description: "Failed to transfer amount",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (profile?.organization_id) {
      fetchAccounts();
    }
  }, [profile?.organization_id]);

  return {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    transferAmount,
    refreshAccounts: fetchAccounts,
  };
};
