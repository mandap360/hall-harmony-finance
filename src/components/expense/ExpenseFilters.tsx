
import { Filter, List, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ExpenseFiltersProps {
  selectedCategories: string[];
  selectedVendors: string[];
  selectedStatuses: string[];
  onCategoriesChange: (categories: string[]) => void;
  onVendorsChange: (vendors: string[]) => void;
  onStatusesChange: (statuses: string[]) => void;
  expenseCategories: any[];
  vendors: any[];
  showFilters: boolean;
  onToggleFilters: () => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export const ExpenseFilters = ({
  selectedCategories,
  selectedVendors,
  selectedStatuses,
  onCategoriesChange,
  onVendorsChange,
  onStatusesChange,
  expenseCategories,
  vendors,
  showFilters,
  onToggleFilters,
  onApplyFilters,
  onClearFilters
}: ExpenseFiltersProps) => {
  const handleCategoryToggle = (categoryName: string) => {
    const isSelected = selectedCategories.includes(categoryName);
    if (isSelected) {
      onCategoriesChange(selectedCategories.filter(c => c !== categoryName));
    } else {
      onCategoriesChange([...selectedCategories, categoryName]);
    }
  };

  const handleVendorToggle = (vendorName: string) => {
    const isSelected = selectedVendors.includes(vendorName);
    if (isSelected) {
      onVendorsChange(selectedVendors.filter(v => v !== vendorName));
    } else {
      onVendorsChange([...selectedVendors, vendorName]);
    }
  };

  const handleStatusToggle = (status: string) => {
    const isSelected = selectedStatuses.includes(status);
    if (isSelected) {
      onStatusesChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusesChange([...selectedStatuses, status]);
    }
  };

  return (
    <div className="bg-white border-b">
      <div className="p-4 flex items-center gap-2">
        {/* Blue Circle Filter Icon */}
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <Filter className="h-4 w-4 text-white" />
        </div>

        {/* Category Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Category
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Filter by Category</h3>
              <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                {expenseCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.name)}
                      onCheckedChange={() => handleCategoryToggle(category.name)}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  onClick={onClearFilters} 
                  className="flex-1"
                  size="sm"
                >
                  Clear
                </Button>
                <Button 
                  onClick={onApplyFilters} 
                  className="flex-1"
                  size="sm"
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Parties Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Parties
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Filter by Parties</h3>
              <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`vendor-${vendor.id}`}
                      checked={selectedVendors.includes(vendor.businessName)}
                      onCheckedChange={() => handleVendorToggle(vendor.businessName)}
                    />
                    <label
                      htmlFor={`vendor-${vendor.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {vendor.businessName}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  onClick={onClearFilters} 
                  className="flex-1"
                  size="sm"
                >
                  Clear
                </Button>
                <Button 
                  onClick={onApplyFilters} 
                  className="flex-1"
                  size="sm"
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Status Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Status
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Filter by Status</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-paid"
                    checked={selectedStatuses.includes("paid")}
                    onCheckedChange={() => handleStatusToggle("paid")}
                  />
                  <label
                    htmlFor="status-paid"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Completed
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-unpaid"
                    checked={selectedStatuses.includes("unpaid")}
                    onCheckedChange={() => handleStatusToggle("unpaid")}
                  />
                  <label
                    htmlFor="status-unpaid"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Pending
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  onClick={onClearFilters} 
                  className="flex-1"
                  size="sm"
                >
                  Clear
                </Button>
                <Button 
                  onClick={onApplyFilters} 
                  className="flex-1"
                  size="sm"
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
