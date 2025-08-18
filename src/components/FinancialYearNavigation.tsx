import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinancialYear, formatFinancialYear, getFinancialYearDisplayString, isCurrentFinancialYear } from "@/utils/financialYear";

interface FinancialYearNavigationProps {
  currentFinancialYear: FinancialYear;
  onPreviousYear: () => void;
  onNextYear: () => void;
}

export const FinancialYearNavigation = ({ 
  currentFinancialYear, 
  onPreviousYear, 
  onNextYear 
}: FinancialYearNavigationProps) => {
  const isCurrent = isCurrentFinancialYear(currentFinancialYear);
  
  return (
    <div className="flex items-center justify-center bg-card border-b border-border px-4 py-3 gap-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPreviousYear}
        className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 p-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground min-w-[200px]">
          {getFinancialYearDisplayString(currentFinancialYear)}
        </h2>
        {isCurrent && (
          <p className="text-xs text-muted-foreground mt-1">Current Financial Year</p>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onNextYear}
        className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 p-0"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};