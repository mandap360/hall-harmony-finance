
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TransactionFilterProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

export const TransactionFilter = ({ filter, onFilterChange }: TransactionFilterProps) => {
  return (
    <div className="mb-6">
      <Label htmlFor="transactionFilter" className="text-sm font-medium text-gray-700 mb-2 block">
        Filter Transactions
      </Label>
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-48">
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
