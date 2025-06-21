
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

interface TransactionTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: 'credit' | 'debit') => void;
}

export const TransactionTypeDialog = ({ open, onOpenChange, onSelectType }: TransactionTypeDialogProps) => {
  const moneyInOptions = [
    { id: 'customer-payment', label: 'Customer Payment' },
    { id: 'other-income', label: 'Other Income' },
    { id: 'deposit-from-other', label: 'Deposit From Other Accounts' },
    { id: 'owner-contribution', label: "Owner's Contribution" },
    { id: 'interest-income', label: 'Interest Income' },
    { id: 'transfer-from-another', label: 'Transfer From Another Account' },
  ];

  const moneyOutOptions = [
    { id: 'expense', label: 'Expense' },
    { id: 'vendor-payment', label: 'Vendor Payment' },
    { id: 'transfer-to-another', label: 'Transfer To Another Account' },
    { id: 'card-payment', label: 'Card Payment' },
    { id: 'owner-drawing', label: 'Owner Drawing' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <div className="space-y-1">
          {/* Money In Section */}
          <div className="px-4 py-2 bg-gray-100 text-sm font-medium text-gray-600">
            MONEY IN
          </div>
          {moneyInOptions.map((option) => (
            <Card 
              key={option.id}
              className="m-0 rounded-none border-0 border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => {
                onSelectType('credit');
                onOpenChange(false);
              }}
            >
              <div className="text-gray-900">{option.label}</div>
            </Card>
          ))}

          {/* Money Out Section */}
          <div className="px-4 py-2 bg-gray-100 text-sm font-medium text-gray-600">
            MONEY OUT
          </div>
          {moneyOutOptions.map((option) => (
            <Card 
              key={option.id}
              className="m-0 rounded-none border-0 border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer transition-colors last:border-b-0"
              onClick={() => {
                onSelectType('debit');
                onOpenChange(false);
              }}
            >
              <div className="text-gray-900">{option.label}</div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
