
import { CalendarIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ExpenseFiltersProps {
  selectedCategory: string;
  selectedVendor: string;
  paymentStatus: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onCategoryChange: (category: string) => void;
  onVendorChange: (vendor: string) => void;
  onPaymentStatusChange: (status: string) => void;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  expenseCategories: any[];
  vendors: any[];
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const ExpenseFilters = ({
  selectedCategory,
  selectedVendor,
  paymentStatus,
  startDate,
  endDate,
  onCategoryChange,
  onVendorChange,
  onPaymentStatusChange,
  onStartDateChange,
  onEndDateChange,
  expenseCategories,
  vendors,
  showFilters,
  onToggleFilters
}: ExpenseFiltersProps) => {
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
        
        {/* Filter Options - Always visible */}
        <div className="flex-1">
          <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted/30 hover:scrollbar-thumb-muted/50 pb-2 md:grid md:grid-cols-3 md:overflow-x-visible">
            {/* Categories */}
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
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

            {/* Vendors */}
            <Select value={selectedVendor} onValueChange={onVendorChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Parties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Parties</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.businessName}>
                    {vendor.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select value={paymentStatus} onValueChange={onPaymentStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Completed</SelectItem>
                <SelectItem value="unpaid">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
