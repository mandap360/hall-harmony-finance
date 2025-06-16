
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Expense {
  id: string;
  vendorName: string;
  billNumber: string;
  category: string;
  categoryId: string;
  amount: number;
  cgstPercentage: number;
  sgstPercentage: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
  date: string;
  createdAt: string;
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
      
      // Get current Indian Financial Year
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      
      let fyStartDate, fyEndDate;
      if (month >= 3) { // April onwards
        fyStartDate = new Date(year, 3, 1); // April 1st
        fyEndDate = new Date(year + 1, 2, 31); // March 31st next year
      } else { // January to March
        fyStartDate = new Date(year - 1, 3, 1); // April 1st previous year
        fyEndDate = new Date(year, 2, 31); // March 31st
      }

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_categories(name)
        `)
        .eq('organization_id', profile.organization_id)
        .gte('expense_date', fyStartDate.toISOString().split('T')[0])
        .lte('expense_date', fyEndDate.toISOString().split('T')[0])
        .order('expense_date', { ascending: false });

      if (error) throw error;

      const transformedExpenses = (data || []).map(expense => ({
        id: expense.id,
        vendorName: expense.vendor_name,
        billNumber: expense.bill_number,
        category: expense.expense_categories?.name || 'Unknown',
        categoryId: expense.category_id,
        amount: Number(expense.amount),
        cgstPercentage: Number(expense.cgst_percentage || 0),
        sgstPercentage: Number(expense.sgst_percentage || 0),
        cgstAmount: Number(expense.cgst_amount || 0),
        sgstAmount: Number(expense.sgst_amount || 0),
        totalAmount: Number(expense.total_amount || expense.amount),
        date: expense.expense_date,
        createdAt: expense.created_at
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
    fetchExpenses();
  }, [profile?.organization_id]);

  const addExpense = async (expenseData: Omit<Expense, "id" | "createdAt" | "category">) => {
    if (!profile?.organization_id || profile.role !== 'admin') return;
    
    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          vendor_name: expenseData.vendorName,
          bill_number: expenseData.billNumber,
          category_id: expenseData.categoryId,
          amount: expenseData.amount,
          cgst_percentage: expenseData.cgstPercentage,
          sgst_percentage: expenseData.sgstPercentage,
          cgst_amount: expenseData.cgstAmount,
          sgst_amount: expenseData.sgstAmount,
          total_amount: expenseData.totalAmount,
          expense_date: expenseData.date,
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

  return {
    expenses,
    loading,
    addExpense,
    refetch: fetchExpenses
  };
};
