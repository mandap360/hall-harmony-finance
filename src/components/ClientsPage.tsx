import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useClients, type Client } from '@/hooks/useClients';
import { AddClientDialog } from '@/components/clients/AddClientDialog';

export const ClientsPage = () => {
  const { clients, loading, deleteClient } = useClients();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone_number || '').toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {search ? 'No clients match your search' : 'No clients yet. Add your first client.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <Card key={c.client_id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{c.name}</h3>
                    {c.phone_number && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" /> {c.phone_number}
                      </p>
                    )}
                    {c.email && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3" /> {c.email}
                      </p>
                    )}
                    {c.address && (
                      <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1">
                        <MapPin className="h-3 w-3 mt-1 flex-shrink-0" /> {c.address}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(c)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm('Delete this client?')) deleteClient(c.client_id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddClientDialog open={showAdd} onOpenChange={setShowAdd} />
      {editing && (
        <AddClientDialog
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          client={editing}
        />
      )}
    </div>
  );
};
