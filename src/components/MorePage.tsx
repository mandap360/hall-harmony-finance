
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Settings, User, HelpCircle, Info, Calculator, Tag, Users, CreditCard } from "lucide-react";
import { TaxManagement } from "@/components/TaxManagement";
import { CategoryManagement } from "@/components/CategoryManagement";
import { VendorManagement } from "@/components/VendorManagement";
import { BankingPage } from "@/components/BankingPage";

export const MorePage = () => {
  const [currentView, setCurrentView] = useState("menu");

  const menuItems = [
    { 
      icon: CreditCard, 
      label: "Banking", 
      description: "Manage cash and bank accounts",
      action: () => setCurrentView("banking")
    },
    { 
      icon: Calculator, 
      label: "Tax Management", 
      description: "Manage GST rates",
      action: () => setCurrentView("tax")
    },
    { 
      icon: Tag, 
      label: "Category Management", 
      description: "Manage income and expense categories",
      action: () => setCurrentView("categories")
    },
    { 
      icon: Users, 
      label: "Vendors", 
      description: "Manage vendor information",
      action: () => setCurrentView("vendors")
    },
    { icon: Settings, label: "Settings", description: "App preferences" },
    { icon: User, label: "Profile", description: "Manage your profile" },
    { icon: HelpCircle, label: "Help & Support", description: "Get assistance" },
    { icon: Info, label: "About", description: "App information" },
  ];

  if (currentView === "banking") {
    return (
      <div>
        <div className="p-4 border-b">
          <button 
            onClick={() => setCurrentView("menu")}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
        </div>
        <BankingPage />
      </div>
    );
  }

  if (currentView === "tax") {
    return (
      <div>
        <div className="p-4 border-b">
          <button 
            onClick={() => setCurrentView("menu")}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
        </div>
        <TaxManagement />
      </div>
    );
  }

  if (currentView === "categories") {
    return (
      <div>
        <div className="p-4 border-b">
          <button 
            onClick={() => setCurrentView("menu")}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
        </div>
        <CategoryManagement />
      </div>
    );
  }

  if (currentView === "vendors") {
    return (
      <div>
        <div className="p-4 border-b">
          <button 
            onClick={() => setCurrentView("menu")}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
        </div>
        <VendorManagement />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card 
              key={item.label} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={item.action}
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.label}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
