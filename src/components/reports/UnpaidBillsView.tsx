
import { ArrowLeft, Building2, FileText, IndianRupee, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useExpenses } from "@/hooks/useExpenses";
import { useVendors } from "@/hooks/useVendors";
import { useState } from "react";

interface UnpaidBillsViewProps {
  onBack: () => void;
}

export const UnpaidBillsView = ({ onBack }: UnpaidBillsViewProps) => {
  const { expenses } = useExpenses();
  const { vendors } = useVendors();
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  const unpaidExpenses = expenses.filter(expense => !expense.isPaid);
  
  // Group expenses by vendor
  const expensesByVendor = unpaidExpenses.reduce((acc, expense) => {
    if (!acc[expense.vendorName]) {
      acc[expense.vendorName] = [];
    }
    acc[expense.vendorName].push(expense);
    return acc;
  }, {} as Record<string, typeof unpaidExpenses>);

  const vendorNames = Object.keys(expensesByVendor);
  const selectedVendorExpenses = selectedVendor ? expensesByVendor[selectedVendor] || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Unpaid Bills</h1>
        </div>

        {vendorNames.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Unpaid Bills</h3>
              <p className="text-gray-500">All bills have been paid!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-12 gap-2 sm:gap-4 h-[calc(100vh-8rem)]">
            {/* Vendor List - Always on left */}
            <div className="col-span-4 md:col-span-5">
              <Card className="h-full">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                    <span className="hidden sm:inline">Vendors</span>
                    <span className="sm:hidden">Vendors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-6 pt-0">
                  <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                    {vendorNames.map((vendorName) => {
                      const vendorExpenses = expensesByVendor[vendorName];
                      const totalAmount = vendorExpenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
                      const billCount = vendorExpenses.length;
                      
                      return (
                        <div
                          key={vendorName}
                          onClick={() => setSelectedVendor(vendorName)}
                          className={`p-2 sm:p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedVendor === vendorName
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate" title={vendorName}>
                            {vendorName}
                          </h3>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center text-xs sm:text-sm text-gray-600">
                              <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="font-medium">{totalAmount.toLocaleString()}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {billCount} bill{billCount !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bills List - Always on right */}
            <div className="col-span-8 md:col-span-7">
              <Card className="h-full">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-600" />
                    <span className="hidden sm:inline">
                      {selectedVendor ? `Bills from ${selectedVendor}` : 'Select a vendor to view bills'}
                    </span>
                    <span className="sm:hidden">
                      {selectedVendor ? 'Bills' : 'Select vendor'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-6 pt-0">
                  {selectedVendor ? (
                    <div className="space-y-2 sm:space-y-3 max-h-[70vh] overflow-y-auto">
                      {selectedVendorExpenses.map((expense) => (
                        <div key={expense.id} className="p-2 sm:p-4 bg-white border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                Bill #{expense.billNumber}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {expense.vendorName}
                              </p>
                            </div>
                            <div className="flex items-center text-red-600 ml-2">
                              <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="font-bold text-sm sm:text-base">
                                {expense.totalAmount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <span>{new Date(expense.expenseDate).toLocaleDateString()}</span>
                            </div>
                            <Badge variant="destructive" className="text-xs">
                              Unpaid
                            </Badge>
                          </div>
                          
                          {expense.gstPercentage > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="text-xs text-gray-600 space-y-1">
                                <div className="flex justify-between">
                                  <span>Amount:</span>
                                  <span>₹{expense.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>GST ({expense.gstPercentage}%):</span>
                                  <span>₹{((expense.totalAmount - expense.amount)).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <Building2 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 text-gray-300" />
                        <p className="text-sm sm:text-base">Select a vendor to view their unpaid bills</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
