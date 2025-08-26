import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="p-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousFY}
            className="h-8 w-8 p-0 hover:bg-blue-200 text-blue-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-bold text-blue-900">
              {formatFYDisplay(currentFY)}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextFY}
            className="h-8 w-8 p-0 hover:bg-blue-200 text-blue-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};