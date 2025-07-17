import { CurrencyDisplay } from "@/components/ui/currency-display";
import { cn } from "@/lib/utils";

interface PaymentStatCardProps {
  label: string;
  amount: number;
  variant?: "blue" | "green" | "purple" | "red";
  className?: string;
}

const variantStyles = {
  blue: "text-blue-600",
  green: "text-green-600", 
  purple: "text-purple-600",
  red: "text-red-600"
};

export const PaymentStatCard = ({ 
  label, 
  amount, 
  variant = "blue", 
  className 
}: PaymentStatCardProps) => {
  return (
    <div className={cn("text-center", className)}>
      <div className={cn("flex items-center justify-center mb-1", variantStyles[variant])}>
        <CurrencyDisplay amount={amount} className="text-sm font-semibold" />
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
};