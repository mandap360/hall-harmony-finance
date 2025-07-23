
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Minus, Plus, Edit3, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useIncomeCategories } from "@/hooks/useIncomeCategories";
import { Switch } from "@/components/ui/switch";

export const IncomeCategoryManagement = () => {
  const { categories, addCategory, deleteCategory, updateCategory } = useIncomeCategories();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const parentCategories = categories.filter(cat => !cat.parent_id);
  const getSubCategories = (parentId: string) => categories.filter(cat => cat.parent_id === parentId);
  
  const toggleCategoryExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    addCategory({
      name: newCategoryName.trim(),
      parent_id: selectedParentId,
    });

    // Auto-expand parent category if adding subcategory
    if (selectedParentId) {
      setExpandedCategories(prev => new Set([...prev, selectedParentId]));
    }

    setNewCategoryName("");
    setSelectedParentId(null);
    setShowAddDialog(false);
  };

  const handleEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategoryName.trim() || !editingCategory) return;

    updateCategory(editingCategory.id, {
      name: editCategoryName.trim(),
    });

    setEditCategoryName("");
    setEditingCategory(null);
    setShowEditDialog(false);
  };

  const openEditDialog = (category: any) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setShowEditDialog(true);
  };

  const openAddSubcategoryDialog = (parentId: string) => {
    setSelectedParentId(parentId);
    setShowAddDialog(true);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Categories List */}
      <div className="p-4 space-y-2">
        {parentCategories.map((category) => {
          const subCategories = getSubCategories(category.id);
          const isExpanded = expandedCategories.has(category.id);
          const hasSubCategories = subCategories.length > 0;
          
          return (
            <div key={category.id} className="space-y-2">
              {/* Parent Category */}
              <div className="group flex items-center justify-between p-3 bg-background rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-muted-foreground"
                    onClick={() => openAddSubcategoryDialog(category.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-muted-foreground"
                    onClick={() => openEditDialog(category)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  {hasSubCategories && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground"
                      onClick={() => toggleCategoryExpanded(category.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCategory(category.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Subcategories */}
              {isExpanded && subCategories.map((subCategory) => (
                <div key={subCategory.id} className="group flex items-center justify-between p-3 bg-background rounded-lg border ml-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-0.5 bg-green-500 flex-shrink-0"></div>
                    <span className="text-sm font-medium">{subCategory.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground"
                      onClick={() => openEditDialog(subCategory)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCategory(subCategory.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCategory} className="space-y-4">
            <div>
              <Label htmlFor="editCategoryName">Category Name</Label>
              <Input
                id="editCategoryName"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Floating Add Button */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
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
                onClick={() => setShowAddDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
