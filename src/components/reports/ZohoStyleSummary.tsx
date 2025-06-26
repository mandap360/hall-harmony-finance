
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, FileText, AlertCircle } from "lucide-react";

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left Column - Receivables and Payables (merged rows) */}
      <div className="lg:row-span-2">
        <Card className="h-full bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 h-full flex flex-col justify-center space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                <span className="text-lg font-semibold text-blue-800">Total Receivables</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                ₹{totalReceivables.toLocaleString()}
              </div>
            </div>
            
            <div className="border-t border-blue-200"></div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-blue-600" />
                <span className="text-lg font-semibold text-blue-800">Total Payables</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                ₹{totalPayables.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column Top - Overdue Invoices */}
      <div>
        <Card 
          className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors h-full"
          onClick={onOverdueInvoicesClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Overdue Invoices
            </CardTitle>
            <div className="text-xs text-orange-600">→</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 mb-2">
              {overdueInvoices}
            </div>
            <div className="text-xs text-orange-700">
              Pending Invoices
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column Bottom - Pending Bills */}
      <div>
        <Card 
          className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 h-full cursor-pointer hover:bg-yellow-100 transition-colors"
          onClick={onPendingBillsClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Pending Bills
            </CardTitle>
            <div className="text-xs text-yellow-600">→</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900 mb-2">
              {overdueBills}
            </div>
            <div className="text-xs text-yellow-700">
              Unpaid Bills
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
