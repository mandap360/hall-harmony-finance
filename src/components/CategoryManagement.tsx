
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

export const CategoryManagement = () => {
  const { categories, addCategory, deleteCategory, getIncomeCategories, getExpenseCategories } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"income" | "expense">("expense");

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    addCategory({
      name: newCategoryName.trim(),
      type: newCategoryType,
    });

    setNewCategoryName("");
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        <p className="text-gray-600">Manage income and expense categories</p>
      </div>

      {/* Add New Category */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Add New Category</h3>
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
              required
            />
          </div>
          <div>
            <Label htmlFor="categoryType">Category Type</Label>
            <Select value={newCategoryType} onValueChange={(value: "income" | "expense") => setNewCategoryType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </form>
      </Card>

      {/* Income Categories */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Income Categories</h3>
        <div className="space-y-2">
          {getIncomeCategories().map((category) => (
            <div key={category.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span>{category.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteCategory(category.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Expense Categories */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Expense Categories</h3>
        <div className="space-y-2">
          {getExpenseCategories().map((category) => (
            <div key={category.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
              <span>{category.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteCategory(category.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
