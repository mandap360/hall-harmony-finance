
import { useState } from "react";
import { ArrowLeft, Calendar, Building, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useExpenses } from "@/hooks/useExpenses";

interface UnpaidBillsViewProps {
  onBack: () => void;
}

export const UnpaidBillsView = ({ onBack }: UnpaidBillsViewProps) => {
  const { expenses } = useExpenses();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const unpaidExpenses = expenses.filter(expense => !expense.isPaid);
  const totalUnpaidAmount = unpaidExpenses.reduce((sum, expense) => sum + expense.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
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
          <h2 className="text-2xl font-bold text-gray-900">Pending Bills</h2>
          <div className="flex items-center text-red-600 font-bold text-xl">
            <IndianRupee className="h-5 w-5 mr-1" />
            <span>₹{totalUnpaidAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-4">
          {unpaidExpenses.map((expense) => (
            <Card key={expense.id} className="p-6 border-red-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {expense.vendorName}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-1">
                    <Building className="h-4 w-4 mr-2" />
                    <span className="text-sm">{expense.category}</span>
                  </div>
                  <div className="flex items-center text-gray-700 mb-3">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">{formatDate(expense.date)}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-red-600">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span className="font-semibold">₹{expense.totalAmount.toLocaleString()}</span>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Unpaid
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {unpaidExpenses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No pending bills found</p>
              <p className="text-sm text-gray-400 mt-2">All expenses are paid!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
