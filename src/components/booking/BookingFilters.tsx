
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BookingFiltersProps {
  searchTerm: string;
  selectedMonth: string;
  onSearchChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  monthOptions: Array<{ label: string; value: string }>;
}

export const BookingFilters = ({
  searchTerm,
  selectedMonth,
  onSearchChange,
  onMonthChange,
  monthOptions
}: BookingFiltersProps) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-10 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by client name, event name, or phone number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
