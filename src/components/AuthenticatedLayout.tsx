
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useLocation } from 'react-router-dom';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayoutContent = ({ children }: AuthenticatedLayoutProps) => {
  const { user, profile, signOut } = useAuth();
  const { toggleSidebar, open, isMobile } = useSidebar();
  const location = useLocation();
  const isBookingsPage = location.pathname === '/';

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="fixed top-0 left-0 right-0 bg-[hsl(var(--header-background))] border-b border-border h-14 flex items-center w-full shrink-0 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar} 
          className={`h-7 w-7 text-[hsl(var(--header-foreground))] hover:bg-white/10 transition-all duration-200 flex items-center justify-center absolute z-10 ${
            isMobile 
              ? 'left-2' 
              : open 
                ? 'left-[256px]' 
                : 'left-[48px]'
          }`}
        >
          <Menu className="h-4 w-4" />
        </Button>
          
          <div className="flex-1">
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-[hsl(var(--header-foreground))] hover:bg-white/10">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">{profile?.full_name || profile?.business_name || "User"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium">{profile?.business_name}</p>
                <p className="text-muted-foreground">{user?.email}</p>
                {profile?.organization_id && (
                  <p className="text-xs text-muted-foreground mt-1">Organization: {profile.organization_id}</p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        <div className="pt-14 flex w-full">
          <AppSidebar />
          <main className="flex-1 min-w-0">
            {children}
          </main>
      </div>
    </div>
  );
};

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
    </SidebarProvider>
  );
};
