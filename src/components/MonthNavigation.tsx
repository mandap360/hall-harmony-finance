import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface MonthNavigationProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export const MonthNavigation = ({ 
  currentDate, 
  onPreviousMonth, 
  onNextMonth 
}: MonthNavigationProps) => {
  return (
    <div className="flex items-center justify-between bg-card border-b border-border px-4 py-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPreviousMonth}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      
      <h2 className="text-lg font-semibold text-foreground">
        {format(currentDate, "MMMM yyyy")}
      </h2>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onNextMonth}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};