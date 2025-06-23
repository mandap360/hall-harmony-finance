
export const TransactionHeaders = () => {
  return (
    <div className="grid grid-cols-5 gap-4 p-4 bg-gray-100 rounded-lg mb-4 text-sm font-medium text-gray-700">
      <div>Date</div>
      <div>Description</div>
      <div className="text-right">Money In</div>
      <div className="text-right">Money Out</div>
      <div className="text-right">Balance</div>
    </div>
  );
};
