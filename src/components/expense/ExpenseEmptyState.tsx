
import { RefreshCcw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpenseEmptyStateProps {
  onRefresh: () => void;
}

export const ExpenseEmptyState = ({ onRefresh }: ExpenseEmptyStateProps) => {
  return (
    <div className="text-center py-16 space-y-6">
      <div className="flex justify-center">
        <div className="relative">
          <FileText className="h-16 w-16 text-gray-400" />
          <div className="absolute -top-2 -right-1 w-6 h-6 bg-gray-300 rounded-full border-2 border-white transform rotate-45"></div>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Record Business Expenses</h3>
        <p className="text-gray-600 max-w-sm mx-auto">
          The operating cost of your business can be recorded as expense here.
        </p>
      </div>
      <Button 
        onClick={onRefresh}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <RefreshCcw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );
};
