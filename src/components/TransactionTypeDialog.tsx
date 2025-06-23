
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
      <DialogContent className="sm:max-w-md p-0 gap-0 [&>button]:hidden">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Money In Section */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">MONEY IN</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {moneyInOptions.map((option) => (
              <div 
                key={option.id}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  onSelectType('credit');
                  onOpenChange(false);
                }}
              >
                <div className="text-gray-900 font-medium">{option.label}</div>
              </div>
            ))}
          </div>

          {/* Money Out Section */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">MONEY OUT</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {moneyOutOptions.map((option, index) => (
              <div 
                key={option.id}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  index === moneyOutOptions.length - 1 ? '' : ''
                }`}
                onClick={() => {
                  onSelectType('debit');
                  onOpenChange(false);
                }}
              >
                <div className="text-gray-900 font-medium">{option.label}</div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
