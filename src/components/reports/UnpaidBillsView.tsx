
import { useState, useMemo } from "react";
import { ArrowLeft, FileText, Calendar, IndianRupee, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useExpenses } from "@/hooks/useExpenses";

interface UnpaidBillsViewProps {
  onBack: () => void;
}

export const UnpaidBillsView = ({ onBack }: UnpaidBillsViewProps) => {
  const { expenses } = useExpenses();
  const [selectedVendor, setSelectedVendor] = useState<string>("");

  // Group unpaid expenses by vendor
  const vendorData = useMemo(() => {
    const unpaidExpenses = expenses.filter(expense => !expense.isPaid);
    
    const groupedByVendor = unpaidExpenses.reduce((acc, expense) => {
      const vendorName = expense.vendorName || 'Unknown Vendor';
      if (!acc[vendorName]) {
        acc[vendorName] = {
          name: vendorName,
          bills: [],
          totalAmount: 0,
          billCount: 0
        };
      }
      acc[vendorName].bills.push(expense);
      acc[vendorName].totalAmount += Number(expense.totalAmount || expense.amount);
      acc[vendorName].billCount += 1;
      return acc;
    }, {} as Record<string, {
      name: string;
      bills: any[];
      totalAmount: number;
      billCount: number;
    }>);

    return Object.values(groupedByVendor);
  }, [expenses]);

  // Calculate totals across all vendors
  const totals = useMemo(() => {
    return vendorData.reduce((acc, vendor) => {
      acc.totalAmount += vendor.totalAmount;
      acc.totalBills += vendor.billCount;
      return acc;
    }, { totalAmount: 0, totalBills: 0 });
  }, [vendorData]);

  // Set first vendor as selected by default
  useState(() => {
    if (vendorData.length > 0 && !selectedVendor) {
      setSelectedVendor(vendorData[0].name);
    }
  });

  // Get bills for selected vendor
  const selectedVendorData = vendorData.find(vendor => vendor.name === selectedVendor);
  const selectedVendorBills = selectedVendorData?.bills || [];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Reports</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pending Bills</h1>
              <p className="text-gray-600">Vendor-wise unpaid bills overview</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Total Unpaid Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                {formatAmount(totals.totalAmount)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Total Unpaid Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {totals.totalBills}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Vendor Summary */}
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Vendors ({vendorData.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {vendorData.map((vendor) => (
                    <div
                      key={vendor.name}
                      onClick={() => setSelectedVendor(vendor.name)}
                      className={`p-4 cursor-pointer border-l-4 transition-all ${
                        selectedVendor === vendor.name
                          ? 'bg-blue-50 border-blue-500 shadow-sm'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {vendor.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              {vendor.billCount} bill{vendor.billCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-red-600">
                            {formatAmount(vendor.totalAmount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {vendorData.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="font-medium text-gray-900 mb-2">No Pending Bills</h3>
                      <p className="text-sm">All bills have been paid.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bill Details */}
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {selectedVendor ? `Bills for ${selectedVendor}` : 'Select a vendor'}
                  {selectedVendorData && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({selectedVendorData.billCount} bill{selectedVendorData.billCount !== 1 ? 's' : ''})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedVendorBills.length > 0 ? (
                  <div className="space-y-4">
                    {selectedVendorBills.map((bill) => (
                      <Card key={bill.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium text-gray-900">
                                  Bill #{bill.billNumber}
                                </h3>
                                <Badge variant="destructive" className="text-xs">
                                  Unpaid
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span>Date: {formatDate(bill.expenseDate)}</span>
                                </div>
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2" />
                                  <span>Category: {bill.category?.name || 'Uncategorized'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-semibold text-red-600 flex items-center">
                                <IndianRupee className="h-4 w-4" />
                                {(bill.totalAmount || bill.amount).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="font-medium text-gray-900 mb-2">
                      {selectedVendor ? 'No bills found' : 'Select a vendor'}
                    </h3>
                    <p className="text-sm">
                      {selectedVendor 
                        ? 'This vendor has no pending bills.'
                        : 'Choose a vendor from the left to view their pending bills.'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
