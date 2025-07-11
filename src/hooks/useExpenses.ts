import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { APP_CONSTANTS } from "@/lib/utils";

export interface Expense {
  id: string;
  vendorName: string;
  billNumber: string;
  category: string;
  amount: number;
  cgstPercentage: number;
  sgstPercentage: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
  date: string;
  createdAt: string;
  isPaid: boolean;
  accountId?: string;
  accountName?: string;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchExpenses = async () => {
    if (!profile?.organization_id) return;
    
    try {
      setLoading(true);
      
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_categories!inner(name),
          accounts(name)
        `)
        .eq('is_deleted', false)
        .eq('organization_id', profile.organization_id)
        .order('expense_date', { ascending: false });

      if (expensesError) {
        throw expensesError;
      }

      const transformedExpenses: Expense[] = (expensesData || []).map(expense => ({
        id: expense.id,
        vendorName: expense.vendor_name,
        billNumber: expense.bill_number,
        category: expense.expense_categories?.name || 'Unknown',
        amount: Number(expense.amount),
        cgstPercentage: Number(expense.cgst_percentage || 0),
        sgstPercentage: Number(expense.sgst_percentage || 0),
        cgstAmount: Number(expense.cgst_amount || 0),
        sgstAmount: Number(expense.sgst_amount || 0),
        totalAmount: Number(expense.total_amount || expense.amount),
        date: expense.expense_date,
        createdAt: expense.created_at,
        isPaid: expense.is_paid || false,
        accountId: expense.account_id,
        accountName: expense.accounts?.name
      }));

      setExpenses(transformedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.organization_id) {
      fetchExpenses();
    }
  }, [profile?.organization_id]);

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!profile?.organization_id) return;
    
    try {
      const { data: categories, error: categoryError } = await supabase
        .from('expense_categories')
        .select('id')
        .eq('name', expenseData.category)
        .single();

      if (categoryError) {
        throw new Error(`Category "${expenseData.category}" not found`);
      }

      const { error } = await supabase
        .from('expenses')
        .insert({
          vendor_name: expenseData.vendorName,
          bill_number: expenseData.billNumber,
          category_id: categories.id,
          amount: expenseData.amount,
          cgst_percentage: expenseData.cgstPercentage,
          sgst_percentage: expenseData.sgstPercentage,
          cgst_amount: expenseData.cgstAmount,
          sgst_amount: expenseData.sgstAmount,
          total_amount: expenseData.totalAmount,
          expense_date: expenseData.date,
          is_paid: expenseData.isPaid,
          account_id: expenseData.accountId,
          organization_id: profile.organization_id
        });

      if (error) throw error;

      await fetchExpenses();
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  const updateExpense = async (updatedExpense: Expense) => {
    try {
      const { data: categories, error: categoryError } = await supabase
        .from('expense_categories')
        .select('id')
        .eq('name', updatedExpense.category)
        .single();

      if (categoryError) throw categoryError;

      const { error } = await supabase
        .from('expenses')
        .update({
          vendor_name: updatedExpense.vendorName,
          bill_number: updatedExpense.billNumber,
          category_id: categories.id,
          amount: updatedExpense.amount,
          cgst_percentage: updatedExpense.cgstPercentage,
          sgst_percentage: updatedExpense.sgstPercentage,
          cgst_amount: updatedExpense.cgstAmount,
          sgst_amount: updatedExpense.sgstAmount,
          total_amount: updatedExpense.totalAmount,
          expense_date: updatedExpense.date
        })
        .eq('id', updatedExpense.id);

      if (error) throw error;

      await fetchExpenses();
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', expenseId);

      if (error) throw error;

      await fetchExpenses();
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  const recordPayment = async (expenseId: string, paymentData: { 
    amount: number; 
    date: string; 
    accountId: string; 
    description?: string; 
  }) => {
    try {
      const { data: expense } = await supabase
        .from('expenses')
        .select(`*, expense_categories!inner(name)`)
        .eq('id', expenseId)
        .single();

      if (!expense) throw new Error('Expense not found');

      const transactionDescription = expense.vendor_name;

      const { error: updateError } = await supabase
        .from('expenses')
        .update({ 
          is_paid: true,
          payment_date: paymentData.date,
          account_id: paymentData.accountId
        })
        .eq('id', expenseId);

      if (updateError) throw updateError;

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          account_id: paymentData.accountId,
          transaction_type: APP_CONSTANTS.TRANSACTION_TYPES.DEBIT,
          amount: paymentData.amount,
          description: transactionDescription,
          reference_type: APP_CONSTANTS.REFERENCE_TYPES.EXPENSE_PAYMENT,
          reference_id: expenseId,
          transaction_date: paymentData.date
        });

      if (transactionError) throw transactionError;

      await fetchExpenses();
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const markAsPaid = async (expenseId: string, accountId: string, paymentDate: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          is_paid: true,
          account_id: accountId,
          payment_date: paymentDate
        })
        .eq('id', expenseId);

      if (error) throw error;

      await fetchExpenses();
      toast({
        title: "Success",
        description: "Expense marked as paid",
      });
    } catch (error) {
      console.error('Error marking expense as paid:', error);
      toast({
        title: "Error",
        description: "Failed to mark expense as paid",
        variant: "destructive",
      });
    }
  };

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    markAsPaid,
    recordPayment,
    refetch: fetchExpenses
  };
};