
import { BookingsPage } from "@/components/BookingsPage";
import { BankingPage } from "@/components/BankingPage";
import { TransactionsPage } from "@/components/TransactionsPage";
import { ExpensesPage } from "@/components/BillsPage";
import { ReportsPage } from "@/components/ReportsPage";
import { MorePage } from "@/components/MorePage";
import { useLocation } from "react-router-dom";

interface IndexProps {
  activeTab?: string;
}

const Index = ({ activeTab: propActiveTab }: IndexProps) => {
  const location = useLocation();
  
  const getActiveTabFromPath = () => {
    if (propActiveTab) return propActiveTab;
    const path = location.pathname;
    if (path === "/banking") return "banking";
    if (path === "/bills") return "bills";
    if (path === "/reports") return "reports";
    if (path === "/more") return "more";
    return "bookings";
  };
  
  const activeTab = getActiveTabFromPath();

  const renderContent = () => {
    switch (activeTab) {
      case "bookings":
        return <BookingsPage />;
      case "banking":
        return <BankingPage />;
      case "bills":
        return <ExpensesPage />;
      case "reports":
        return <ReportsPage />;
      case "more":
        return <MorePage />;
      default:
        return <BookingsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderContent()}
    </div>
  );
};

export default Index;
