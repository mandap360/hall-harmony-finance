import { useMemo } from 'react';
import { financialUtils } from '@/utils/financial';
import { useTax } from '@/hooks/useTax';
import { APP_CONSTANTS } from '@/utils/constants';

interface TaxCalculationParams {
  amount: string | number;
  taxRateId: string;
}

export function useTaxCalculation({ amount, taxRateId }: TaxCalculationParams) {
  const { taxRates } = useTax();

  const calculation = useMemo(() => {
    const baseAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
    
    if (taxRateId === APP_CONSTANTS.DEFAULTS.TAX_RATE_ID || !taxRateId) {
      return {
        baseAmount,
        taxPercentage: 0,
        taxAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        totalAmount: baseAmount
      };
    }

    const selectedTaxRate = taxRates.find(tax => tax.id === taxRateId);
    const taxPercentage = selectedTaxRate?.percentage || 0;
    
    const { taxAmount, totalAmount, cgstAmount, sgstAmount } = financialUtils.calculateTax(
      baseAmount, 
      taxPercentage
    );

    return {
      baseAmount,
      taxPercentage,
      taxAmount,
      cgstAmount,
      sgstAmount,
      totalAmount
    };
  }, [amount, taxRateId, taxRates]);

  return calculation;
}