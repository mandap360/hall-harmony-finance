
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useLocation } from 'react-router-dom';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const isBookingsPage = location.pathname === '/';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-background">
        <header className="bg-[hsl(var(--header-background))] border-b border-border h-14 flex items-center px-4 w-full shrink-0">
          <SidebarTrigger className="mr-4 p-2 hover:bg-white/10 rounded-md transition-colors">
            <Menu className="h-4 w-4 text-[hsl(var(--header-foreground))]" />
          </SidebarTrigger>
          
          <div className="flex-1">
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-[hsl(var(--header-foreground))] hover:bg-white/10">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">{profile?.business_name || "User"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium">{profile?.business_name}</p>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        <div className="flex-1 flex w-full overflow-hidden">
          <AppSidebar />
          <main className="flex-1 min-w-0 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
