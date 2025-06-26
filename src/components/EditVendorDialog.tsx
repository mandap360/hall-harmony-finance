
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: any;
  onSubmit: (vendorData: any) => void;
}

export const EditVendorDialog = ({ open, onOpenChange, vendor, onSubmit }: EditVendorDialogProps) => {
  const [formData, setFormData] = useState({
    businessName: "",
    phoneNumber: "",
    gstin: "",
    address: ""
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        businessName: vendor.businessName || "",
        phoneNumber: vendor.phoneNumber || "",
        gstin: vendor.gstin || "",
        address: vendor.address || ""
      });
    }
  }, [vendor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim()) return;

    onSubmit({
      ...vendor,
      ...formData
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Payee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="businessName">
              Payee Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleChange("businessName", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="gstin">GSTIN</Label>
            <Input
              id="gstin"
              value={formData.gstin}
              onChange={(e) => handleChange("gstin", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Payee</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
