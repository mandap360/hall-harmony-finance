
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Account {
  id: string;
  name: string;
  account_type: 'cash_bank' | 'owners_capital' | 'party';
  sub_type?: string | null;
  balance: number;
  opening_balance: number;
  is_default: boolean;
  gstin?: string | null;
  phone_number?: string | null;
  address?: string | null;
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
      // Balance is now stored in DB and updated by triggers automatically
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setAccounts((data || []) as Account[]);
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

  const addAccount = async (accountData: any) => {
    if (!profile?.organization_id) return;
    
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([{ 
          name: accountData.name,
          account_type: accountData.account_type,
          is_default: accountData.is_default || false,
          balance: 0, 
          opening_balance: accountData.opening_balance || 0,
          gstin: accountData.gstin || null,
          phone_number: accountData.phone_number || null,
          address: accountData.address || null,
          organization_id: profile.organization_id 
        }])
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

      // Balance is updated by DB trigger when opening_balance changes
      // Just refresh to get the latest balance
      await fetchAccounts();

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
    if (!profile?.organization_id) return;
    
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

      // Add transaction record with new schema
      const transactionDate = transferDate || new Date().toISOString().split('T')[0];
      
      const { error: txError } = await supabase
        .from('transactions')
        .insert([{
          voucher_type: 'fund_transfer' as const,
          voucher_date: transactionDate,
          amount: amount,
          from_account_id: fromAccountId,
          to_account_id: toAccountId,
          is_financial_transaction: true,
          organization_id: profile.organization_id,
          description: description || `Transfer from ${fromAccount?.name} to ${toAccount?.name}`
        }]);

      if (txError) throw txError;

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
