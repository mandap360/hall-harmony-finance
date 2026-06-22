// Application constants
export const APP_CONSTANTS = {
  // Financial Year
  FY_START_MONTH: 3, // April (0-indexed)
  
  // Account Types
  ACCOUNT_TYPES: {
    OPERATIONAL: 'operational',
    CAPITAL: 'capital',
    OTHER: 'other'
  } as const,
  
  // Transaction Types
  TRANSACTION_TYPES: {
    CREDIT: 'credit',
    DEBIT: 'debit'
  } as const,
  
  // Payment Status
  PAYMENT_STATUS: {
    PAID: 'paid',
    UNPAID: 'unpaid',
    ALL: 'all'
  } as const,
  
  // Reference Types
  REFERENCE_TYPES: {
    EXPENSE: 'expense',
    EXPENSE_PAYMENT: 'expense_payment',
    BOOKING: 'booking',
    PAYMENT: 'payment'
  } as const,
  
  // User Roles
  USER_ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager'
  } as const,
  
  // Default Values
  DEFAULTS: {
    TAX_RATE_ID: 'no_tax',
    CATEGORY_FILTER: 'all',
    VENDOR_FILTER: 'all',
    PAYMENT_STATUS_FILTER: 'all',
    BOOKING_STATUS: 'confirmed'
  } as const,
  
  // UI Constants
  UI: {
    MOBILE_BREAKPOINT: 768,
    FIXED_BUTTON_BOTTOM: 24,
    ANIMATION_DURATION: 200
  } as const,
  
  // Account Types (from database)
  ACCOUNT_TYPE_DB: {
    CASH_BANK: 'cash_bank',
    OWNERS_CAPITAL: 'owners_capital'
  } as const,
  
  // Transaction Type Colors
  TRANSACTION_TYPE_COLORS: {
    'Income': 'bg-green-50 text-green-700',
    'Expense': 'bg-red-50 text-red-700',
    'Refund': 'bg-orange-50 text-orange-700',
    'Advance Paid': 'bg-purple-50 text-purple-700',
    'Transfer': 'bg-slate-50 text-slate-700'
  } as const,
  
  // Bill Status Colors
  BILL_STATUS_COLORS: {
    unpaid: 'bg-red-100 text-red-700 border-red-200',
    partial: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    paid: 'bg-green-100 text-green-700 border-green-200'
  } as const,
  
  // Locale & Currency
  LOCALE: 'en-IN',
  CURRENCY_SYMBOL: '₹'
} as const;

// Type exports for better type safety
export type AccountType = typeof APP_CONSTANTS.ACCOUNT_TYPES[keyof typeof APP_CONSTANTS.ACCOUNT_TYPES];
export type TransactionType = typeof APP_CONSTANTS.TRANSACTION_TYPES[keyof typeof APP_CONSTANTS.TRANSACTION_TYPES];
export type PaymentStatus = typeof APP_CONSTANTS.PAYMENT_STATUS[keyof typeof APP_CONSTANTS.PAYMENT_STATUS];
export type ReferenceType = typeof APP_CONSTANTS.REFERENCE_TYPES[keyof typeof APP_CONSTANTS.REFERENCE_TYPES];
export type UserRole = typeof APP_CONSTANTS.USER_ROLES[keyof typeof APP_CONSTANTS.USER_ROLES];

// Utility Functions
/**
 * Format number as Indian Rupees (₹)
 * @example formatINR(1000) => '₹1,000.00'
 */
export const formatINR = (amount: number): string => {
  return `${APP_CONSTANTS.CURRENCY_SYMBOL}${amount.toLocaleString(APP_CONSTANTS.LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export const getTodayISOString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get transaction type color classes
 */
export const getTransactionTypeColor = (type: string): string => {
  return APP_CONSTANTS.TRANSACTION_TYPE_COLORS[type as keyof typeof APP_CONSTANTS.TRANSACTION_TYPE_COLORS] || 'bg-gray-50 text-gray-700';
};

/**
 * Get bill status color classes
 */
export const getBillStatusColor = (status: string): string => {
  return APP_CONSTANTS.BILL_STATUS_COLORS[status as keyof typeof APP_CONSTANTS.BILL_STATUS_COLORS] || 'bg-gray-100 text-gray-700';
};