/**
 * Financial Year Utilities for Indian Financial Year (April - March)
 * Consolidates all financial year related calculations and utilities
 */

export interface FinancialYear {
  startYear: number;
  endYear: number;
}

/**
 * Get the current Indian Financial Year (April 1 - March 31)
 */
export const getCurrentFinancialYear = (): FinancialYear => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed (March = 2, April = 3)
  
  if (month >= 3) { // April onwards
    return { startYear: year, endYear: year + 1 };
  } else { // January to March
    return { startYear: year - 1, endYear: year };
  }
};

/**
 * Get financial year for a specific date
 */
export const getFinancialYearForDate = (date: Date): FinancialYear => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  if (month >= 3) { // April onwards
    return { startYear: year, endYear: year + 1 };
  } else { // January to March
    return { startYear: year - 1, endYear: year };
  }
};

/**
 * Get the date range for a financial year
 */
export const getFinancialYearRange = (fy: FinancialYear): { startDate: Date; endDate: Date } => {
  return {
    startDate: new Date(fy.startYear, 3, 1), // April 1st
    endDate: new Date(fy.endYear, 2, 31)     // March 31st
  };
};

/**
 * Check if a date falls within a specific financial year
 */
export const isInFinancialYear = (date: Date | string, fy: FinancialYear): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  
  if (month >= 3) { // April onwards
    return year === fy.startYear;
  } else { // January to March
    return year === fy.endYear;
  }
};

/**
 * Get the previous financial year
 */
export const getPreviousFinancialYear = (fy: FinancialYear): FinancialYear => {
  return {
    startYear: fy.startYear - 1,
    endYear: fy.endYear - 1
  };
};

/**
 * Get the next financial year
 */
export const getNextFinancialYear = (fy: FinancialYear): FinancialYear => {
  return {
    startYear: fy.startYear + 1,
    endYear: fy.endYear + 1
  };
};

/**
 * Format financial year for display (e.g., "2023-24")
 */
export const formatFinancialYear = (fy: FinancialYear): string => {
  return `${fy.startYear}-${fy.endYear.toString().slice(-2)}`;
};

/**
 * Get financial year display string with full date range
 */
export const getFinancialYearDisplayString = (fy: FinancialYear): string => {
  return `FY ${formatFinancialYear(fy)} (Apr ${fy.startYear} - Mar ${fy.endYear})`;
};

/**
 * Check if a financial year is the current financial year
 */
export const isCurrentFinancialYear = (fy: FinancialYear): boolean => {
  const currentFY = getCurrentFinancialYear();
  return fy.startYear === currentFY.startYear && fy.endYear === currentFY.endYear;
};