import type { BillStatus } from '@/hooks/useBills';

export const statusColors: Record<BillStatus, string> = {
  unpaid: 'bg-red-100 text-red-700 border-red-200',
  partial: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  paid: 'bg-green-100 text-green-700 border-green-200',
};

export const txTypeColors = (type?: string) => {
  switch (type) {
    case 'Income':
      return 'bg-green-50 text-green-700';
    case 'Advance Paid':
      return 'bg-purple-50 text-purple-700';
    case 'Expense':
      return 'bg-red-50 text-red-700';
    case 'Refund':
      return 'bg-orange-50 text-orange-700';
    case 'Transfer':
      return 'bg-slate-50 text-slate-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
};
