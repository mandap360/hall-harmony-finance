import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchVendors = useCallback(async () => {
    if (!profile?.organization_id) return;
    try {
      const { data, error } = await supabase
        .from('Vendors')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('name');
      if (error) throw error;
      setVendors((data || []) as Vendor[]);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({ title: 'Error', description: 'Failed to fetch vendors', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [profile?.organization_id, toast]);

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
      await fetchVendors();
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
      await fetchVendors();
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
      await fetchVendors();
      toast({ title: 'Success', description: 'Vendor deleted' });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({ title: 'Error', description: 'Failed to delete vendor', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (profile?.organization_id) fetchVendors();
  }, [profile?.organization_id, fetchVendors]);

  return { vendors, loading, addVendor, updateVendor, deleteVendor, refetch: fetchVendors };
};
