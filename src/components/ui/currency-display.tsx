import { IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  iconSize?: "sm" | "md" | "lg";
  showIcon?: boolean;
  prefix?: string;
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
  showIcon = true,
  prefix = "₹"
}: CurrencyDisplayProps) => {
  return (
    <div className={cn("flex items-center", className)}>
      {showIcon && <IndianRupee className={cn("mr-1", iconSizes[iconSize])} />}
      <span>{prefix}{amount.toLocaleString()}</span>
    </div>
  );
};