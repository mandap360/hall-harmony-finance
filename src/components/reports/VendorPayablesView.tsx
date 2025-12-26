import { useState, useEffect } from "react";
import { ArrowLeft, Building, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccounts } from "@/hooks/useAccounts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentFY } from "./FinancialYearCalculator";

interface VendorPayablesViewProps {
  onBack: () => void;
  selectedFY?: { startYear: number; endYear: number };
}

interface UnpaidPurchase {
  id: string;
  amount: number;
  voucher_date: string;
  description: string;
  party_id: string;
  vendorName: string;
}

export const VendorPayablesView = ({ onBack, selectedFY }: VendorPayablesViewProps) => {
  const { accounts } = useAccounts();
  const { profile } = useAuth();
  const partyAccounts = accounts.filter(acc => acc.account_type === 'party');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [unpaidPurchases, setUnpaidPurchases] = useState<UnpaidPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  
  const targetFY = selectedFY || getCurrentFY();

  useEffect(() => {
    const fetchUnpaidPurchases = async () => {
      if (!profile?.organization_id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select('id, amount, voucher_date, description, party_id')
          .eq('organization_id', profile.organization_id)
          .eq('voucher_type', 'purchase')
          .eq('is_financial_transaction', false)
          .order('voucher_date', { ascending: false });

        if (error) throw error;

        // Filter by FY and map party_id to vendor names
        const filteredPurchases = (data || []).filter(purchase => {
          const purchaseDate = new Date(purchase.voucher_date);
          const purchaseYear = purchaseDate.getFullYear();
          const purchaseMonth = purchaseDate.getMonth();
          
          // Calculate purchase FY
          let purchaseFY;
          if (purchaseMonth >= 3) { // April onwards
            purchaseFY = { startYear: purchaseYear, endYear: purchaseYear + 1 };
          } else { // January to March
            purchaseFY = { startYear: purchaseYear - 1, endYear: purchaseYear };
          }
          
          // Only include current FY and previous years, exclude future FY
          return purchaseFY.endYear <= targetFY.endYear;
        });

        const purchasesWithVendorNames = filteredPurchases.map(purchase => {
          const vendor = partyAccounts.find(acc => acc.id === purchase.party_id);
          return {
            ...purchase,
            vendorName: vendor?.name || 'Unknown Vendor'
          };
        });

        setUnpaidPurchases(purchasesWithVendorNames);
      } catch (error) {
        console.error('Error fetching unpaid purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnpaidPurchases();
  }, [profile?.organization_id, partyAccounts, targetFY]);

  // Group unpaid purchases by vendor
  const vendorPayables = unpaidPurchases.reduce((acc, purchase) => {
    if (!acc[purchase.vendorName]) {
      acc[purchase.vendorName] = {
        totalAmount: 0,
        purchases: []
      };
    }
    acc[purchase.vendorName].totalAmount += purchase.amount;
    acc[purchase.vendorName].purchases.push(purchase);
    return acc;
  }, {} as Record<string, { totalAmount: number; purchases: UnpaidPurchase[] }>);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
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
                  {vendorPayables[selectedVendor].purchases.map((purchase) => (
                    <Card key={purchase.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                           <div className="flex items-center gap-2">
                             <span className="text-sm font-medium">{purchase.description || 'Purchase'}</span>
                              <Badge variant="secondary" className="text-xs">
                                Unpaid
                              </Badge>
                           </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(purchase.voucher_date)}
                          </div>
                          <div className="flex items-center text-red-600">
                            <span className="font-semibold">₹{purchase.amount.toLocaleString('en-IN')}</span>
                          </div>
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
