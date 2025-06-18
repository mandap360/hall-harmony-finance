
import { useState, useMemo } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { ExpenseCard } from "@/components/ExpenseCard";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useVendors } from "@/hooks/useVendors";

export const ExpensePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { expenses, addExpense } = useExpenses();
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

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.vendorName.toLowerCase().includes(query) ||
        expense.billNumber.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchQuery, selectedCategory, selectedVendor, currentFY]);

  const handleAddExpense = (expenseData: any) => {
    addExpense(expenseData);
    setShowAddDialog(false);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <p className="text-gray-600">Track your hall expenses</p>
        <p className="text-sm text-gray-500">
          FY {currentFY.startYear}-{currentFY.endYear.toString().slice(-2)}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filter by category" />
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
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={selectedVendor} onValueChange={setSelectedVendor}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filter by vendor" />
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

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No expenses found for current FY
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </div>

      {/* Add Button */}
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
