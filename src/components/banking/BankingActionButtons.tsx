
import { Plus, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BankingActionButtonsProps {
  onAddAccount: () => void;
  onTransfer: () => void;
}

export const BankingActionButtons = ({ onAddAccount, onTransfer }: BankingActionButtonsProps) => {
  return (
    <div className="fixed bottom-24 right-4 flex flex-col space-y-3 z-50">
      <Button
        onClick={onTransfer}
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
        size="icon"
      >
        <ArrowRightLeft className="h-6 w-6" />
      </Button>
      
      <Button
        onClick={onAddAccount}
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};
