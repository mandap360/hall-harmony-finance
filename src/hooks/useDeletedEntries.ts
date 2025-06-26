
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DeletedBooking {
  id: string;
  eventName: string;
  clientName: string;
  phoneNumber: string;
  startDate: string;
  endDate: string;
  rent: number;
  deletedAt: string;
  type: 'booking';
}

export interface DeletedExpense {
  id: string;
  vendorName: string;
  billNumber: string;
  category: string;
  amount: number;
  totalAmount: number;
  date: string;
  deletedAt: string;
  type: 'expense';
}

export type DeletedEntry = DeletedBooking | DeletedExpense;

export const useDeletedEntries = () => {
  const [deletedEntries, setDeletedEntries] = useState<DeletedEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDeletedEntries = async () => {
    try {
      setLoading(true);
      console.log("Fetching deleted entries from Supabase...");
      
      // Fetch deleted bookings
      const { data: deletedBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('is_deleted', true)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching deleted bookings:', bookingsError);
        throw bookingsError;
      }

      // Fetch deleted expenses
      const { data: deletedExpenses, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_categories!inner(name)
        `)
        .eq('is_deleted', true)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (expensesError) {
        console.error('Error fetching deleted expenses:', expensesError);
        throw expensesError;
      }

      // Transform deleted bookings
      const transformedBookings: DeletedBooking[] = (deletedBookings || []).map(booking => ({
        id: booking.id,
        eventName: booking.event_name,
        clientName: booking.client_name,
        phoneNumber: booking.phone_number || '',
        startDate: booking.start_datetime,
        endDate: booking.end_datetime,
        rent: Number(booking.rent_finalized),
        deletedAt: booking.deleted_at,
        type: 'booking' as const
      }));

      // Transform deleted expenses
      const transformedExpenses: DeletedExpense[] = (deletedExpenses || []).map(expense => ({
        id: expense.id,
        vendorName: expense.vendor_name,
        billNumber: expense.bill_number,
        category: expense.expense_categories?.name || 'Unknown',
        amount: Number(expense.amount),
        totalAmount: Number(expense.total_amount || expense.amount),
        date: expense.expense_date,
        deletedAt: expense.deleted_at,
        type: 'expense' as const
      }));

      // Combine and sort by deletion date
      const allDeleted = [...transformedBookings, ...transformedExpenses]
        .sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

      console.log("Deleted entries:", allDeleted);
      setDeletedEntries(allDeleted);
    } catch (error) {
      console.error('Error fetching deleted entries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch deleted entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedEntries();
  }, []);

  return {
    deletedEntries,
    loading,
    refetch: fetchDeletedEntries
  };
};
