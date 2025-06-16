
import { useState, useEffect } from "react";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  createdAt: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories from localStorage on mount
  useEffect(() => {
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      // Initialize with default categories
      const defaultCategories: Category[] = [
        // Income categories
        { id: "1", name: "Rent", type: "income", createdAt: new Date().toISOString() },
        { id: "2", name: "EB", type: "income", createdAt: new Date().toISOString() },
        { id: "3", name: "Gas", type: "income", createdAt: new Date().toISOString() },
        { id: "4", name: "Decoration", type: "income", createdAt: new Date().toISOString() },
        { id: "5", name: "Cleaning", type: "income", createdAt: new Date().toISOString() },
        // Expense categories
        { id: "6", name: "Office Supplies", type: "expense", createdAt: new Date().toISOString() },
        { id: "7", name: "Utilities", type: "expense", createdAt: new Date().toISOString() },
        { id: "8", name: "Maintenance", type: "expense", createdAt: new Date().toISOString() },
        { id: "9", name: "Marketing", type: "expense", createdAt: new Date().toISOString() },
        { id: "10", name: "Food & Catering", type: "expense", createdAt: new Date().toISOString() },
        { id: "11", name: "Transportation", type: "expense", createdAt: new Date().toISOString() },
        { id: "12", name: "Professional Services", type: "expense", createdAt: new Date().toISOString() },
        { id: "13", name: "Equipment", type: "expense", createdAt: new Date().toISOString() },
        { id: "14", name: "Other", type: "expense", createdAt: new Date().toISOString() },
      ];
      setCategories(defaultCategories);
    }
  }, []);

  // Save categories to localStorage whenever categories change
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const addCategory = (categoryData: Omit<Category, "id" | "createdAt">) => {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(category => category.id !== categoryId));
  };

  const getIncomeCategories = () => categories.filter(cat => cat.type === "income");
  const getExpenseCategories = () => categories.filter(cat => cat.type === "expense");

  return {
    categories,
    addCategory,
    deleteCategory,
    getIncomeCategories,
    getExpenseCategories,
  };
};
