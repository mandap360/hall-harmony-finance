import { APP_CONSTANTS } from './constants';

// Financial utility functions
export const financialUtils = {
  // Get current Indian Financial Year (April to March)
  getCurrentFinancialYear(): { startYear: number; endYear: number } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    if (month >= APP_CONSTANTS.FY_START_MONTH) {
      return { startYear: year, endYear: year + 1 };
    } else {
      return { startYear: year - 1, endYear: year };
    }
  },

  // Check if a date is in the current financial year
  isInCurrentFinancialYear(date: Date): boolean {
    const currentFY = this.getCurrentFinancialYear();
    const year = date.getFullYear();
    const month = date.getMonth();
    
    if (month >= APP_CONSTANTS.FY_START_MONTH) {
      return year === currentFY.startYear;
    } else {
      return year === currentFY.endYear;
    }
  },

  // Format currency in Indian format
  formatCurrency(amount: number, options: { 
    minimumFractionDigits?: number; 
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  } = {}): string {
    const {
      minimumFractionDigits = 0,
      maximumFractionDigits = 0,
      showSymbol = true
    } = options;

    const formatted = new Intl.NumberFormat('en-IN', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: 'INR',
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);

    return formatted;
  },

  // Calculate tax amounts
  calculateTax(baseAmount: number, taxPercentage: number): {
    taxAmount: number;
    totalAmount: number;
    cgstAmount: number;
    sgstAmount: number;
  } {
    const taxAmount = (baseAmount * taxPercentage) / 100;
    const totalAmount = baseAmount + taxAmount;
    const cgstAmount = taxAmount / 2;
    const sgstAmount = taxAmount / 2;

    return { taxAmount, totalAmount, cgstAmount, sgstAmount };
  },

  // Calculate percentage
  calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return (part / total) * 100;
  },

  // Format percentage
  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }
};