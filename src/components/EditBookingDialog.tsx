
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { IndianRupee, Plus } from "lucide-react";

interface EditBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onSubmit: (booking: any) => void;
}

export const EditBookingDialog = ({ open, onOpenChange, booking, onSubmit }: EditBookingDialogProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const [formData, setFormData] = useState({
    eventName: "",
    clientName: "",
    phoneNumber: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    totalRent: "",
    advance: "",
    notes: ""
  });
  
  const [newPayment, setNewPayment] = useState({
    amount: "",
    date: "",
    type: "balance", // balance or additional
    description: ""
  });

  useEffect(() => {
    if (booking) {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      
      setFormData({
        eventName: booking.eventName,
        clientName: booking.clientName,
        phoneNumber: booking.phoneNumber,
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endDate: endDate.toISOString().split('T')[0],
        endTime: endDate.toTimeString().slice(0, 5),
        totalRent: booking.totalRent.toString(),
        advance: booking.advance.toString(),
        notes: booking.notes || ""
      });
    }
  }, [booking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedBooking = {
      ...booking,
      eventName: formData.eventName,
      clientName: formData.clientName,
      phoneNumber: formData.phoneNumber,
      startDate: `${formData.startDate}T${formData.startTime}`,
      endDate: `${formData.endDate}T${formData.endTime}`,
      totalRent: parseInt(formData.totalRent),
      advance: parseInt(formData.advance),
      notes: formData.notes
    };

    onSubmit(updatedBooking);
  };

  const handleAddPayment = () => {
    if (!newPayment.amount || !newPayment.date) return;

    const payment = {
      id: Date.now().toString(),
      amount: parseInt(newPayment.amount),
      date: newPayment.date,
      type: newPayment.type,
      description: newPayment.description
    };

    const updatedBooking = {
      ...booking,
      payments: [...(booking.payments || []), payment],
      paidAmount: (booking.paidAmount || 0) + payment.amount
    };

    onSubmit(updatedBooking);
    
    setNewPayment({
      amount: "",
      date: "",
      type: "balance",
      description: ""
    });
  };

  const totalPaid = (booking.paidAmount || 0);
  const remainingBalance = booking.totalRent - booking.advance - totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 border-b">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === "details"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === "payments"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Payments
          </button>
        </div>

        {activeTab === "details" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                value={formData.eventName}
                onChange={(e) => setFormData(prev => ({ ...prev, eventName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalRent">Total Rent *</Label>
                <Input
                  id="totalRent"
                  type="number"
                  value={formData.totalRent}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalRent: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advance">Advance *</Label>
                <Input
                  id="advance"
                  type="number"
                  value={formData.advance}
                  onChange={(e) => setFormData(prev => ({ ...prev, advance: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Booking</Button>
            </div>
          </form>
        )}

        {activeTab === "payments" && (
          <div className="space-y-4">
            {/* Payment Summary */}
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center text-green-600 mb-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-semibold">{booking.advance}</span>
                  </div>
                  <p className="text-xs text-gray-500">Advance</p>
                </div>
                <div>
                  <div className="flex items-center justify-center text-blue-600 mb-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-semibold">{totalPaid}</span>
                  </div>
                  <p className="text-xs text-gray-500">Paid</p>
                </div>
                <div>
                  <div className="flex items-center justify-center text-orange-600 mb-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-semibold">{remainingBalance}</span>
                  </div>
                  <p className="text-xs text-gray-500">Remaining</p>
                </div>
              </div>
            </Card>

            {/* Add Payment */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Add Payment</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentDate">Date *</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={newPayment.date}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="paymentType">Type</Label>
                  <select
                    id="paymentType"
                    value={newPayment.type}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="balance">Balance Rent</option>
                    <option value="additional">Additional (Gas/EB)</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newPayment.description}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                  />
                </div>
                
                <Button
                  onClick={handleAddPayment}
                  disabled={!newPayment.amount || !newPayment.date}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </div>
            </Card>

            {/* Payment History */}
            {booking.payments && booking.payments.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Payment History</h3>
                <div className="space-y-2">
                  {booking.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="flex items-center text-green-600">
                          <IndianRupee className="h-4 w-4" />
                          <span className="font-semibold">{payment.amount}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.date).toLocaleDateString('en-IN')} • {payment.type}
                        </p>
                        {payment.description && (
                          <p className="text-xs text-gray-600">{payment.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
