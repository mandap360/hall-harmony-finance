
import { ExpenseCard } from "@/components/ExpenseCard";
import { Expense } from "@/hooks/useExpenses";

interface ExpenseListProps {
  expenses: Expense[];
}

export const ExpenseList = ({ expenses }: ExpenseListProps) => {
  return (
    <div className="p-4">
      <div className="space-y-3">
        {expenses.map((expense) => (
          <ExpenseCard key={expense.id} expense={expense} />
        ))}
      </div>
    </div>
  );
};
