import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FinancialYearNavigationProps {
  currentFY: { startYear: number; endYear: number };
  onFYChange: (fy: { startYear: number; endYear: number }) => void;
}

export const FinancialYearNavigation = ({ currentFY, onFYChange }: FinancialYearNavigationProps) => {
  const formatFYDisplay = (fy: { startYear: number; endYear: number }) => {
    const startYearShort = fy.startYear.toString().slice(-2);
    const endYearShort = fy.endYear.toString().slice(-2);
    return `FY ${startYearShort}-${endYearShort}`;
  };

  const goToPreviousFY = () => {
    onFYChange({
      startYear: currentFY.startYear - 1,
      endYear: currentFY.endYear - 1
    });
  };

  const goToNextFY = () => {
    onFYChange({
      startYear: currentFY.startYear + 1,
      endYear: currentFY.endYear + 1
    });
  };

  return (
    <div className="flex items-center justify-center bg-card border-b border-border px-4 py-3 gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPreviousFY}
        className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 p-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <h2 className="text-xl font-bold text-foreground min-w-[140px] text-center">
        {formatFYDisplay(currentFY)}
      </h2>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={goToNextFY}
        className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 p-0"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};