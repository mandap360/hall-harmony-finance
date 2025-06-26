
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TransactionFilterProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

export const TransactionFilter = ({ filter, onFilterChange }: TransactionFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="transactionFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Filter:
      </Label>
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-40 h-8">
          <SelectValue placeholder="All transactions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Transactions</SelectItem>
          <SelectItem value="credit">Money In Only</SelectItem>
          <SelectItem value="debit">Money Out Only</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
