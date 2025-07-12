
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { MonthNavigation } from "@/components/MonthNavigation";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useVendors } from "@/hooks/useVendors";
import { useTransactions } from "@/hooks/useTransactions";
import { useFilters } from "@/hooks/useFilters";
import { ExpenseFilters } from "@/components/expense/ExpenseFilters";
import { ExpenseEmptyState } from "@/components/expense/ExpenseEmptyState";
import { ExpenseList } from "@/components/expense/ExpenseList";
import { APP_CONSTANTS, ReferenceType } from "@/lib/utils";

export const ExpensePage = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const { expenses, addExpense, refetch } = useExpenses();
  const { getExpenseCategories } = useCategories();
  const { vendors } = useVendors();
  const { addTransaction } = useTransactions();
  
  // Use the new filters hook
  const {
    filters,
    filteredItems: filteredExpenses,
    showFilters,
    updateFilter,
    setShowFilters
  } = useFilters(expenses);
  
  const expenseCategories = getExpenseCategories();

  const handleAddExpense = async (expenseData: any) => {
    try {
      await addExpense(expenseData);
      
      // Add corresponding transaction if it's paid
      if (expenseData.isPaid && expenseData.accountId) {
        await addTransaction({
          account_id: expenseData.accountId,
          transaction_type: APP_CONSTANTS.TRANSACTION_TYPES.DEBIT,
          amount: expenseData.totalAmount,
          description: `Expense - ${expenseData.vendorName} - ${expenseData.category}`,
          reference_type: APP_CONSTANTS.REFERENCE_TYPES.EXPENSE as ReferenceType,
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Month Navigation */}
      <MonthNavigation 
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />
      
      {/* Fixed Filters */}
      <div className="flex-shrink-0">
        <ExpenseFilters
          selectedCategory={filters.category}
          selectedVendor={filters.vendor}
          startDate={filters.startDate}
          endDate={filters.endDate}
          paymentStatus={filters.paymentStatus}
          onCategoryChange={(value) => updateFilter('category', value)}
          onVendorChange={(value) => updateFilter('vendor', value)}
          onStartDateChange={(value) => updateFilter('startDate', value)}
          onEndDateChange={(value) => updateFilter('endDate', value)}
          onPaymentStatusChange={(value) => updateFilter('paymentStatus', value)}
          expenseCategories={expenseCategories}
          vendors={vendors}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
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
