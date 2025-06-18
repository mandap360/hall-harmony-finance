
import { useState, useMemo } from "react";
import { Filter, RefreshCcw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { ExpenseCard } from "@/components/ExpenseCard";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useVendors } from "@/hooks/useVendors";
import { Plus } from "lucide-react";

export const ExpensePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { expenses, addExpense, refetch } = useExpenses();
  const { getExpenseCategories } = useCategories();
  const { vendors } = useVendors();
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
      
      // Check if expense is in current FY
      let isInCurrentFY = false;
      if (expenseMonth >= 3) { // April onwards (month is 0-indexed)
        isInCurrentFY = expenseYear === currentFY.startYear;
      } else { // January to March
        isInCurrentFY = expenseYear === currentFY.endYear;
      }
      
      return isInCurrentFY;
    });

    if (selectedCategory !== "all") {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    if (selectedVendor !== "all") {
      filtered = filtered.filter(expense => expense.vendorName === selectedVendor);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, selectedCategory, selectedVendor, currentFY]);

  const handleAddExpense = (expenseData: any) => {
    addExpense(expenseData);
    setShowAddDialog(false);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Filter Section - Fixed */}
      <div className="p-4 bg-white border-b space-y-3 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {expenseCategories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedVendor} onValueChange={setSelectedVendor}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.businessName}>
                  {vendor.businessName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-16 space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <FileText className="h-16 w-16 text-gray-400" />
                  <div className="absolute -top-2 -right-1 w-6 h-6 bg-gray-300 rounded-full border-2 border-white transform rotate-45"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Record Business Expenses</h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  The operating cost of your business can be recorded as expense here.
                </p>
              </div>
              <Button 
                onClick={handleRefresh}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Button - Fixed */}
      <Button
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Dialog */}
      <AddExpenseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddExpense}
      />
    </div>
  );
};
