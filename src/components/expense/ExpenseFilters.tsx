
import { Filter, List, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [activeTab, setActiveTab] = useState<string | null>(null);

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

  const handleTabClick = (tab: string) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const handleApply = () => {
    setActiveTab(null);
    onApplyFilters();
  };

  const handleClear = () => {
    setActiveTab(null);
    onClearFilters();
  };

  return (
    <div className="bg-white border-b">
      {/* Filter Icon and Tab Buttons in Same Line */}
      <div className="p-4 flex items-center gap-2">
        {/* Blue Circle Filter Icon */}
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <Filter className="h-4 w-4 text-white" />
        </div>

        {/* Tab Buttons */}
        <Button
          variant={activeTab === "category" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleTabClick("category")}
          className="flex items-center gap-2"
        >
          <List className="h-4 w-4" />
          Category
        </Button>
        
        <Button
          variant={activeTab === "parties" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleTabClick("parties")}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Parties
        </Button>
        
        <Button
          variant={activeTab === "status" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleTabClick("status")}
          className="flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Status
        </Button>
      </div>

      {/* Filter Content */}
      {activeTab === "category" && (
        <div className="px-4 pb-4">
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
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={handleClear} className="flex-1">
                Clear
              </Button>
              <Button onClick={handleApply} className="flex-1">
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "parties" && (
        <div className="px-4 pb-4">
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
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={handleClear} className="flex-1">
                Clear
              </Button>
              <Button onClick={handleApply} className="flex-1">
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "status" && (
        <div className="px-4 pb-4">
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
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={handleClear} className="flex-1">
                Clear
              </Button>
              <Button onClick={handleApply} className="flex-1">
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
