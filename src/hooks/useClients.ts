import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createSharedStore, createSingleFlight } from '@/hooks/useSharedState';

export interface Client {
  client_id: string;
  name: string;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

interface State {
  clients: Client[];
  loading: boolean;
  orgId: string | null;
}

const store = createSharedStore<State>({ clients: [], loading: true, orgId: null });
const singleFlight = createSingleFlight<void>();

const fetchAll = async (orgId: string) => {
  const { data, error } = await supabase
    .from('Clients')
    .select('*')
    .eq('organization_id', orgId)
    .order('name');
  if (error) throw error;
  store.set({ clients: (data || []) as Client[], loading: false, orgId });
};

export const useClients = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const state = store.useStore();

  useEffect(() => {
    const orgId = profile?.organization_id;
    if (!orgId) return;
    if (state.orgId === orgId && state.clients.length > 0) return;
    singleFlight(() => fetchAll(orgId)).catch((err) => {
      console.error('Error fetching clients:', err);
      toast({ title: 'Error', description: 'Failed to fetch clients', variant: 'destructive' });
    });
  }, [profile?.organization_id, state.orgId, state.clients.length, toast]);

  const refetch = async () => {
    if (!profile?.organization_id) return;
    await fetchAll(profile.organization_id);
  };

  const addClient = async (data: {
    name: string;
    phone_number?: string | null;
    email?: string | null;
    address?: string | null;
  }) => {
    if (!profile?.organization_id) throw new Error('No organization');
    try {
      const { data: inserted, error } = await supabase
        .from('Clients')
        .insert([{ ...data, organization_id: profile.organization_id }])
        .select()
        .single();
      if (error) throw error;
      await refetch();
      toast({ title: 'Success', description: 'Client added successfully' });
      return inserted as Client;
    } catch (error) {
      console.error('Error adding client:', error);
      toast({ title: 'Error', description: 'Failed to add client', variant: 'destructive' });
      throw error;
    }
  };

  const updateClient = async (
    client_id: string,
    data: Partial<Pick<Client, 'name' | 'phone_number' | 'email' | 'address'>>,
  ) => {
    try {
      const { error } = await supabase.from('Clients').update(data).eq('client_id', client_id);
      if (error) throw error;
      await refetch();
      toast({ title: 'Success', description: 'Client updated' });
    } catch (error) {
      console.error('Error updating client:', error);
      toast({ title: 'Error', description: 'Failed to update client', variant: 'destructive' });
    }
  };

  const deleteClient = async (client_id: string) => {
    try {
      const { error } = await supabase.from('Clients').delete().eq('client_id', client_id);
      if (error) throw error;
      await refetch();
      toast({ title: 'Success', description: 'Client deleted' });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({ title: 'Error', description: 'Failed to delete client', variant: 'destructive' });
    }
  };

  return {
    clients: state.clients,
    loading: state.loading,
    addClient,
    updateClient,
    deleteClient,
    refetch,
  };
};
