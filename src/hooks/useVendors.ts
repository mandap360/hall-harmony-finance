import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createSharedStore, createSingleFlight } from '@/hooks/useSharedState';

export interface Vendor {
  vendor_id: string;
  name: string;
  phone_number: string | null;
  gstin: string | null;
  address: string | null;
  current_balance: number;
  organization_id: string | null;
  created_at: string;
}

interface State {
  vendors: Vendor[];
  loading: boolean;
  orgId: string | null;
}

const store = createSharedStore<State>({ vendors: [], loading: true, orgId: null });
const singleFlight = createSingleFlight<void>();

const fetchAll = async (orgId: string) => {
  const { data, error } = await supabase
    .from('Vendors')
    .select('*')
    .eq('organization_id', orgId)
    .order('name');
  if (error) throw error;
  store.set({ vendors: (data || []) as Vendor[], loading: false, orgId });
};

export const useVendors = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const state = store.useStore();

  useEffect(() => {
    const orgId = profile?.organization_id;
    if (!orgId) return;
    if (state.orgId === orgId && state.vendors.length > 0) return;
    singleFlight(() => fetchAll(orgId)).catch((err) => {
      console.error('Error fetching vendors:', err);
      toast({ title: 'Error', description: 'Failed to fetch vendors', variant: 'destructive' });
    });
  }, [profile?.organization_id, state.orgId, state.vendors.length, toast]);

  const refetch = async () => {
    if (!profile?.organization_id) return;
    await fetchAll(profile.organization_id);
  };

  const addVendor = async (data: {
    name: string;
    phone_number?: string | null;
    gstin?: string | null;
    address?: string | null;
  }) => {
    if (!profile?.organization_id) throw new Error('No organization');
    try {
      const { data: inserted, error } = await supabase
        .from('Vendors')
        .insert([{ ...data, organization_id: profile.organization_id }])
        .select()
        .single();
      if (error) throw error;
      await refetch();
      toast({ title: 'Success', description: 'Vendor added successfully' });
      return inserted as Vendor;
    } catch (error) {
      console.error('Error adding vendor:', error);
      toast({ title: 'Error', description: 'Failed to add vendor', variant: 'destructive' });
      throw error;
    }
  };

  const updateVendor = async (
    vendor_id: string,
    data: Partial<Pick<Vendor, 'name' | 'phone_number' | 'gstin' | 'address'>>,
  ) => {
    try {
      const { error } = await supabase.from('Vendors').update(data).eq('vendor_id', vendor_id);
      if (error) throw error;
      await refetch();
      toast({ title: 'Success', description: 'Vendor updated' });
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast({ title: 'Error', description: 'Failed to update vendor', variant: 'destructive' });
    }
  };

  const deleteVendor = async (vendor_id: string) => {
    try {
      const { error } = await supabase.from('Vendors').delete().eq('vendor_id', vendor_id);
      if (error) throw error;
      await refetch();
      toast({ title: 'Success', description: 'Vendor deleted' });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({ title: 'Error', description: 'Failed to delete vendor', variant: 'destructive' });
    }
  };

  return { vendors: state.vendors, loading: state.loading, addVendor, updateVendor, deleteVendor, refetch };
};
