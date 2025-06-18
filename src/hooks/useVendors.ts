
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Vendor {
  id: string;
  businessName: string;
  contactPerson?: string;
  phoneNumber?: string;
  gstin?: string;
  address?: string;
  createdAt: string;
}

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchVendors = async () => {
    try {
      setLoading(true);
      console.log("Fetching vendors from Supabase...");
      
      const { data: vendorsData, error } = await supabase
        .from('vendors')
        .select('*')
        .order('business_name', { ascending: true });

      if (error) {
        console.error('Error fetching vendors:', error);
        throw error;
      }

      console.log("Raw vendors data:", vendorsData);

      const transformedVendors: Vendor[] = (vendorsData || []).map(vendor => ({
        id: vendor.id,
        businessName: vendor.business_name,
        contactPerson: vendor.contact_person,
        phoneNumber: vendor.phone_number,
        gstin: vendor.gstin,
        address: vendor.address,
        createdAt: vendor.created_at
      }));

      console.log("Transformed vendors:", transformedVendors);
      setVendors(transformedVendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vendors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const addVendor = async (vendorData: Omit<Vendor, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert({
          business_name: vendorData.businessName,
          contact_person: vendorData.contactPerson,
          phone_number: vendorData.phoneNumber,
          gstin: vendorData.gstin,
          address: vendorData.address
        })
        .select()
        .single();

      if (error) throw error;

      await fetchVendors();
      toast({
        title: "Success",
        description: "Vendor added successfully",
      });
    } catch (error) {
      console.error('Error adding vendor:', error);
      toast({
        title: "Error",
        description: "Failed to add vendor",
        variant: "destructive",
      });
    }
  };

  const updateVendor = async (updatedVendor: Vendor) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          business_name: updatedVendor.businessName,
          contact_person: updatedVendor.contactPerson,
          phone_number: updatedVendor.phoneNumber,
          gstin: updatedVendor.gstin,
          address: updatedVendor.address
        })
        .eq('id', updatedVendor.id);

      if (error) throw error;

      await fetchVendors();
      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast({
        title: "Error",
        description: "Failed to update vendor",
        variant: "destructive",
      });
    }
  };

  const deleteVendor = async (vendorId: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);

      if (error) throw error;

      await fetchVendors();
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive",
      });
    }
  };

  return {
    vendors,
    loading,
    addVendor,
    updateVendor,
    deleteVendor,
    refetch: fetchVendors
  };
};
