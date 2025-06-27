
interface TransactionHeadersProps {
  showBalance?: boolean;
}

export const TransactionHeaders = ({ showBalance = true }: TransactionHeadersProps) => {
  return (
    <div className={`grid gap-4 p-4 bg-gray-100 rounded-lg mb-4 text-sm font-medium text-gray-700 ${
      showBalance ? 'grid-cols-5' : 'grid-cols-4'
    }`}>
      <div>Date</div>
      <div>Description</div>
      <div className="text-right">Money In</div>
      <div className="text-right">Money Out</div>
      {showBalance && <div className="text-right">Balance</div>}
    </div>
  );
};
