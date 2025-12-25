import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type VoucherType = 'purchase' | 'payment' | 'fund_transfer' | 'sales' | 'receipt';
export type PartyType = 'customer' | 'vendor';
export type PaymentMethodType = 'cash' | 'bank';

// Raw transaction from database with new schema
export interface TransactionDB {
  id: string;
  voucher_type: VoucherType;
  voucher_date: string;
  amount: number;
  party_type?: PartyType | null;
  party_id?: string | null;
  payment_method?: PaymentMethodType | null;
  from_account_id?: string | null;
  to_account_id?: string | null;
  reference_voucher_id?: string | null;
  is_financial_transaction: boolean;
  organization_id: string;
  description?: string | null;
  created_at: string;
}

// Extended transaction with computed fields for backward compatibility
export interface Transaction extends TransactionDB {
  // Computed fields for account-level views
  transaction_type: 'credit' | 'debit';
  transaction_date: string;
}

export interface TransactionInsert {
  voucher_type: VoucherType;
  voucher_date: string;
  amount: number;
  party_type?: PartyType | null;
  party_id?: string | null;
  payment_method?: PaymentMethodType | null;
  from_account_id?: string | null;
  to_account_id?: string | null;
  reference_voucher_id?: string | null;
  is_financial_transaction?: boolean;
  organization_id: string;
  description?: string | null;
}

// Legacy-style transaction input (for backward compatibility with existing code)
export interface LegacyTransactionInput {
  account_id: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  description?: string;
  reference_type?: string;
  reference_id?: string;
  transaction_date: string;
}

// Helper to convert legacy transaction input to new schema
export const convertLegacyTransaction = (
  legacy: LegacyTransactionInput,
  organizationId: string
): TransactionInsert => {
  const isCredit = legacy.transaction_type === 'credit';
  
  return {
    voucher_type: isCredit ? 'receipt' : 'payment',
    voucher_date: legacy.transaction_date,
    amount: legacy.amount,
    from_account_id: isCredit ? null : legacy.account_id,
    to_account_id: isCredit ? legacy.account_id : null,
    is_financial_transaction: true,
    organization_id: organizationId,
    description: legacy.description || null,
  };
};

// Helper to compute transaction type based on account context
const computeTransactionType = (tx: TransactionDB, accountId?: string): 'credit' | 'debit' => {
  // For fund transfers, check if this account is source or destination
  if (tx.voucher_type === 'fund_transfer') {
    if (accountId === tx.from_account_id) return 'debit';
    if (accountId === tx.to_account_id) return 'credit';
  }
  
  // Payment vouchers are debits (money going out)
  if (tx.voucher_type === 'payment' || tx.voucher_type === 'purchase') {
    return 'debit';
  }
  
  // Receipt and sales vouchers are credits (money coming in)
  if (tx.voucher_type === 'receipt' || tx.voucher_type === 'sales') {
    return 'credit';
  }
  
  return 'credit';
};

// Helper to transform DB transaction to extended format
const transformTransaction = (tx: TransactionDB, accountId?: string): Transaction => ({
  ...tx,
  transaction_type: computeTransactionType(tx, accountId),
  transaction_date: tx.voucher_date,
});

export const useTransactions = (accountId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('voucher_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (accountId) {
        query = query.or(`from_account_id.eq.${accountId},to_account_id.eq.${accountId}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const transformed = (data || []).map((tx: TransactionDB) => transformTransaction(tx, accountId));
      setTransactions(transformed);
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
        .order('voucher_date', { ascending: false });

      if (startDate) {
        query = query.gte('voucher_date', startDate);
      }
      if (endDate) {
        query = query.lte('voucher_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map((tx: TransactionDB) => transformTransaction(tx));
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

  const addTransaction = async (transactionData: TransactionInsert) => {
    try {
      const formattedTransactionData = {
        ...transactionData,
        voucher_date: new Date(transactionData.voucher_date).toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([formattedTransactionData])
        .select()
        .single();

      if (error) throw error;

      const transformed = transformTransaction(data as TransactionDB);
      setTransactions(prev => [transformed, ...prev]);
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });

      return transformed;
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
