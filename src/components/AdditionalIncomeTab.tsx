
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, IndianRupee } from "lucide-react";
import { useAdditionalIncome } from "@/hooks/useAdditionalIncome";
import { useIncomeCategories } from "@/hooks/useIncomeCategories";

interface AdditionalIncomeTabProps {
  bookingId: string;
}

export const AdditionalIncomeTab = ({ bookingId }: AdditionalIncomeTabProps) => {
  const { additionalIncomes, loading, fetchAdditionalIncomes, addAdditionalIncome, deleteAdditionalIncome } = useAdditionalIncome();
  const { incomeCategories } = useIncomeCategories();
  
  const [newIncome, setNewIncome] = useState({
    category: "",
    amount: "",
  });

  useEffect(() => {
    if (bookingId) {
      fetchAdditionalIncomes(bookingId);
    }
  }, [bookingId]);

  const handleAddIncome = async () => {
    if (!newIncome.category || !newIncome.amount) return;

    const success = await addAdditionalIncome(bookingId, newIncome.category, parseInt(newIncome.amount));
    if (success) {
      setNewIncome({ category: "", amount: "" });
    }
  };

  const handleDeleteIncome = async (id: string) => {
    await deleteAdditionalIncome(id);
  };

  const totalAdditionalIncome = additionalIncomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div className="text-center">
          <div className="flex items-center justify-center text-amber-700 mb-1">
            <IndianRupee className="h-5 w-5" />
            <span className="text-2xl font-bold">{totalAdditionalIncome.toLocaleString()}</span>
          </div>
          <p className="text-sm text-amber-600">Total Additional Income</p>
        </div>
      </Card>

      {/* Add New Income */}
      <Card className="p-6 border-orange-200">
        <h3 className="font-semibold mb-4 text-gray-800 flex items-center">
          <Plus className="h-5 w-5 mr-2 text-amber-600" />
          Add Additional Income
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category" className="text-gray-700">Income Category *</Label>
            <Select value={newIncome.category} onValueChange={(value) => setNewIncome(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="border-amber-200 focus:border-amber-500">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {incomeCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount" className="text-gray-700">Amount *</Label>
            <Input
              id="amount"
              type="number"
              value={newIncome.amount}
              onChange={(e) => setNewIncome(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="Enter amount"
              className="border-amber-200 focus:border-amber-500"
            />
          </div>
        </div>
        <Button
          onClick={handleAddIncome}
          disabled={!newIncome.category || !newIncome.amount || loading}
          className="w-full mt-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Income
        </Button>
      </Card>

      {/* Income List */}
      {additionalIncomes.length > 0 && (
        <Card className="p-6 border-orange-200">
          <h3 className="font-semibold mb-4 text-gray-800">Additional Income Items</h3>
          <div className="space-y-3">
            {additionalIncomes.map((income) => (
              <div key={income.id} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div>
                  <p className="font-medium text-gray-800">{income.category}</p>
                  <div className="flex items-center text-amber-700 mt-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-semibold">{income.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Added on {new Date(income.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteIncome(income.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {additionalIncomes.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <Plus className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No additional income items added yet</p>
          <p className="text-sm">Add income items like electricity, gas, decoration charges, etc.</p>
        </div>
      )}
    </div>
  );
};
