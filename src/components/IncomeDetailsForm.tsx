import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIncomeCategories } from "@/hooks/useIncomeCategories";

interface IncomeData {
  source: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
}

interface IncomeDetailsFormProps {
  onSubmit: (data: IncomeData) => void;
  onCancel: () => void;
}

export const IncomeDetailsForm = ({ onSubmit, onCancel }: IncomeDetailsFormProps) => {
  const { incomeCategories } = useIncomeCategories();

  const [formData, setFormData] = useState({
    source: "",
    category: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.source || !formData.category || !formData.amount) {
      return;
    }

    onSubmit({
      source: formData.source,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="source">
          Income Source <span className="text-destructive">*</span>
        </Label>
        <Input
          id="source"
          value={formData.source}
          onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
          placeholder="e.g., Client Name, Business Name"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select 
          value={formData.category} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select income category" />
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
        <Label htmlFor="amount">
          Amount <span className="text-destructive">*</span>
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <Label htmlFor="date">
          Date <span className="text-destructive">*</span>
        </Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Optional description"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Add Income
        </Button>
      </div>
    </form>
  );
};