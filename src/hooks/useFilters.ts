import { useState, useMemo } from 'react';
import { financialUtils } from '@/utils/financial';
import { dateUtils } from '@/utils/dateUtils';
import { APP_CONSTANTS } from '@/utils/constants';

interface FilterState {
  category: string;
  vendor: string;
  paymentStatus: string;
  startDate?: Date;
  endDate?: Date;
}

interface FilterableItem {
  date: string;
  category: string;
  vendorName: string;
  isPaid: boolean;
}

export function useFilters<T extends FilterableItem>(items: T[]) {
  const [filters, setFilters] = useState<FilterState>({
    category: APP_CONSTANTS.DEFAULTS.CATEGORY_FILTER,
    vendor: APP_CONSTANTS.DEFAULTS.VENDOR_FILTER,
    paymentStatus: APP_CONSTANTS.DEFAULTS.PAYMENT_STATUS_FILTER,
  });

  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const itemDate = new Date(item.date);
      
      // Apply Financial Year filter if no custom date range is selected
      if (!filters.startDate && !filters.endDate) {
        if (!financialUtils.isInCurrentFinancialYear(itemDate)) {
          return false;
        }
      }

      // Apply date range filter if dates are selected
      if (!dateUtils.isInRange(itemDate, filters.startDate, filters.endDate)) {
        return false;
      }
      
      return true;
    });

    // Apply category filter
    if (filters.category !== APP_CONSTANTS.DEFAULTS.CATEGORY_FILTER) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Apply vendor filter
    if (filters.vendor !== APP_CONSTANTS.DEFAULTS.VENDOR_FILTER) {
      filtered = filtered.filter(item => item.vendorName === filters.vendor);
    }

    // Apply payment status filter
    if (filters.paymentStatus !== APP_CONSTANTS.DEFAULTS.PAYMENT_STATUS_FILTER) {
      filtered = filtered.filter(item => 
        filters.paymentStatus === APP_CONSTANTS.PAYMENT_STATUS.PAID ? item.isPaid : !item.isPaid
      );
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, filters]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: APP_CONSTANTS.DEFAULTS.CATEGORY_FILTER,
      vendor: APP_CONSTANTS.DEFAULTS.VENDOR_FILTER,
      paymentStatus: APP_CONSTANTS.DEFAULTS.PAYMENT_STATUS_FILTER,
    });
  };

  const hasActiveFilters = useMemo(() => {
    return filters.category !== APP_CONSTANTS.DEFAULTS.CATEGORY_FILTER ||
           filters.vendor !== APP_CONSTANTS.DEFAULTS.VENDOR_FILTER ||
           filters.paymentStatus !== APP_CONSTANTS.DEFAULTS.PAYMENT_STATUS_FILTER ||
           filters.startDate !== undefined ||
           filters.endDate !== undefined;
  }, [filters]);

  return {
    filters,
    filteredItems,
    showFilters,
    hasActiveFilters,
    updateFilter,
    resetFilters,
    setShowFilters
  };
}