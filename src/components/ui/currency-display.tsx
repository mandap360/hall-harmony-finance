
import { IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  iconSize?: "sm" | "md" | "lg";
  displayMode?: "icon-only" | "text-only" | "both";
}

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4", 
  lg: "h-5 w-5"
};

export const CurrencyDisplay = ({ 
  amount, 
  className, 
  iconSize = "md", 
  displayMode = "text-only"
}: CurrencyDisplayProps) => {
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <div className={cn("flex items-center", className)}>
      {displayMode === "icon-only" && <IndianRupee className={cn("mr-1", iconSizes[iconSize])} />}
      {displayMode === "both" && <IndianRupee className={cn("mr-1", iconSizes[iconSize])} />}
      <span>
        {displayMode === "text-only" && "₹"}
        {displayMode === "both" && "₹"}
        {formattedAmount}
      </span>
    </div>
  );
};
