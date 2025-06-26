
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
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="w-40 text-sm">
            <SelectValue placeholder="Quarter" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
