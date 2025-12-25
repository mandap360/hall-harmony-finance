import { useState, useEffect } from "react";
import { ArrowLeft, Building, Edit, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useExpenses } from "@/hooks/useExpenses";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { EditExpenseDialog } from "@/components/expense/EditExpenseDialog";
import { getCurrentFY } from "./FinancialYearCalculator";

interface VendorPayablesViewProps {
  onBack: () => void;
  selectedFY?: { startYear: number; endYear: number };
}

export const VendorPayablesView = ({ onBack, selectedFY }: VendorPayablesViewProps) => {
  const { expenses, updateExpense } = useExpenses();
  const { addTransaction } = useTransactions();
  const { getExpenseCategories } = useCategories();
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  
  const targetFY = selectedFY || getCurrentFY();
  const expenseCategories = getExpenseCategories();

  // Filter unpaid expenses from selected FY and previous years (exclude future FY)
  const unpaidExpenses = expenses.filter(expense => {
    if (expense.isPaid) return false;
    
    // Check if expense is from selected FY or previous years (exclude future FY)
    const expenseDate = new Date(expense.date);
    const expenseYear = expenseDate.getFullYear();
    const expenseMonth = expenseDate.getMonth();
    
    // Calculate expense FY
    let expenseFY;
    if (expenseMonth >= 3) { // April onwards (month is 0-indexed, so March = 2, April = 3)
      expenseFY = { startYear: expenseYear, endYear: expenseYear + 1 };
    } else { // January to March
      expenseFY = { startYear: expenseYear - 1, endYear: expenseYear };
    }
    
    // Only include current FY and previous years, exclude future FY
    return expenseFY.endYear < targetFY.endYear || 
           (expenseFY.startYear === targetFY.startYear && expenseFY.endYear === targetFY.endYear);
  });

  // Group unpaid expenses by vendor
  const vendorPayables = unpaidExpenses.reduce((acc, expense) => {
    if (!acc[expense.vendorName]) {
      acc[expense.vendorName] = {
        totalAmount: 0,
        expenses: []
      };
    }
    acc[expense.vendorName].totalAmount += expense.totalAmount;
    acc[expense.vendorName].expenses.push(expense);
    return acc;
  }, {} as Record<string, { totalAmount: number; expenses: any[] }>);

  const totalPayables = Object.values(vendorPayables).reduce((sum, vendor) => sum + vendor.totalAmount, 0);
  const vendorNames = Object.keys(vendorPayables);
  
  // Auto-select first vendor when page loads
  useEffect(() => {
    if (!selectedVendor && vendorNames.length > 0) {
      setSelectedVendor(vendorNames[0]);
    }
  }, [vendorNames, selectedVendor]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleEditExpense = (expense: any) => {
    setSelectedExpense(expense);
    setShowEditDialog(true);
  };

  const handleUpdateExpense = async (expenseData: any) => {
    if (selectedExpense) {
      await updateExpense(expenseData);
    }
  };

  const handleRecordPayment = async (expenseId: string, accountId: string, paymentDate: string) => {
    // TODO: Transaction recording temporarily disabled during schema migration
    // Will be re-enabled once new transaction schema is fully integrated
    console.log('Payment recorded for expense:', expenseId, 'to account:', accountId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Payables</h2>
          <div className="flex items-center text-red-600">
            <span className="font-bold text-xl">₹{totalPayables.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {Object.keys(vendorPayables).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No unpaid bills found</p>
            <p className="text-sm text-gray-400 mt-2">All expenses are paid!</p>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Vendor List Column - Reduced width */}
            <div className="w-64 space-y-3">
              {Object.entries(vendorPayables).map(([vendorName, data]) => (
                <Card 
                  key={vendorName} 
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedVendor === vendorName 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVendor(vendorName)}
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {vendorName}
                    </h4>
                    <div className="flex items-center text-red-600">
                      <span className="font-bold text-sm">₹{data.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Bills Column - Takes remaining space */}
            <div className="flex-1 space-y-4">
              {selectedVendor && vendorPayables[selectedVendor] ? (
                <div className="space-y-3">
                  {vendorPayables[selectedVendor].expenses.map((expense) => (
                    <Card key={expense.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                           <div className="flex items-center gap-2">
                             <span className="text-sm font-medium">Invoice: {expense.billNumber || 'N/A'}</span>
                              <Badge variant="secondary" className="text-xs">
                                {expense.category}
                              </Badge>
                           </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(expense.date)}
                          </div>
                          <div className="flex items-center text-red-600">
                            <span className="font-semibold">₹{expense.totalAmount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExpense(expense)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select a vendor to view their unpaid bills
                </div>
              )}
            </div>
          </div>
        )}

        <EditExpenseDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          expense={selectedExpense}
          onUpdateExpense={handleUpdateExpense}
          onRecordPayment={handleRecordPayment}
        />
      </div>
    </div>
  );
};