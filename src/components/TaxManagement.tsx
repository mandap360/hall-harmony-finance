
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useTax } from "@/hooks/useTax";

export const TaxManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTax, setNewTax] = useState({ name: "", percentage: "" });
  const { taxRates, addTaxRate, deleteTaxRate } = useTax();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTax.name || !newTax.percentage) return;

    addTaxRate({
      name: newTax.name,
      percentage: parseFloat(newTax.percentage),
    });

    setNewTax({ name: "", percentage: "" });
    setShowAddForm(false);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tax Management</h2>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Tax Rate
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="taxName">Tax Name</Label>
              <Input
                id="taxName"
                value={newTax.name}
                onChange={(e) => setNewTax({ ...newTax, name: e.target.value })}
                placeholder="e.g., GST 28%"
                required
              />
            </div>
            <div>
              <Label htmlFor="taxPercentage">Percentage</Label>
              <Input
                id="taxPercentage"
                type="number"
                step="0.01"
                value={newTax.percentage}
                onChange={(e) => setNewTax({ ...newTax, percentage: e.target.value })}
                placeholder="e.g., 28"
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit">Add</Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {taxRates.map((tax) => (
          <Card key={tax.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{tax.name}</h3>
                <p className="text-sm text-gray-600">{tax.percentage}%</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteTaxRate(tax.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
