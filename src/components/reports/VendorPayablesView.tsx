
import { useState } from "react";
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
      <div className="max-w-4xl mx-auto">
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

        <div className="space-y-4">
          {Object.entries(vendorPayables).map(([vendorName, data]) => (
            <Card 
              key={vendorName} 
              className="p-6 border-red-200 cursor-pointer hover:bg-red-50 transition-colors"
              onClick={() => setSelectedVendor(vendorName)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {vendorName}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {data.expenses.length} unpaid bill{data.expenses.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-red-600">
                    <IndianRupee className="h-5 w-5 mr-1" />
                    <span className="font-bold text-xl">₹{data.totalAmount.toLocaleString()}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Card>
          ))}

          {Object.keys(vendorPayables).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No unpaid bills found</p>
              <p className="text-sm text-gray-400 mt-2">All expenses are paid!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
