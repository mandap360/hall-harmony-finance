
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesExpenseSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  profit: number;
}

export const SalesExpenseSummary = ({ totalIncome, totalExpenses, profit }: SalesExpenseSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium opacity-90">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 opacity-90" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{totalIncome.toLocaleString()}
          </div>
          <p className="text-xs opacity-80">Actual payments received</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium opacity-90">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 opacity-90" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{totalExpenses.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card className={`bg-gradient-to-r ${profit >= 0 
        ? 'from-cyan-500 to-blue-600' 
        : 'from-orange-500 to-red-600'} text-white`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium opacity-90">
            {profit >= 0 ? 'Profit' : 'Loss'}
          </CardTitle>
          <DollarSign className="h-4 w-4 opacity-90" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{Math.abs(profit).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
