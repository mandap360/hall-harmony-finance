import { useState, useEffect } from "react";
import { ArrowLeft, Building, IndianRupee, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useExpenses } from "@/hooks/useExpenses";

interface VendorPayablesViewProps {
  onBack: () => void;
}

export const VendorPayablesView = ({ onBack }: VendorPayablesViewProps) => {
  const { expenses } = useExpenses();
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  const unpaidExpenses = expenses.filter(expense => !expense.isPaid);

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

  if (selectedVendor) {
    const vendorExpenses = vendorPayables[selectedVendor]?.expenses || [];
    
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedVendor(null)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vendors
            </Button>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Unpaid Bills - {selectedVendor}
          </h2>

          <div className="space-y-4">
            {vendorExpenses.map((expense) => (
              <Card key={expense.id} className="p-6 border-red-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Building className="h-4 w-4 mr-2" />
                      <span className="text-sm">{expense.category}</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      Bill #{expense.billNumber} • {formatDate(expense.date)}
                    </div>
                    <div className="flex items-center text-red-600">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span className="font-semibold">₹{expense.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendor List Column */}
            <div className="space-y-4">
              {Object.entries(vendorPayables).map(([vendorName, data]) => (
                <Card 
                  key={vendorName} 
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedVendor === vendorName 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVendor(vendorName)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {vendorName}
                      </h4>
                    </div>
                    <div className="flex items-center text-red-600">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span className="font-bold">₹{data.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Bills Column */}
            <div className="space-y-4">
              {selectedVendor && vendorPayables[selectedVendor] && (
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};