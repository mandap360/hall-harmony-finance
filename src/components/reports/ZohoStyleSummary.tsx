
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, FileText, AlertCircle } from "lucide-react";

interface ZohoStyleSummaryProps {
  totalReceivables: number;
  totalPayables: number;
  overdueInvoices: number;
  overdueBills: number;
  onPayablesClick?: () => void;
}

export const ZohoStyleSummary = ({
  totalReceivables,
  totalPayables,
  overdueInvoices,
  overdueBills,
  onPayablesClick
}: ZohoStyleSummaryProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Receivables and Payables */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-blue-800 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Total Receivables
            </CardTitle>
            <div className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded">
              ↓
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              ₹{totalReceivables.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={onPayablesClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-red-800 flex items-center">
              <TrendingDown className="h-5 w-5 mr-2" />
              Total Payables
            </CardTitle>
            <div className="text-xs text-red-600 bg-red-200 px-2 py-1 rounded">
              ↓
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">
              ₹{totalPayables.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Overdue Items */}
      <div className="space-y-4">
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Overdue Invoices
            </CardTitle>
            <div className="text-xs text-orange-600">→</div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-900 mb-2">
              {overdueInvoices}
            </div>
            <div className="text-xs text-orange-700">
              Pending Invoices
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Overdue Bills
            </CardTitle>
            <div className="text-xs text-yellow-600">→</div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-900 mb-2">
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
