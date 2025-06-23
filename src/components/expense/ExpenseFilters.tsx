
import { Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExpenseFiltersProps {
  selectedCategory: string;
  selectedVendor: string;
  onCategoryChange: (value: string) => void;
  onVendorChange: (value: string) => void;
  expenseCategories: Array<{ id: string; name: string }>;
  vendors: Array<{ id: string; businessName: string }>;
}

export const ExpenseFilters = ({
  selectedCategory,
  selectedVendor,
  onCategoryChange,
  onVendorChange,
  expenseCategories,
  vendors
}: ExpenseFiltersProps) => {
  return (
    <div className="bg-white border-b flex-shrink-0 p-4">
      <div className="flex items-center space-x-3">
        <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {expenseCategories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedVendor} onValueChange={onVendorChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Vendor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            {vendors.map((vendor) => (
              <SelectItem key={vendor.id} value={vendor.businessName}>
                {vendor.businessName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
