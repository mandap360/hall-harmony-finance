import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useClients } from '@/hooks/useClients';
import { Plus } from 'lucide-react';
import { AddClientDialog } from '@/components/clients/AddClientDialog';

interface AddBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    eventName: string;
    clientId: string;
    startDate: string;
    endDate: string;
    rentFinalized: number;
    notes?: string;
  }) => void;
}

export const AddBookingDialog = ({ open, onOpenChange, onSubmit }: AddBookingDialogProps) => {
  const { clients, refetch: refetchClients } = useClients();
  const [showAddClient, setShowAddClient] = useState(false);

  const [eventName, setEventName] = useState('');
  const [clientId, setClientId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('22:00');
  const [rentFinalized, setRentFinalized] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setEventName('');
      setClientId('');
      setStartDate('');
      setEndDate('');
      setRentFinalized('');
      setNotes('');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;
    onSubmit({
      eventName,
      clientId,
      startDate: `${startDate}T${startTime}:00`,
      endDate: `${endDate}T${endTime}:00`,
      rentFinalized: parseFloat(rentFinalized) || 0,
      notes: notes || undefined,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Booking</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Event Name *</Label>
              <Input value={eventName} onChange={(e) => setEventName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Client *</Label>
              <div className="flex gap-2">
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.client_id} value={c.client_id}>
                        {c.name}
                        {c.phone_number ? ` — ${c.phone_number}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setShowAddClient(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rent Finalized *</Label>
              <Input
                type="number"
                step="0.01"
                value={rentFinalized}
                onChange={(e) => setRentFinalized(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Booking</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AddClientDialog
        open={showAddClient}
        onOpenChange={setShowAddClient}
        onCreated={async (c) => {
          await refetchClients();
          setClientId(c.client_id);
          setShowAddClient(false);
        }}
      />
    </>
  );
};
