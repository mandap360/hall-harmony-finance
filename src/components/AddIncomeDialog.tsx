
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AddIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIncomeAdded?: () => void;
}

export const AddIncomeDialog = ({ open, onOpenChange, onIncomeAdded }: AddIncomeDialogProps) => {
  const [amount, setAmount] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  
  const { accounts } = useAccounts();
  const { getIncomeCategories } = useCategories();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const incomeCategories = getIncomeCategories();
  
  // Filter parent categories (categories without parent_id)
  const parentCategories = incomeCategories.filter(cat => !cat.parent_id);
  
  // Get subcategories for a parent
  const getSubcategories = (parentId: string) => {
    return incomeCategories.filter(cat => cat.parent_id === parentId);
  };
  
  // Handle category selection from the Select component
  const handleCategorySelect = (value: string) => {
    const selectedCategory = incomeCategories.find(cat => cat.id === value);
    if (!selectedCategory) return;
    
    // Only set selected category ID for actual selections (subcategories or parent categories without subcategories)
    setSelectedCategoryId(selectedCategory.id);
  };

  // Handle parent category click for expansion
  const handleParentCategoryClick = (categoryId: string) => {
    const category = incomeCategories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    const hasSubcategories = getSubcategories(categoryId).length > 0;
    
    if (hasSubcategories) {
      // Toggle expansion for parent categories with subcategories
      setExpandedCategoryId(expandedCategoryId === categoryId ? null : categoryId);
    } else {
      // Select parent categories without subcategories
      setSelectedCategoryId(categoryId);
    }
  };
  
  // Get display value for selected category
  const getSelectedCategoryDisplay = () => {
    if (!selectedCategoryId) return "";
    
    const selectedCategory = incomeCategories.find(cat => cat.id === selectedCategoryId);
    if (!selectedCategory) return "";
    
    if (selectedCategory.parent_id) {
      const parentCategory = incomeCategories.find(cat => cat.id === selectedCategory.parent_id);
      return parentCategory ? `${parentCategory.name} / ${selectedCategory.name}` : selectedCategory.name;
    }
    
    return selectedCategory.name;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !selectedCategoryId || !accountId || !profile?.organization_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedAmount = parseFloat(amount);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Find the selected category name
      const selectedCategory = incomeCategories.find(cat => cat.id === selectedCategoryId);
      if (!selectedCategory) {
        throw new Error("Invalid category selected");
      }

      // Create the payment record
      const { error: paymentError } = await supabase
        .from('income')
        .insert({
          booking_id: null, // Standalone income not tied to a booking
          amount: parsedAmount,
          payment_date: formattedDate,
          payment_type: 'additional',
          description: description || selectedCategory.name,
          payment_mode: accountId,
          organization_id: profile.organization_id
        });

      if (paymentError) throw paymentError;

      // Create the transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          account_id: accountId,
          transaction_type: 'credit',
          amount: parsedAmount,
          description: description || selectedCategory.name,
          reference_type: 'income',
          transaction_date: formattedDate
        });

      if (transactionError) throw transactionError;

      // Create additional income record for categorization
      const { error: incomeError } = await supabase
        .from('secondary_income')
        .insert({
          booking_id: null,
          category: selectedCategory.name,
          amount: parsedAmount,
          organization_id: profile.organization_id
        });

      if (incomeError) throw incomeError;

      toast({
        title: "Success",
        description: "Income added successfully",
      });

      // Reset form
      setAmount("");
      setSelectedCategoryId("");
      setAccountId("");
      setDescription("");
      setDate(new Date());
      
      onOpenChange(false);
      onIncomeAdded?.();
      
    } catch (error) {
      console.error('Error adding income:', error);
      toast({
        title: "Error",
        description: "Failed to add income",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Income</DialogTitle>
          <DialogDescription>
            Add a new income entry to your records.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={selectedCategoryId} 
              onValueChange={handleCategorySelect}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category">
                  {getSelectedCategoryDisplay()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <div className="space-y-1">
                  {parentCategories.map((category) => {
                    const subcategories = getSubcategories(category.id);
                    const hasSubcategories = subcategories.length > 0;
                    const isExpanded = expandedCategoryId === category.id;
                    
                    return (
                      <div key={category.id}>
                        {hasSubcategories ? (
                          <div 
                            className="flex items-center justify-between w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                            onClick={() => handleParentCategoryClick(category.id)}
                          >
                            <span>{category.name}</span>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 ml-2" />
                            ) : (
                              <ChevronDown className="h-4 w-4 ml-2" />
                            )}
                          </div>
                        ) : (
                          <SelectItem value={category.id} className="pl-2">
                            {category.name}
                          </SelectItem>
                        )}
                        {hasSubcategories && isExpanded && (
                          <>
                            {subcategories.map((subcategory) => (
                              <SelectItem 
                                key={subcategory.id}
                                value={subcategory.id}
                                className="pl-4"
                              >
                                {subcategory.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">Account *</Label>
            <Select value={accountId} onValueChange={setAccountId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Income"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
