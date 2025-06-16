
import { BottomNavigation } from "@/components/BottomNavigation";
import { BookingsPage } from "@/components/BookingsPage";
import { ExpensePage } from "@/components/ExpensePage";
import { ReportsPage } from "@/components/ReportsPage";
import { MorePage } from "@/components/MorePage";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const { signOut, profile } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case "bookings":
        return <BookingsPage />;
      case "expenses":
        return <ExpensePage />;
      case "reports":
        return profile?.role === 'admin' ? <ReportsPage /> : <BookingsPage />;
      case "more":
        return profile?.role === 'admin' ? <MorePage /> : <BookingsPage />;
      default:
        return <BookingsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-rose-200 sticky top-0 z-10">
        <div className="p-4 flex justify-between items-center">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            {profile?.organization && (
              <span className="text-sm font-medium text-gray-700">
                Welcome {profile.organization.name}
              </span>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="text-gray-600 hover:text-rose-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        userRole={profile?.role || 'manager'}
      />
    </div>
  );
};

export default Index;
