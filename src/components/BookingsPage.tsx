import { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddBookingDialog } from '@/components/AddBookingDialog';
import { EditBookingDialog } from '@/components/EditBookingDialog';
import { useBookings, type Booking } from '@/hooks/useBookings';
import { BookingTableView } from '@/components/booking/BookingTableView';
import { BookingCalendarView } from '@/components/booking/BookingCalendarView';
import { MonthNavigation } from '@/components/MonthNavigation';
import { addMonths, subMonths } from 'date-fns';

export const BookingsPage = () => {
  const { bookings, loading, addBooking, updateBooking, cancelBooking } = useBookings();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const filtered = useMemo(() => {
    const m = currentDate.getMonth();
    const y = currentDate.getFullYear();
    return bookings
      .filter((b) => {
        const s = searchTerm.toLowerCase();
        const match =
          !searchTerm ||
          b.eventName.toLowerCase().includes(s) ||
          (b.clientName || '').toLowerCase().includes(s) ||
          (b.phoneNumber || '').toLowerCase().includes(s);
        const parts = b.startDate.split('T')[0].split('-');
        const bm = parseInt(parts[1], 10) - 1;
        const by = parseInt(parts[0], 10);
        return match && bm === m && by === y;
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [bookings, searchTerm, currentDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search bookings…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                Calendar
              </Button>
            </div>
          </div>
          <MonthNavigation
            currentDate={currentDate}
            onPreviousMonth={() => setCurrentDate((d) => subMonths(d, 1))}
            onNextMonth={() => setCurrentDate((d) => addMonths(d, 1))}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === 'list' ? (
          <BookingTableView bookings={filtered} onEditBooking={(b) => setEditing(b)} onCancelBooking={cancelBooking} />
        ) : (
          <BookingCalendarView
            bookings={filtered}
            currentDate={currentDate}
            onEditBooking={(b) => setEditing(b)}
            onCancelBooking={cancelBooking}
          />
        )}
      </div>

      <Button
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddBookingDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={(data) => {
          addBooking(data);
          setShowAddDialog(false);
        }}
      />

      {editing && (
        <EditBookingDialog
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          booking={editing}
          onSubmit={(id, data) => {
            updateBooking(id, data);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
};
