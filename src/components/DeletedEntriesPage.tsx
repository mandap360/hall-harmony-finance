
import { Calendar, User, Phone, IndianRupee, FileText, Building } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDeletedEntries, DeletedEntry } from "@/hooks/useDeletedEntries";

export const DeletedEntriesPage = () => {
  const { deletedEntries, loading } = useDeletedEntries();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilPermanentDeletion = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const permanentDeleteDate = new Date(deletedDate.getTime() + 10 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysLeft = Math.ceil((permanentDeleteDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Deleted Entries</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading deleted entries...</p>
        </div>
      </div>
    );
  }

  if (deletedEntries.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Deleted Entries</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No deleted entries found.</p>
          <p className="text-sm text-gray-400 mt-2">
            Deleted entries are stored here for 10 days before being permanently removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Deleted Entries</h2>
        <p className="text-sm text-gray-600 mt-1">
          These entries will be permanently deleted after 10 days. This page is for viewing only.
        </p>
      </div>

      <div className="space-y-4">
        {deletedEntries.map((entry) => (
          <Card key={`${entry.type}-${entry.id}`} className="p-4 opacity-75 border-red-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                {entry.type === 'booking' ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Booking
                      </Badge>
                      <Badge variant="destructive" className="text-xs">
                        Deleted {getDaysUntilPermanentDeletion(entry.deletedAt)} days left
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {entry.eventName}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-1">
                      <User className="h-4 w-4 mr-2" />
                      <span className="text-sm">{entry.clientName}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="text-sm">{entry.phoneNumber}</span>
                    </div>
                    <div className="flex items-center text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {formatDate(entry.startDate)} - {formatDate(entry.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span className="font-semibold">₹{entry.rent.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-orange-50 text-orange-700">
                        Expense
                      </Badge>
                      <Badge variant="destructive" className="text-xs">
                        Deleted {getDaysUntilPermanentDeletion(entry.deletedAt)} days left
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {entry.vendorName}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-1">
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="text-sm">Invoice: {entry.billNumber}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Building className="h-4 w-4 mr-2" />
                      <span className="text-sm">{entry.category}</span>
                    </div>
                    <div className="flex items-center text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{formatDate(entry.date)}</span>
                    </div>
                    <div className="flex items-center text-red-600">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span className="font-semibold">₹{entry.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-xs text-gray-500 border-t pt-2">
              Deleted on: {formatDateTime(entry.deletedAt)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
