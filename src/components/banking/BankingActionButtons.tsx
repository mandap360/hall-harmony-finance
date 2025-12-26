import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BankingActionButtonsProps {
  onAddAccount: () => void;
}

export const BankingActionButtons = ({ onAddAccount }: BankingActionButtonsProps) => {
  return (
    <div className="fixed bottom-24 right-4 flex flex-col space-y-3 z-50">
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
