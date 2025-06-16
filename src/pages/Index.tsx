
import { useState } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { BookingsPage } from "@/components/BookingsPage";
import { ExpensePage } from "@/components/ExpensePage";
import { ReportsPage } from "@/components/ReportsPage";
import { MorePage } from "@/components/MorePage";

const Index = () => {
  const [activeTab, setActiveTab] = useState("bookings");

  const renderActivePage = () => {
    switch (activeTab) {
      case "bookings":
        return <BookingsPage />;
      case "expense":
        return <ExpensePage />;
      case "reports":
        return <ReportsPage />;
      case "more":
        return <MorePage />;
      default:
        return <BookingsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 pb-20">
        {renderActivePage()}
      </div>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
