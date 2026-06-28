import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { APP_CONSTANTS, formatINR, getTransactionTypeColor, getBillStatusColor, getTransactionTypeAmountColor } from '@/utils/constants';
export type {
  AccountType,
  TransactionType,
  PaymentStatus,
  ReferenceType,
  UserRole,
} from '@/utils/constants';
