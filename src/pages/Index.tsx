
import { BottomNavigation } from "@/components/BottomNavigation";
import { BookingsPage } from "@/components/BookingsPage";
import { ExpensePage } from "@/components/ExpensePage";
import { ReportsPage } from "@/components/ReportsPage";
import { MorePage } from "@/components/MorePage";
import { useState } from "react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("bookings");

  const renderContent = () => {
    switch (activeTab) {
      case "bookings":
        return <BookingsPage />;
      case "expenses":
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Content */}
      <div className="pb-20">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
