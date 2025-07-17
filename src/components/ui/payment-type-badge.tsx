import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PaymentTypeBadgeProps {
  type: string;
  className?: string;
}

export const PaymentTypeBadge = ({ type, className }: PaymentTypeBadgeProps) => {
  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'rent':
        return 'Rent Payment';
      case 'advance':
        return 'Rent Received';
      case 'additional':
        return 'Additional Income';
      default:
        return 'Payment';
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'rent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advance':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'additional':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "px-2 py-1 text-xs font-medium",
        getPaymentTypeColor(type),
        className
      )}
    >
      {getPaymentTypeLabel(type)}
    </Badge>
  );
};