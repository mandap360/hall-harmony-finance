
interface TransactionHeadersProps {
  showBalance?: boolean;
}

export const TransactionHeaders = ({ showBalance = true }: TransactionHeadersProps) => {
  return (
    <div className={`grid gap-2 md:gap-4 p-3 md:p-4 bg-gray-100 rounded-lg mb-4 text-xs md:text-sm font-medium text-gray-700 ${
      showBalance ? 'grid-cols-4' : 'grid-cols-3'
    }`}>
      <div>Date</div>
      <div>Description</div>
      <div className="text-right">Amount</div>
      {showBalance && <div className="text-right">Balance</div>}
    </div>
  );
};
