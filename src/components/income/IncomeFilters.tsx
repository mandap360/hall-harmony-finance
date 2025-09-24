import { Filter, CreditCard, List, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface IncomeFiltersProps {
  selectedAccounts: string[];
  selectedCategories: string[];
  onAccountsChange: (accounts: string[]) => void;
  onCategoriesChange: (categories: string[]) => void;
  accounts: any[];
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export const IncomeFilters = ({
  selectedAccounts,
  selectedCategories,
  onAccountsChange,
  onCategoriesChange,
  accounts,
  onApplyFilters,
  onClearFilters
}: IncomeFiltersProps) => {
  const incomeCategories = [
    { id: 'rent', name: 'Rent' },
    { id: 'secondary-income', name: 'Secondary Income' },
    { id: 'refund', name: 'Refund' }
  ];

  const handleAccountToggle = (accountId: string) => {
    const isSelected = selectedAccounts.includes(accountId);
    if (isSelected) {
      onAccountsChange(selectedAccounts.filter(a => a !== accountId));
    } else {
      onAccountsChange([...selectedAccounts, accountId]);
    }
  };

  const handleCategoryToggle = (categoryName: string) => {
    const isSelected = selectedCategories.includes(categoryName);
    if (isSelected) {
      onCategoriesChange(selectedCategories.filter(c => c !== categoryName));
    } else {
      onCategoriesChange([...selectedCategories, categoryName]);
    }
  };

  return (
    <div className="bg-white border-b">
      <div className="p-4 flex items-center gap-2">
        {/* Blue Circle Filter Icon */}
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <Filter className="h-4 w-4 text-white" />
        </div>

        {/* Accounts Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Accounts
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Filter by Account</h3>
              <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`account-${account.id}`}
                      checked={selectedAccounts.includes(account.id)}
                      onCheckedChange={() => handleAccountToggle(account.id)}
                    />
                    <label
                      htmlFor={`account-${account.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {account.name}
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
        
        {/* Categories Filter Popover */}
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
              <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto">
                {incomeCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`income-category-${category.id}`}
                      checked={selectedCategories.includes(category.name)}
                      onCheckedChange={() => handleCategoryToggle(category.name)}
                    />
                    <label
                      htmlFor={`income-category-${category.id}`}
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
      </div>
    </div>
  );
};