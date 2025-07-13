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
    <div className="flex items-center justify-center bg-card border-b border-border px-4 py-3 gap-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPreviousMonth}
        className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 p-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <h2 className="text-xl font-semibold text-foreground min-w-[140px] text-center">
        {format(currentDate, "MMMM yyyy")}
      </h2>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onNextMonth}
        className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 p-0"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};