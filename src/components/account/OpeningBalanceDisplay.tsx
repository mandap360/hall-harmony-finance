
interface OpeningBalanceDisplayProps {
  openingBalance: number;
}

export const OpeningBalanceDisplay = ({ openingBalance }: OpeningBalanceDisplayProps) => {
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(balance);
  };

  return (
    <div className="mb-4">
      <p className="text-sm text-gray-500">Opening Balance</p>
      <p className="text-xl font-semibold text-gray-900">
        {formatBalance(openingBalance || 0)}
      </p>
    </div>
  );
};
