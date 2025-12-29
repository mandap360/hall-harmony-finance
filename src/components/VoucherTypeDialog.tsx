import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, CreditCard, ArrowLeftRight, Receipt, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export type VoucherType = 'purchase' | 'payment' | 'fund_transfer' | 'sales' | 'receipt';

interface VoucherOption {
  id: VoucherType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const VOUCHER_TYPES: VoucherOption[] = [
  {
    id: 'purchase',
    label: 'Purchase/Expense Voucher',
    description: 'Record purchase of goods/services or expenses',
    icon: <ShoppingCart className="h-6 w-6" />,
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
  },
  {
    id: 'payment',
    label: 'Payment Voucher',
    description: 'Pay vendors/suppliers',
    icon: <CreditCard className="h-6 w-6" />,
    color: 'bg-red-500/10 text-red-600 border-red-500/20'
  },
  {
    id: 'fund_transfer',
    label: 'Fund Transfer',
    description: 'Transfer between accounts',
    icon: <ArrowLeftRight className="h-6 w-6" />,
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  },
  {
    id: 'sales',
    label: 'Sales Voucher',
    description: 'Record sales transactions',
    icon: <Receipt className="h-6 w-6" />,
    color: 'bg-green-500/10 text-green-600 border-green-500/20'
  },
  {
    id: 'receipt',
    label: 'Receipt Voucher',
    description: 'Receive payments',
    icon: <Wallet className="h-6 w-6" />,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
  }
];

interface VoucherTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectVoucher: (type: VoucherType) => void;
}

export function VoucherTypeDialog({ open, onOpenChange, onSelectVoucher }: VoucherTypeDialogProps) {
  const handleSelect = (type: VoucherType) => {
    onSelectVoucher(type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Voucher Type</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {VOUCHER_TYPES.map((voucher) => (
            <Card 
              key={voucher.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md border-2",
                voucher.color
              )}
              onClick={() => handleSelect(voucher.id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn("p-3 rounded-full", voucher.color)}>
                  {voucher.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{voucher.label}</h3>
                  <p className="text-sm text-muted-foreground">{voucher.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { VOUCHER_TYPES };
