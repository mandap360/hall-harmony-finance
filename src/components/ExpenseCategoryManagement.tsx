import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ChevronRight, ChevronDown } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const ExpenseCategoryManagement = () => {
  const { getExpenseCategories, addCategory, deleteCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const categories = getExpenseCategories();
  const parentCategories = categories.filter(cat => !cat.parent_id);
  const getSubCategories = (parentId: string) => categories.filter(cat => cat.parent_id === parentId);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    addCategory({
      name: newCategoryName.trim(),
      type: "expense",
      parent_id: selectedParentId,
    });

    setNewCategoryName("");
    setSelectedParentId(null);
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">Expense Category Management</h1>
        <p className="text-muted-foreground">Manage expense categories and subcategories</p>
      </div>

      {/* Add New Category */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 text-primary">Add New Category</h3>
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
            <Label htmlFor="parentCategory">Parent Category (Optional)</Label>
            <Select value={selectedParentId || ""} onValueChange={(value) => setSelectedParentId(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent category or leave blank for main category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (Main Category)</SelectItem>
                {parentCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </form>
      </Card>

      {/* Categories List */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 text-primary">Expense Categories</h3>
        <div className="space-y-2">
          {parentCategories.map((category) => {
            const subCategories = getSubCategories(category.id);
            const isExpanded = expandedCategories.has(category.id);
            
            return (
              <div key={category.id} className="border rounded-lg">
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(category.id)}>
                  <div className="flex justify-between items-center p-3 bg-primary/5 rounded-t-lg">
                    <div className="flex items-center space-x-2">
                      {subCategories.length > 0 && (
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-0 h-auto">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      )}
                      <span className="font-medium">{category.name}</span>
                      {subCategories.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          ({subCategories.length} subcategories)
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCategory(category.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {subCategories.length > 0 && (
                    <CollapsibleContent className="border-t">
                      <div className="p-2 space-y-1">
                        {subCategories.map((subCategory) => (
                          <div key={subCategory.id} className="flex justify-between items-center p-2 ml-6 bg-background rounded">
                            <span className="text-sm">{subCategory.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCategory(subCategory.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};