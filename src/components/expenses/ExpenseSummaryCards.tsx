import { Card } from '@/components/ui/card';
import { TrendingDown, Wallet, CheckCircle } from 'lucide-react';

interface ExpenseSummaryCardsProps {
  unpaidTotal: number;
  advanceAvailable: number;
  paidInPeriod: number;
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export const ExpenseSummaryCards = ({
  unpaidTotal,
  advanceAvailable,
  paidInPeriod,
}: ExpenseSummaryCardsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Unpaid Bills</p>
          <p className="text-2xl font-bold text-red-600">{fmt(unpaidTotal)}</p>
        </div>
        <TrendingDown className="h-8 w-8 text-red-600 opacity-80" />
      </div>
    </Card>
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Advance Credit Available</p>
          <p className="text-2xl font-bold text-purple-600">{fmt(advanceAvailable)}</p>
        </div>
        <Wallet className="h-8 w-8 text-purple-600 opacity-80" />
      </div>
    </Card>
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Paid (filtered period)</p>
          <p className="text-2xl font-bold text-green-600">{fmt(paidInPeriod)}</p>
        </div>
        <CheckCircle className="h-8 w-8 text-green-600 opacity-80" />
      </div>
    </Card>
  </div>
);
