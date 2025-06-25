
import { Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpenseDateRangeFilter } from "./ExpenseDateRangeFilter";

interface ExpenseFiltersProps {
  selectedCategory: string;
  selectedVendor: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onCategoryChange: (value: string) => void;
  onVendorChange: (value: string) => void;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  expenseCategories: Array<{ id: string; name: string }>;
  vendors: Array<{ id: string; businessName: string }>;
}

export const ExpenseFilters = ({
  selectedCategory,
  selectedVendor,
  startDate,
  endDate,
  onCategoryChange,
  onVendorChange,
  onStartDateChange,
  onEndDateChange,
  expenseCategories,
  vendors
}: ExpenseFiltersProps) => {
  return (
    <div className="bg-white border-b flex-shrink-0 p-4">
      <div className="flex items-center space-x-3">
        <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
        <div className="flex-1">
          <ExpenseDateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />
        </div>
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
