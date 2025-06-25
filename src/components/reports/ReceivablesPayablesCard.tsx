
import { TrendingUp, TrendingDown } from "lucide-react";

interface ReceivablesPayablesCardProps {
  totalReceivables: number;
  totalPayables: number;
}

export const ReceivablesPayablesCard = ({ 
  totalReceivables, 
  totalPayables 
}: ReceivablesPayablesCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Receivables & Payables
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-green-600 mr-1" />
            <span className="text-sm font-medium text-green-800">Receivables</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            ₹{totalReceivables.toLocaleString()}
          </div>
        </div>
        
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <TrendingDown className="h-5 w-5 text-red-600 mr-1" />
            <span className="text-sm font-medium text-red-800">Payables</span>
          </div>
          <div className="text-2xl font-bold text-red-900">
            ₹{totalPayables.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};
