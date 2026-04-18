import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useVendors, type Vendor } from '@/hooks/useVendors';
import { useEffect } from 'react';

const VendorDialog = ({
  open,
  onOpenChange,
  vendor,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  vendor?: Vendor | null;
}) => {
  const { addVendor, updateVendor } = useVendors();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (open) {
      setName(vendor?.name || '');
      setPhone(vendor?.phone_number || '');
      setGstin(vendor?.gstin || '');
      setAddress(vendor?.address || '');
    }
  }, [open, vendor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vendor) {
      await updateVendor(vendor.vendor_id, {
        name,
        phone_number: phone || null,
        gstin: gstin || null,
        address: address || null,
      });
    } else {
      await addVendor({
        name,
        phone_number: phone || null,
        gstin: gstin || null,
        address: address || null,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{vendor ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>GSTIN</Label>
            <Input value={gstin} onChange={(e) => setGstin(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{vendor ? 'Update' : 'Add Vendor'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const VendorsPage = () => {
  const { vendors, loading, deleteVendor } = useVendors();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);

  const filtered = vendors.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()));

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
        <h1 className="text-2xl font-bold text-foreground mb-6">Vendors</h1>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search vendors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No vendors yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((v) => (
              <Card key={v.vendor_id} className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{v.name}</h3>
                    {v.phone_number && (
                      <p className="text-sm text-muted-foreground">Phone: {v.phone_number}</p>
                    )}
                    {v.gstin && <p className="text-sm text-muted-foreground">GSTIN: {v.gstin}</p>}
                    {v.address && <p className="text-sm text-muted-foreground">{v.address}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="font-semibold text-foreground">
                        ₹{Number(v.current_balance).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(v)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm('Delete this vendor?')) deleteVendor(v.vendor_id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

      <VendorDialog open={showAdd} onOpenChange={setShowAdd} />
      {editing && <VendorDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} vendor={editing} />}
    </div>
  );
};
