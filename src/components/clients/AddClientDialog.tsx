import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useClients, type Client } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import {
  isValidEmail,
  isValidOptionalPhone,
  isValidPhone,
  sanitizePhoneInput,
} from '@/utils/validation';
import { VALIDATION_MESSAGES } from '@/utils/messages';
import { DialogFormFooter } from '@/components/shared/DialogFormFooter';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onCreated?: (client: Client) => void;
}

export const AddClientDialog = ({ open, onOpenChange, client, onCreated }: AddClientDialogProps) => {
  const { addClient, updateClient } = useClients();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const { submitting, reset, run } = useSubmitGuard();

  useEffect(() => {
    if (open) {
      setName(client?.name || '');
      setPhone(client?.phone_number || '');
      setAlternatePhone(client?.alternate_phone_number || '');
      setEmail(client?.email || '');
      setAddress(client?.address || '');
      reset();
    }
  }, [open, client, reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      toast({ ...VALIDATION_MESSAGES.nameRequired, variant: 'destructive' });
      return;
    }
    if (!isValidPhone(phone)) {
      toast({ ...VALIDATION_MESSAGES.phoneInvalid, variant: 'destructive' });
      return;
    }
    if (!isValidOptionalPhone(alternatePhone)) {
      toast({ ...VALIDATION_MESSAGES.alternatePhoneInvalid, variant: 'destructive' });
      return;
    }
    if (!trimmedAddress) {
      toast({ ...VALIDATION_MESSAGES.addressRequired, variant: 'destructive' });
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      toast({ ...VALIDATION_MESSAGES.emailInvalid, variant: 'destructive' });
      return;
    }

    await run(async () => {
      const payload = {
        name: trimmedName,
        phone_number: phone,
        alternate_phone_number: alternatePhone || null,
        email: trimmedEmail || null,
        address: trimmedAddress,
      };

      if (client) {
        await updateClient(client.client_id, payload);
        onOpenChange(false);
      } else {
        const created = await addClient(payload);
        if (created && onCreated) onCreated(created);
        else onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{client ? 'Edit Client' : 'Add Client'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Phone Number *</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
              inputMode="numeric"
              maxLength={10}
              placeholder="10 digit number"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Alternate Number</Label>
            <Input
              value={alternatePhone}
              onChange={(e) => setAlternatePhone(sanitizePhoneInput(e.target.value))}
              inputMode="numeric"
              maxLength={10}
              placeholder="10 digit number (optional)"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Address *</Label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} required />
          </div>
          <DialogFormFooter
            onCancel={() => onOpenChange(false)}
            submitLabel={client ? 'Update' : 'Add Client'}
            submitting={submitting}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
