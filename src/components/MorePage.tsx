import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tag, Shield, Users, Building2, Receipt } from 'lucide-react';
import { CategoriesPage } from '@/components/CategoriesPage';
import { ClientsPage } from '@/components/ClientsPage';
import { VendorsPage } from '@/components/VendorsPage';
import { BillsPage } from '@/components/BillsPage';
import { PasswordSecuritySettings } from '@/components/PasswordSecuritySettings';

export const MorePage = () => {
  const [view, setView] = useState<'menu' | 'categories' | 'clients' | 'vendors' | 'bills' | 'password'>('menu');

  const items = [
    { icon: Users, label: 'Clients', description: 'Manage your client list', view: 'clients' as const },
    { icon: Building2, label: 'Vendors', description: 'Manage your vendors', view: 'vendors' as const },
    { icon: Receipt, label: 'Bills', description: 'Track vendor bills and payments', view: 'bills' as const },
    { icon: Tag, label: 'Categories', description: 'Manage account categories', view: 'categories' as const },
    { icon: Shield, label: 'Password & Security', description: 'Update your password', view: 'password' as const },
  ];

  if (view === 'categories') return <CategoriesPage onBack={() => setView('menu')} />;
  if (view === 'clients') return <Wrap onBack={() => setView('menu')}><ClientsPage /></Wrap>;
  if (view === 'vendors') return <Wrap onBack={() => setView('menu')}><VendorsPage /></Wrap>;
  if (view === 'bills') return <Wrap onBack={() => setView('menu')}><BillsPage /></Wrap>;
  if (view === 'password') return <Wrap onBack={() => setView('menu')}><PasswordSecuritySettings /></Wrap>;

  return (
    <div className="p-4 space-y-3 max-w-3xl mx-auto">
      {items.map((i) => {
        const Icon = i.icon;
        return (
          <Card key={i.label} className="p-4 hover:shadow-md transition cursor-pointer" onClick={() => setView(i.view)}>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{i.label}</h3>
                <p className="text-sm text-muted-foreground">{i.description}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const Wrap = ({ children, onBack }: { children: React.ReactNode; onBack: () => void }) => (
  <div>
    <div className="p-4 border-b">
      <button onClick={onBack} className="text-primary hover:underline">
        ← Back
      </button>
    </div>
    {children}
  </div>
);
