
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface AddPaymentFormProps {
  onAddPayment: (payment: { amount: string; date: string; type: string; description: string }) => void;
}

export const AddPaymentForm = ({ onAddPayment }: AddPaymentFormProps) => {
  const [newPayment, setNewPayment] = useState({
    amount: "",
    date: "",
    type: "rent",
    description: ""
  });

  const handleAddPayment = () => {
    if (!newPayment.amount || !newPayment.date) return;
    onAddPayment(newPayment);
    setNewPayment({
      amount: "",
      date: "",
      type: "rent",
      description: ""
    });
  };

  return (
    <Card className="p-4 border-amber-200">
      <h3 className="font-semibold mb-3 text-amber-800">Add Payment</h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              value={newPayment.amount}
              onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
              className="border-amber-200 focus:border-amber-500"
            />
          </div>
          <div>
            <Label htmlFor="paymentDate">Date *</Label>
            <Input
              id="paymentDate"
              type="date"
              value={newPayment.date}
              onChange={(e) => setNewPayment(prev => ({ ...prev, date: e.target.value }))}
              className="border-amber-200 focus:border-amber-500"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="paymentType">Type</Label>
          <select
            id="paymentType"
            value={newPayment.type}
            onChange={(e) => setNewPayment(prev => ({ ...prev, type: e.target.value }))}
            className="w-full p-2 border border-amber-200 rounded-md focus:border-amber-500"
          >
            <option value="rent">Rent</option>
            <option value="additional">Additional Income</option>
          </select>
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={newPayment.description}
            onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description"
            className="border-amber-200 focus:border-amber-500"
          />
        </div>
        
        <Button
          onClick={handleAddPayment}
          disabled={!newPayment.amount || !newPayment.date}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>
    </Card>
  );
};
