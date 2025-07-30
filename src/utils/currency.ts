/**
 * Currency formatting utilities
 */

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyWithSymbol = (amount: number): string => {
  return `₹${formatCurrency(amount)}`;
};

export const formatBalance = (balance: number): string => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(balance));
  
  return balance >= 0 ? `₹${formatted}` : `-₹${formatted}`;
};