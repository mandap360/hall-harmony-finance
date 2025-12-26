import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BankingEmptyStateProps {
  onAddAccount: () => void;
}

export const BankingEmptyState = ({ onAddAccount }: BankingEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Plus className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">No accounts yet</h2>
      <p className="text-muted-foreground mb-6">Add your first account to get started</p>
      <Button
        onClick={onAddAccount}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Account
      </Button>
    </div>
  );
};
