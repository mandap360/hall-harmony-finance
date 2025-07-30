
import { TrendingUp, TrendingDown, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";

interface SalesExpenseSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
}

export const SalesExpenseSummary = ({ 
  totalIncome, 
  totalExpenses, 
  profit,
  incomeByCategory,
  expensesByCategory
}: SalesExpenseSummaryProps) => {
  const [showIncomeBreakdown, setShowIncomeBreakdown] = useState(false);
  const [showExpenseBreakdown, setShowExpenseBreakdown] = useState(false);
  const [expandedIncomeCategories, setExpandedIncomeCategories] = useState<Set<string>>(new Set());
  const [expandedExpenseCategories, setExpandedExpenseCategories] = useState<Set<string>>(new Set());

  const { getIncomeCategories, getExpenseCategories } = useCategories();
  const incomeCategories = getIncomeCategories();
  const expenseCategories = getExpenseCategories();

  const getParentCategories = (categories: any[], categoryData: Record<string, number>) => {
    const parentCategories = categories.filter(cat => !cat.parent_id);
    return parentCategories.map(parent => {
      const subcategories = categories.filter(cat => cat.parent_id === parent.id);
      let parentTotal = categoryData[parent.name] || 0;
      
      // Add subcategory amounts to parent total
      subcategories.forEach(sub => {
        parentTotal += categoryData[sub.name] || 0;
      });
      
      return {
        ...parent,
        total: parentTotal,
        subcategories: subcategories.map(sub => ({
          ...sub,
          total: categoryData[sub.name] || 0
        }))
      };
    }).filter(cat => cat.total !== 0).map(parent => ({
      ...parent,
      subcategories: parent.subcategories.filter(sub => sub.total !== 0)
    }));
  };

  const toggleIncomeCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedIncomeCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedIncomeCategories(newExpanded);
  };

  const toggleExpenseCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedExpenseCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedExpenseCategories(newExpanded);
  };

  const incomeParentCategories = getParentCategories(incomeCategories, incomeByCategory);
  const expenseParentCategories = getParentCategories(expenseCategories, expensesByCategory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          Income & Expense Summary
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center justify-between">
              Total Income
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIncomeBreakdown(!showIncomeBreakdown)}
                className="h-6 w-6 p-0 hover:bg-green-200"
              >
                {showIncomeBreakdown ? (
                  <ChevronUp className="h-4 w-4 text-green-700" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-green-700" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              ₹{totalIncome.toLocaleString()}
            </div>
            
            {showIncomeBreakdown && (
              <div className="mt-4 space-y-2 border-t border-green-200 pt-3">
                {incomeParentCategories.map((category) => (
                  <div key={category.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-green-800 font-medium">{category.name}</span>
                        {category.subcategories.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleIncomeCategory(category.id)}
                            className="h-4 w-4 p-0 ml-2 hover:bg-green-200"
                          >
                            {expandedIncomeCategories.has(category.id) ? (
                              <ChevronUp className="h-3 w-3 text-green-700" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-green-700" />
                            )}
                          </Button>
                        )}
                      </div>
                      <span className="text-green-900 font-medium">
                        ₹{category.total.toLocaleString()}
                      </span>
                    </div>
                    
                    {expandedIncomeCategories.has(category.id) && category.subcategories.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {category.subcategories.map((subcategory) => (
                          <div key={subcategory.id} className="flex justify-between items-center text-sm">
                            <span className="text-green-700">{subcategory.name}</span>
                            <span className="text-green-800">₹{subcategory.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {incomeParentCategories.length === 0 && (
                  <p className="text-green-600 text-sm">No income recorded</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center justify-between">
              Total Expenses
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExpenseBreakdown(!showExpenseBreakdown)}
                className="h-6 w-6 p-0 hover:bg-red-200"
              >
                {showExpenseBreakdown ? (
                  <ChevronUp className="h-4 w-4 text-red-700" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-red-700" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              ₹{totalExpenses.toLocaleString()}
            </div>
            
            {showExpenseBreakdown && (
              <div className="mt-4 space-y-2 border-t border-red-200 pt-3">
                {expenseParentCategories.map((category) => (
                  <div key={category.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-red-800 font-medium">{category.name}</span>
                        {category.subcategories.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpenseCategory(category.id)}
                            className="h-4 w-4 p-0 ml-2 hover:bg-red-200"
                          >
                            {expandedExpenseCategories.has(category.id) ? (
                              <ChevronUp className="h-3 w-3 text-red-700" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-red-700" />
                            )}
                          </Button>
                        )}
                      </div>
                      <span className="text-red-900 font-medium">
                        ₹{category.total.toLocaleString()}
                      </span>
                    </div>
                    
                    {expandedExpenseCategories.has(category.id) && category.subcategories.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {category.subcategories.map((subcategory) => (
                          <div key={subcategory.id} className="flex justify-between items-center text-sm">
                            <span className="text-red-700">{subcategory.name}</span>
                            <span className="text-red-800">₹{subcategory.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {expenseParentCategories.length === 0 && (
                  <p className="text-red-600 text-sm">No expenses recorded</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
