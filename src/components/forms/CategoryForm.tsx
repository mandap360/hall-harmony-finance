import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryFormProps {
  initialName?: string;
  initialParentId?: string;
  categoryType: "income" | "expense";
  parentCategories: Array<{ id: string; name: string }>;
  onSubmit: (name: string, parentId?: string) => void;
  showParentSelect?: boolean;
}

export const CategoryForm = ({
  initialName = "",
  initialParentId = "",
  categoryType,
  parentCategories,
  onSubmit,
  showParentSelect = true,
}: CategoryFormProps) => {
  const [categoryName, setCategoryName] = useState(initialName);
  const [parentId, setParentId] = useState(initialParentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    onSubmit(categoryName.trim(), parentId || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="categoryName">Category Name</Label>
        <Input
          id="categoryName"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder={`Enter ${categoryType} category name`}
          required
        />
      </div>
      
      {showParentSelect && parentCategories.length > 0 && (
        <div>
          <Label htmlFor="parentCategory">Parent Category (Optional)</Label>
          <Select value={parentId} onValueChange={setParentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select parent category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None (Top level)</SelectItem>
              {parentCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </form>
  );
};