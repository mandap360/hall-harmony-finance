
import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useVendors } from "@/hooks/useVendors";
import { useTransactions } from "@/hooks/useTransactions";
import { ExpenseFilters } from "@/components/expense/ExpenseFilters";
import { ExpenseEmptyState } from "@/components/expense/ExpenseEmptyState";
import { ExpenseList } from "@/components/expense/ExpenseList";

export const ExpensePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { expenses, addExpense, refetch } = useExpenses();
  const { getExpenseCategories } = useCategories();
  const { vendors } = useVendors();
  const { addTransaction } = useTransactions();
  const expenseCategories = getExpenseCategories();

  // Get current Indian Financial Year (April to March)
  const getCurrentFY = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    if (month >= 3) { // April onwards (month is 0-indexed, so March = 2, April = 3)
      return { startYear: year, endYear: year + 1 };
    } else { // January to March
      return { startYear: year - 1, endYear: year };
    }
  };

  const currentFY = getCurrentFY();

  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getFullYear();
      const expenseMonth = expenseDate.getMonth();
      
      // Check if expense is in current FY (only if no date range is selected)
      if (!startDate && !endDate) {
        let isInCurrentFY = false;
        if (expenseMonth >= 3) { // April onwards (month is 0-indexed)
          isInCurrentFY = expenseYear === currentFY.startYear;
        } else { // January to March
          isInCurrentFY = expenseYear === currentFY.endYear;
        }
        
        if (!isInCurrentFY) return false;
      }

      // Apply date range filter if dates are selected
      if (startDate && expenseDate < startDate) return false;
      if (endDate && expenseDate > endDate) return false;
      
      return true;
    });

    if (selectedCategory !== "all") {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    if (selectedVendor !== "all") {
      filtered = filtered.filter(expense => expense.vendorName === selectedVendor);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, selectedCategory, selectedVendor, startDate, endDate, currentFY]);

  const handleAddExpense = async (expenseData: any) => {
    try {
      // Add the expense
      await addExpense(expenseData);
      
      // Add corresponding transaction if it's paid
      if (expenseData.isPaid && expenseData.accountId) {
        await addTransaction({
          account_id: expenseData.accountId,
          transaction_type: 'debit',
          amount: expenseData.totalAmount,
          description: `Expense - ${expenseData.vendorName} - ${expenseData.category}`,
          reference_type: 'expense',
          reference_id: null,
          transaction_date: expenseData.date
        });
      }
      
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Filters */}
      <div className="flex-shrink-0">
        <ExpenseFilters
          selectedCategory={selectedCategory}
          selectedVendor={selectedVendor}
          startDate={startDate}
          endDate={endDate}
          onCategoryChange={setSelectedCategory}
          onVendorChange={setSelectedVendor}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          expenseCategories={expenseCategories}
          vendors={vendors}
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredExpenses.length === 0 ? (
          <ExpenseEmptyState onRefresh={refetch} />
        ) : (
          <ExpenseList expenses={filteredExpenses} onExpenseUpdated={refetch} />
        )}
      </div>

      <Button
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddExpenseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddExpense}
      />
    </div>
  );
};
