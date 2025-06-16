
import { useState } from "react";

export interface TaxRate {
  id: string;
  name: string;
  percentage: number;
  createdAt: string;
}

export const useTax = () => {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    { id: "1", name: "GST 12%", percentage: 12, createdAt: new Date().toISOString() },
    { id: "2", name: "GST 18%", percentage: 18, createdAt: new Date().toISOString() },
  ]);

  const addTaxRate = (taxData: Omit<TaxRate, "id" | "createdAt">) => {
    const newTaxRate: TaxRate = {
      ...taxData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTaxRates(prev => [...prev, newTaxRate]);
  };

  const deleteTaxRate = (taxId: string) => {
    setTaxRates(prev => prev.filter(tax => tax.id !== taxId));
  };

  return {
    taxRates,
    addTaxRate,
    deleteTaxRate,
  };
};
