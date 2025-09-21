
import { Filter, List, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [activeTab, setActiveTab] = useState("category");

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

  if (!showFilters) {
    return (
      <div className="bg-white border-b">
        <div className="p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFilters}
            className="h-8 w-8"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b">
      {/* Filter Toggle Button */}
      <div className="p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFilters}
          className="h-8 w-8"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabbed Filter Interface */}
      <div className="px-4 pb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="category" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Category
            </TabsTrigger>
            <TabsTrigger value="parties" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Parties
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="category" className="mt-0">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Filter by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
            </div>
          </TabsContent>

          <TabsContent value="parties" className="mt-0">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Filter by Parties</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            </div>
          </TabsContent>

          <TabsContent value="status" className="mt-0">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Filter by Status</h3>
              <div className="grid grid-cols-2 gap-3">
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
            </div>
          </TabsContent>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={onClearFilters} className="flex-1">
              Clear
            </Button>
            <Button onClick={onApplyFilters} className="flex-1">
              Apply
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
