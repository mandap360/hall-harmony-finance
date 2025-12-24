import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  account_id: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  description?: string;
  reference_type?: string;
  reference_id?: string;
  transaction_date: string;
  created_at: string;
  voucher_type?: string;
  is_financial_transaction?: boolean;
  from_account_id?: string;
  to_account_id?: string;
  vendor_id?: string;
  booking_id?: string;
}

export const useTransactions = (accountId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setTransactions(data as Transaction[] || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialTransactions = async (startDate?: string, endDate?: string) => {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('is_financial_transaction', true)
        .order('transaction_date', { ascending: false });

      if (startDate) {
        query = query.gte('transaction_date', startDate);
      }
      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return data as Transaction[] || [];
    } catch (error) {
      console.error('Error fetching financial transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch financial transactions",
        variant: "destructive",
      });
      return [];
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
    try {
      const formattedTransactionData = {
        ...transactionData,
        transaction_date: new Date(transactionData.transaction_date).toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([formattedTransactionData])
        .select()
        .single();

      if (error) throw error;

      setTransactions(prev => [data as Transaction, ...prev]);
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });

      return data as Transaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [accountId]);

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions,
    fetchFinancialTransactions,
  };
};
