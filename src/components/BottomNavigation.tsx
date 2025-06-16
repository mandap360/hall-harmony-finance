
import { Home, Receipt, BarChart, MoreHorizontal } from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'admin' | 'manager';
}

export const BottomNavigation = ({ activeTab, onTabChange, userRole }: BottomNavigationProps) => {
  const tabs = [
    { id: "bookings", label: "Bookings", icon: Home },
    { id: "expenses", label: "Expenses", icon: Receipt },
    { id: "reports", label: "Reports", icon: BarChart },
    { id: "more", label: "More", icon: MoreHorizontal }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-rose-200 safe-area-pb">
      <div className="grid grid-cols-4 gap-1 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-rose-600 hover:bg-rose-50"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "mb-1" : "mb-1"}`} />
              <span className={`text-xs font-medium ${isActive ? "text-white" : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
