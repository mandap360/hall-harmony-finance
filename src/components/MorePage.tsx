
import { Card } from "@/components/ui/card";
import { Settings, User, HelpCircle, Info } from "lucide-react";

export const MorePage = () => {
  const menuItems = [
    { icon: Settings, label: "Settings", description: "App preferences" },
    { icon: User, label: "Profile", description: "Manage your profile" },
    { icon: HelpCircle, label: "Help & Support", description: "Get assistance" },
    { icon: Info, label: "About", description: "App information" },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">More</h1>
        <p className="text-gray-600">Settings and additional options</p>
      </div>

      <div className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
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
