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
  } as const
} as const;

// Type exports for better type safety
export type AccountType = typeof APP_CONSTANTS.ACCOUNT_TYPES[keyof typeof APP_CONSTANTS.ACCOUNT_TYPES];
export type TransactionType = typeof APP_CONSTANTS.TRANSACTION_TYPES[keyof typeof APP_CONSTANTS.TRANSACTION_TYPES];
export type PaymentStatus = typeof APP_CONSTANTS.PAYMENT_STATUS[keyof typeof APP_CONSTANTS.PAYMENT_STATUS];
export type ReferenceType = typeof APP_CONSTANTS.REFERENCE_TYPES[keyof typeof APP_CONSTANTS.REFERENCE_TYPES];
export type UserRole = typeof APP_CONSTANTS.USER_ROLES[keyof typeof APP_CONSTANTS.USER_ROLES];