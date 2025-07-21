import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IncomeCategoryManagement } from "@/components/IncomeCategoryManagement";
import { ExpenseCategoryManagement } from "@/components/ExpenseCategoryManagement";
import { cn } from "@/lib/utils";

const MAIN_TABS = [
  { id: 'income', label: 'Income' },
  { id: 'expense', label: 'Expense' }
];

export const CategorySettings = () => {
  const [activeTab, setActiveTab] = useState("income");

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="flex items-center justify-between border-b border-border bg-card">
        <div className="flex flex-1">
          {MAIN_TABS.map(tab => (
            <Button
              key={tab.id}
              variant="ghost"
              className={cn(
                "flex-1 rounded-none border-b-2 h-12 font-medium",
                activeTab === tab.id 
                  ? 'border-blue-500 bg-transparent text-orange-600' 
                  : 'border-transparent text-foreground hover:text-foreground hover:bg-muted'
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeTab === 'income' && <IncomeCategoryManagement />}
        {activeTab === 'expense' && <ExpenseCategoryManagement />}
      </div>
    </div>
  );
};