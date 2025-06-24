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
      
      // Process transactions to ensure proper date formatting in descriptions
      const processedTransactions = (data || []).map(transaction => {
        if (transaction.description && transaction.description.includes('undefined')) {
          // Fix descriptions that have undefined dates
          const transactionDate = new Date(transaction.transaction_date);
          const formattedDate = transactionDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
          
          // Replace undefined with properly formatted date
          transaction.description = transaction.description.replace(/undefined \(invalid date\)/gi, formattedDate);
          transaction.description = transaction.description.replace(/undefined/gi, formattedDate);
        }
        return transaction;
      });
      
      setTransactions(processedTransactions as Transaction[]);
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

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
    try {
      // Format the transaction date properly and ensure description has correct date format
      const transactionDate = new Date(transactionData.transaction_date);
      const formattedDate = transactionDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      
      // Fix description if it contains date references
      let description = transactionData.description;
      if (description && description.includes('for date')) {
        description = description.replace(/for date.*$/, `for ${formattedDate}`);
      }

      const formattedTransactionData = {
        ...transactionData,
        transaction_date: transactionDate.toISOString().split('T')[0],
        description: description
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
  };
};
