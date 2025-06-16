
import { useState } from "react";

export interface Expense {
  id: string;
  vendorName: string;
  billNumber: string;
  category: string;
  amount: number;
  includesGST: boolean;
  gstPercentage: number;
  date: string;
  createdAt: string;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const addExpense = (expenseData: Omit<Expense, "id" | "createdAt">) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
  };

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
};
