
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const calculateIncomeData = async (selectedFY?: { startYear: number; endYear: number }) => {
  // Get current user's organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    return { totalIncome: 0, incomeByCategory: {} };
  }
  let incomeByCategory: Record<string, number> = {};
  let totalIncome = 0;

  try {
    // Get Secondary Income category ID
    const { data: secondaryCategory } = await supabase
      .from('income_categories')
      .select('id')
      .eq('name', 'Secondary Income')
      .single();

    // Fetch all income with their corresponding booking end dates for user's organization
    const { data: allIncomeWithBookings, error: incomeError } = await supabase
      .from('income')
      .select(`
        amount,
        category_id,
        payment_date,
        booking_id,
        income_categories!category_id (
          name,
          parent_id
        )
      `)
      .eq('organization_id', profile.organization_id);

    // Fetch booking end dates separately
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, end_datetime')
      .eq('organization_id', profile.organization_id);

    // Create a map of booking_id to end_datetime for quick lookup
    const bookingEndDateMap = bookingsData?.reduce((acc, booking) => {
      acc[booking.id] = booking.end_datetime;
      return acc;
    }, {} as Record<string, string>) || {};

    if (!incomeError && !bookingsError && allIncomeWithBookings && bookingsData) {
      // Filter income by booking end date within financial year and group by category (excluding Secondary Income categories)
      allIncomeWithBookings.forEach(income => {
        const bookingEndDate = income.booking_id ? bookingEndDateMap[income.booking_id] : null;
        
        // Check if booking end date is in selected financial year
        if (selectedFY && bookingEndDate) {
          const endDate = new Date(bookingEndDate);
          const endYear = endDate.getFullYear();
          const endMonth = endDate.getMonth();
          
          let isInSelectedFY = false;
          if (endMonth >= 3) { // April onwards
            isInSelectedFY = endYear === selectedFY.startYear;
          } else { // January to March  
            isInSelectedFY = endYear === selectedFY.endYear;
          }
          
          if (!isInSelectedFY) return;
        }
        
        const amount = Number(income.amount);
        const categoryName = income.income_categories?.name || 'Uncategorized';
        const isSecondaryIncome = income.category_id === secondaryCategory?.id || 
                                income.income_categories?.parent_id === secondaryCategory?.id;
        
        // Only include non-secondary income categories from income table
        if (!isSecondaryIncome) {
          incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + amount;
          totalIncome += amount;
        }
      });
    }

    // Fetch secondary income from secondary_income table with booking end dates only for Secondary Income category
    const { data: secondaryIncomeData, error } = await supabase
      .from('secondary_income')
      .select(`
        amount, 
        created_at, 
        booking_id,
        income_categories!inner(name, parent_id)
      `)
      .eq('organization_id', profile.organization_id);

    if (!error && secondaryIncomeData && bookingsData) {
      let secondaryIncomeTotal = 0;
      const secondaryIncomeSubcategories: Record<string, number> = {};
      
      secondaryIncomeData.forEach(item => {
        const bookingEndDate = item.booking_id ? bookingEndDateMap[item.booking_id] : null;
        
        // Check if booking end date is in selected financial year
        if (selectedFY && bookingEndDate) {
          const endDate = new Date(bookingEndDate);
          const endYear = endDate.getFullYear();
          const endMonth = endDate.getMonth();
          
          let isInSelectedFY = false;
          if (endMonth >= 3) { // April onwards
            isInSelectedFY = endYear === selectedFY.startYear;
          } else { // January to March  
            isInSelectedFY = endYear === selectedFY.endYear;
          }
          
          if (!isInSelectedFY) return;
        }
        
        const amount = Number(item.amount);
        const categoryName = item.income_categories.name;
        
        // Include all secondary income subcategories
        if (item.income_categories.parent_id) {
          secondaryIncomeSubcategories[categoryName] = (secondaryIncomeSubcategories[categoryName] || 0) + amount;
          secondaryIncomeTotal += amount;
        }
      });
      
      // Add subcategories to the main income breakdown
      Object.entries(secondaryIncomeSubcategories).forEach(([categoryName, amount]) => {
        incomeByCategory[categoryName] = amount;
      });
      
      // Set "Secondary Income" to be the total of its subcategories from secondary_income table
      if (secondaryIncomeTotal !== 0) {
        incomeByCategory['Secondary Income'] = secondaryIncomeTotal;
        totalIncome += secondaryIncomeTotal;
      }
    }
  } catch (error) {
    console.error('Error fetching income data:', error);
  }

  return {
    totalIncome,
    incomeByCategory
  };
};
