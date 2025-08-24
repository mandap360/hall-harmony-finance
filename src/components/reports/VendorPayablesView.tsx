import { useState, useEffect } from "react";
import { ArrowLeft, Building, IndianRupee, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useExpenses } from "@/hooks/useExpenses";
import { FinancialYear, getCurrentFinancialYear, isInFinancialYear } from "@/utils/financialYear";

interface VendorPayablesViewProps {
  onBack: () => void;
  financialYear?: FinancialYear;
}

export const VendorPayablesView = ({ onBack, financialYear }: VendorPayablesViewProps) => {
  const { expenses } = useExpenses();
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  // Use the provided financial year or default to current
  const targetFY = financialYear || getCurrentFinancialYear();

  const unpaidExpenses = expenses.filter(expense => 
    !expense.isPaid && 
    isInFinancialYear(expense.date, targetFY) && 
    !expense.isDeleted
  );

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
            <IndianRupee className="h-5 w-5 mr-1" />
            <span className="font-bold text-xl">₹{totalPayables.toLocaleString()}</span>
          </div>
        </div>

        {Object.keys(vendorPayables).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No unpaid bills found</p>
            <p className="text-sm text-gray-400 mt-2">All expenses are paid!</p>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Vendor List Column - Fixed narrow width */}
            <div className="w-80 space-y-3">
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
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span className="font-bold text-sm">₹{data.totalAmount.toLocaleString()}</span>
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
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          Invoice #{expense.billNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(expense.date)}
                        </div>
                        <div className="flex items-center text-red-600">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          <span className="font-semibold">₹{expense.totalAmount.toLocaleString()}</span>
                        </div>
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
      </div>
    </div>
  );
};