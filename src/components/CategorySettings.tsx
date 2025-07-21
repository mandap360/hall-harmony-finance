import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { IncomeCategoryManagement } from "@/components/IncomeCategoryManagement";
import { ExpenseCategoryManagement } from "@/components/ExpenseCategoryManagement";

export const CategorySettings = () => {
  const [activeTab, setActiveTab] = useState("income");

  const handleAddCategory = () => {
    // Find and click the add button in the currently active tab
    setTimeout(() => {
      const addButton = document.querySelector('[data-dialog-trigger]') as HTMLButtonElement;
      if (addButton) {
        addButton.click();
      }
    }, 0);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold">Category Settings</h1>
        <p className="text-sm text-muted-foreground">Manage income and expense categories</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="flex-1 mt-0">
          <IncomeCategoryManagement />
        </TabsContent>

        <TabsContent value="expense" className="flex-1 mt-0">
          <ExpenseCategoryManagement />
        </TabsContent>
      </Tabs>

      {/* Floating Add Button */}
      <Button
        onClick={handleAddCategory}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};