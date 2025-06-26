
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface ZohoStyleSummaryProps {
  totalReceivables: number;
  totalPayables: number;
  overdueInvoices: number;
  overdueBills: number;
  onOverdueInvoicesClick?: () => void;
  onPendingBillsClick?: () => void;
}

export const ZohoStyleSummary = ({
  totalReceivables,
  totalPayables,
  overdueInvoices,
  overdueBills,
  onOverdueInvoicesClick,
  onPendingBillsClick
}: ZohoStyleSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Receivables and Payables */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                <span className="text-lg font-semibold text-blue-800">Total Receivables</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                ₹{totalReceivables.toLocaleString()}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-blue-600" />
                <span className="text-lg font-semibold text-blue-800">Total Payables</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                ₹{totalPayables.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Invoices and Pending Bills Column */}
      <div className="space-y-4">
        {/* Overdue Invoices */}
        <Card 
          className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors"
          onClick={onOverdueInvoicesClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-lg font-semibold text-orange-800">Overdue Invoices</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {overdueInvoices}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Bills */}
        <Card 
          className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
          onClick={onPendingBillsClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-purple-600" />
                <span className="text-lg font-semibold text-purple-800">Pending Bills</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {overdueBills}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
