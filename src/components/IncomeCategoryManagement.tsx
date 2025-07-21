import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, Edit3, Menu } from "lucide-react";
import { useIncomeCategories } from "@/hooks/useIncomeCategories";
import { Switch } from "@/components/ui/switch";

export const IncomeCategoryManagement = () => {
  const { categories, addCategory, deleteCategory } = useIncomeCategories();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [showSubcategories, setShowSubcategories] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const parentCategories = categories.filter(cat => !cat.parent_id);
  const getSubCategories = (parentId: string) => categories.filter(cat => cat.parent_id === parentId);
  const allCategories = showSubcategories ? categories : parentCategories;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    addCategory({
      name: newCategoryName.trim(),
      parent_id: selectedParentId,
    });

    setNewCategoryName("");
    setSelectedParentId(null);
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-semibold">Income</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddForm(true)}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Subcategory Toggle */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Subcategory</span>
          <Switch
            checked={showSubcategories}
            onCheckedChange={setShowSubcategories}
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="p-4 space-y-2">
        {allCategories.map((category) => (
          <div key={category.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteCategory(category.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{category.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-background rounded-t-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Add New Category</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
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
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};