
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp } from "lucide-react";

export const ExpensePage = () => {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <p className="text-gray-600">Track your hall expenses</p>
      </div>

      <Card className="p-8 text-center">
        <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Coming Soon</h3>
        <p className="text-gray-500">Expense tracking features will be available here</p>
      </Card>
    </div>
  );
};
