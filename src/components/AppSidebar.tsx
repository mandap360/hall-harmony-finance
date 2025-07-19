
import { Calendar, Receipt, BarChart3, Settings, User, CreditCard, TrendingUp } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Bookings", url: "/bookings", icon: Calendar },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Accounts", url: "/accounts", icon: CreditCard },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "More", url: "/more", icon: Settings },
];

export function AppSidebar() {
  const { state, open, isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, profile } = useAuth();

  const isActive = (path: string) => {
    if (path === "/bookings" && currentPath === "/") return true;
    return currentPath === path;
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";

  return (
    <Sidebar 
      side="left"
      variant="sidebar"
      collapsible="icon"
      className={isMobile ? "w-64" : "w-16 group-data-[state=expanded]:w-64"}
    >
      <SidebarHeader className="border-b border-sidebar-border h-14 flex items-center">
        <div className="flex items-center px-4">
          {(open || isMobile) && <h2 className="text-sidebar-foreground font-semibold text-lg">Mandap360</h2>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className={`transition-opacity duration-200 ${(open || isMobile) ? 'opacity-100' : 'opacity-0'}`}>
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
