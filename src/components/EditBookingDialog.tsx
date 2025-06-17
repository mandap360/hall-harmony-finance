
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { IndianRupee, Plus } from "lucide-react";
import { AdditionalIncomeTab } from "@/components/AdditionalIncomeTab";

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
    rent: "",
    advance: "",
    notes: ""
  });
  
  const [newPayment, setNewPayment] = useState({
    amount: "",
    date: "",
    type: "rent",
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
        rent: booking.rent.toString(),
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
      rent: parseInt(formData.rent),
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

    let updatedBooking = { ...booking };
    
    // If payment type is rent, add it to advance
    if (newPayment.type === 'rent') {
      updatedBooking.advance = (booking.advance || 0) + payment.amount;
    }

    // Add payment to payments array
    updatedBooking.payments = [...(booking.payments || []), payment];
    updatedBooking.paidAmount = (booking.paidAmount || 0) + payment.amount;

    onSubmit(updatedBooking);
    
    setNewPayment({
      amount: "",
      date: "",
      type: "rent",
      description: ""
    });
  };

  // Calculate additional income from payments
  const additionalIncome = (booking.payments || [])
    .filter(payment => payment.type === 'additional')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const remainingBalance = booking.rent - booking.advance;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-amber-800">Edit Booking</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-amber-200">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "details"
                ? "text-amber-700 border-b-2 border-amber-600 bg-amber-50"
                : "text-gray-500 hover:text-amber-600"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "payments"
                ? "text-amber-700 border-b-2 border-amber-600 bg-amber-50"
                : "text-gray-500 hover:text-amber-600"
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab("additional-income")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "additional-income"
                ? "text-amber-700 border-b-2 border-amber-600 bg-amber-50"
                : "text-gray-500 hover:text-amber-600"
            }`}
          >
            Additional Income
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
                className="border-amber-200 focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                required
                className="border-amber-200 focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                required
                className="border-amber-200 focus:border-amber-500"
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
                  className="border-amber-200 focus:border-amber-500"
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
                  className="border-amber-200 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rent">Rent *</Label>
                <Input
                  id="rent"
                  type="number"
                  value={formData.rent}
                  onChange={(e) => setFormData(prev => ({ ...prev, rent: e.target.value }))}
                  required
                  className="border-amber-200 focus:border-amber-500"
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
                  className="border-amber-200 focus:border-amber-500"
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
                className="border-amber-200 focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-amber-200 text-amber-700 hover:bg-amber-50">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                Update Booking
              </Button>
            </div>
          </form>
        )}

        {activeTab === "payments" && (
          <div className="space-y-4">
            {/* Payment Summary */}
            <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center text-blue-600 mb-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-semibold">{booking.rent}</span>
                  </div>
                  <p className="text-xs text-gray-500">Rent</p>
                </div>
                <div>
                  <div className="flex items-center justify-center text-green-600 mb-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-semibold">{booking.advance}</span>
                  </div>
                  <p className="text-xs text-gray-500">Advance</p>
                </div>
                <div>
                  <div className="flex items-center justify-center text-purple-600 mb-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-semibold">{additionalIncome}</span>
                  </div>
                  <p className="text-xs text-gray-500">Additional Income</p>
                </div>
              </div>
            </Card>

            {/* Add Payment */}
            <Card className="p-4 border-amber-200">
              <h3 className="font-semibold mb-3 text-amber-800">Add Payment</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                      className="border-amber-200 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentDate">Date *</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={newPayment.date}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, date: e.target.value }))}
                      className="border-amber-200 focus:border-amber-500"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="paymentType">Type</Label>
                  <select
                    id="paymentType"
                    value={newPayment.type}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2 border border-amber-200 rounded-md focus:border-amber-500"
                  >
                    <option value="rent">Rent</option>
                    <option value="additional">Additional Income</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newPayment.description}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    className="border-amber-200 focus:border-amber-500"
                  />
                </div>
                
                <Button
                  onClick={handleAddPayment}
                  disabled={!newPayment.amount || !newPayment.date}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </div>
            </Card>

            {/* Payment History */}
            {booking.payments && booking.payments.length > 0 && (
              <Card className="p-4 border-amber-200">
                <h3 className="font-semibold mb-3 text-amber-800">Payment History</h3>
                <div className="space-y-2">
                  {booking.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-2 bg-amber-50 rounded border border-amber-100">
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

        {activeTab === "additional-income" && booking && (
          <AdditionalIncomeTab bookingId={booking.id} />
        )}
      </DialogContent>
    </Dialog>
  );
};
