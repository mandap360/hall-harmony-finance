
import { BookingsPage } from "@/components/BookingsPage";
import { ExpensePage } from "@/components/ExpensePage";
import { AccountsPage } from "@/components/AccountsPage";
import { TransactionsPage } from "@/components/TransactionsPage";
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
    if (path === "/accounts") return "accounts";
    if (path === "/reports") return "reports";
    if (path === "/transactions" || path === "/stats") return "transactions";
    if (path === "/more") return "more";
    return "bookings";
  };
  
  const activeTab = getActiveTabFromPath();

  const renderContent = () => {
    switch (activeTab) {
      case "bookings":
        return <BookingsPage />;
      case "transactions":
      case "stats":
        return <TransactionsPage />;
      case "accounts":
        return <AccountsPage />;
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
