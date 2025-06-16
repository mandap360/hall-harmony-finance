
import { Card } from "@/components/ui/card";
import { BarChart3, PieChart } from "lucide-react";

export const ReportsPage = () => {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Financial insights and analytics</p>
      </div>

      <Card className="p-8 text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Coming Soon</h3>
        <p className="text-gray-500">Detailed reports and analytics will be available here</p>
      </Card>
    </div>
  );
};
