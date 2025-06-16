
import { useState, useMemo } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { ExpenseCard } from "@/components/ExpenseCard";
import { useExpenses } from "@/hooks/useExpenses";

export const ExpensePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { expenses, addExpense } = useExpenses();

  const expenseCategories = [
    "Office Supplies",
    "Utilities", 
    "Maintenance",
    "Marketing",
    "Food & Catering",
    "Transportation",
    "Professional Services",
    "Equipment",
    "Other"
  ];

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
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
  }, [expenses, searchQuery, selectedCategory]);

  const handleAddExpense = (expenseData: any) => {
    addExpense(expenseData);
    setShowAddDialog(false);
  };

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <p className="text-gray-600">Track your hall expenses</p>
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
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <Card className="p-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{filteredExpenses.length} expenses</p>
        </div>
      </Card>

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No expenses found</p>
          </Card>
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
