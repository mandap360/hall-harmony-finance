import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export utility functions for easier access
export { financialUtils } from '@/utils/financial';
export { dateUtils } from '@/utils/dateUtils';
export { formUtils, validationSchemas } from '@/utils/formUtils';
export { APP_CONSTANTS } from '@/utils/constants';
export type { 
  AccountType, 
  TransactionType, 
  PaymentStatus, 
  ReferenceType, 
  UserRole 
} from '@/utils/constants';
