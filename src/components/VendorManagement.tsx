
import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AddVendorDialog } from "@/components/AddVendorDialog";
import { EditVendorDialog } from "@/components/EditVendorDialog";
import { useVendors } from "@/hooks/useVendors";

export const VendorManagement = () => {
  const { vendors, loading, addVendor, updateVendor, deleteVendor } = useVendors();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddVendor = (vendorData: any) => {
    addVendor(vendorData);
    setShowAddDialog(false);
  };

  const handleUpdateVendor = (updatedVendor: any) => {
    updateVendor(updatedVendor);
    setEditingVendor(null);
  };

  const handleDeleteVendor = (vendorId: string) => {
    if (confirm("Are you sure you want to delete this party?")) {
      deleteVendor(vendorId);
    }
  };

  // Filter vendors based on search term
  const filteredVendors = vendors.filter(vendor => {
    const searchLower = searchTerm.toLowerCase();
    return (
      vendor.businessName.toLowerCase().includes(searchLower) ||
      vendor.phoneNumber?.toLowerCase().includes(searchLower) ||
      vendor.gstin?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Party Management</h1>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search by party name, phone number, or GSTIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredVendors.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? "No parties found matching your search" : "No parties found"}
            </p>
            {!searchTerm && (
              <p className="text-gray-400 text-sm mt-2">Click the + button to add your first party</p>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {vendor.businessName}
                    </h3>
                    {vendor.phoneNumber && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Phone:</span> {vendor.phoneNumber}
                      </p>
                    )}
                    {vendor.gstin && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">GSTIN:</span> {vendor.gstin}
                      </p>
                    )}
                    {vendor.address && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Address:</span> {vendor.address}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingVendor(vendor)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddVendorDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddVendor}
      />

      {editingVendor && (
        <EditVendorDialog
          open={!!editingVendor}
          onOpenChange={(open) => !open && setEditingVendor(null)}
          vendor={editingVendor}
          onSubmit={handleUpdateVendor}
        />
      )}
    </div>
  );
};
