import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchClients = useCallback(async () => {
    if (!profile?.organization_id) return;
    try {
      const { data, error } = await supabase
        .from('Clients')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('name');
      if (error) throw error;
      setClients((data || []) as Client[]);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({ title: 'Error', description: 'Failed to fetch clients', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [profile?.organization_id, toast]);

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
      await fetchClients();
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
      await fetchClients();
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
      await fetchClients();
      toast({ title: 'Success', description: 'Client deleted' });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({ title: 'Error', description: 'Failed to delete client', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (profile?.organization_id) fetchClients();
  }, [profile?.organization_id, fetchClients]);

  return { clients, loading, addClient, updateClient, deleteClient, refetch: fetchClients };
};
