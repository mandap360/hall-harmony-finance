import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAdditionalIncome } from "@/hooks/useAdditionalIncome";
import { AdditionalIncomeRefundDialog } from "@/components/AdditionalIncomeRefundDialog";
import { supabase } from "@/integrations/supabase/client";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";

interface AdditionalIncomeTabProps {
  bookingId: string;
  booking: any;
}

// Helper function to format transaction descriptions
const formatTransactionDescription = (
  paymentType: string,
  startDate: string,
  endDate: string,
  isRefund: boolean = false
): string => {
  const startDateFormatted = new Date(startDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  const endDateFormatted = new Date(endDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const isSameDate = startDateFormatted === endDateFormatted;
  const dateRange = isSameDate ? endDateFormatted : `${startDateFormatted} & ${endDateFormatted}`;

  if (isRefund) {
    return `Additional Income Refund for ${dateRange}`;
  } else {
    return `Additional Income for ${dateRange}`;
  }
};

export const AdditionalIncomeTab = ({ bookingId, booking }: AdditionalIncomeTabProps) => {
  const { toast } = useToast();
  const { additionalIncome, loading, error, refreshAdditionalIncome } = useAdditionalIncome(bookingId);
  const { addTransaction } = useTransactions();
  const { refreshAccounts } = useAccounts();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);

  const totalAdditionalIncome = additionalIncome.reduce((sum, item) => sum + item.amount, 0);
  const totalAllocated = additionalIncome.reduce((sum, item) => sum + item.allocated_amount, 0);
  const availableToAllocate = totalAdditionalIncome - totalAllocated;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount) {
      toast({
        title: "Error",
        description: "Amount is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsedAmount = parseFloat(amount);

      // Add additional income entry
      const { error: insertError } = await supabase
        .from('additional_income')
        .insert({
          booking_id: bookingId,
          amount: parsedAmount,
          description: description,
        });

      if (insertError) throw insertError;

      // Refresh data
      await refreshAdditionalIncome();
      
      // Dispatch event to notify parent components
      window.dispatchEvent(new CustomEvent('booking-updated'));

      toast({
        title: "Success",
        description: "Additional income added successfully",
      });
      setAmount("");
      setDescription("");
    } catch (error) {
      console.error('Error adding additional income:', error);
      toast({
        title: "Error",
        description: "Failed to add additional income",
        variant: "destructive",
      });
    }
  };

  const handleRefund = async (refundAmount: number, accountId: string, description: string) => {
    try {
      // Create standardized refund description
      const refundDescription = formatTransactionDescription(
        'additional',
        booking.startDate,
        booking.endDate,
        true
      );

      // Add negative payment to reduce additional income
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount: -refundAmount,
          payment_date: new Date().toISOString().split('T')[0],
          payment_type: 'additional',
          description: refundDescription,
          payment_mode: accountId
        });

      if (paymentError) throw paymentError;

      // Add debit transaction to the selected account
      await addTransaction({
        account_id: accountId,
        transaction_type: 'debit',
        amount: refundAmount,
        description: refundDescription,
        reference_type: 'additional_income_refund',
        reference_id: bookingId,
        transaction_date: new Date().toISOString().split('T')[0]
      });

      // Refresh data
      await refreshAccounts();
      await refreshAdditionalIncome();
      
      // Dispatch event to notify parent components
      window.dispatchEvent(new CustomEvent('booking-updated'));

      toast({
        title: "Success",
        description: "Refund processed successfully",
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: "Error",
        description: "Failed to process refund",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <p>Loading additional income...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-amber-700">Add Additional Income</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">
              Add Income
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-amber-700">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Total Additional Income:</span>
            <span>₹{totalAdditionalIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Allocated:</span>
            <span>₹{totalAllocated.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Available to Allocate:</span>
            <span>₹{availableToAllocate.toLocaleString()}</span>
          </div>
          <Button 
            onClick={() => setIsRefundDialogOpen(true)}
            disabled={availableToAllocate <= 0}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Process Refund
          </Button>
        </CardContent>
      </Card>

      <AdditionalIncomeRefundDialog
        open={isRefundDialogOpen}
        onOpenChange={setIsRefundDialogOpen}
        maxRefundAmount={availableToAllocate}
        bookingId={bookingId}
        onRefund={handleRefund}
      />
    </div>
  );
};
