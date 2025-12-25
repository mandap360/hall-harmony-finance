import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search } from "lucide-react";
import { Account } from "@/hooks/useAccounts";
import { EditVendorDialog } from "@/components/EditVendorDialog";

interface PartySectionProps {
  accounts: Account[];
  onAccountClick: (account: Account) => void;
  formatBalance: (balance: number) => string;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
}

export const PartySection = ({ 
  accounts, 
  onAccountClick, 
  formatBalance,
  onEdit,
  onDelete
}: PartySectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingParty, setEditingParty] = useState<Account | null>(null);

  const filteredParties = accounts.filter(account => {
    const searchLower = searchTerm.toLowerCase();
    return (
      account.name.toLowerCase().includes(searchLower) ||
      account.sub_type?.toLowerCase().includes(searchLower)
    );
  });

  const handleEditParty = (updatedData: any) => {
    if (editingParty) {
      onEdit({
        ...editingParty,
        name: updatedData.businessName,
        sub_type: JSON.stringify({
          gstin: updatedData.gstin,
          phone_number: updatedData.phoneNumber,
          address: updatedData.address
        })
      });
      setEditingParty(null);
    }
  };

  const getPartyDetails = (account: Account) => {
    if (!account.sub_type) return { gstin: '', phone_number: '', address: '' };
    try {
      return JSON.parse(account.sub_type);
    } catch {
      return { gstin: '', phone_number: '', address: '' };
    }
  };

  if (accounts.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Parties</h2>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search parties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredParties.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">
              {searchTerm ? "No parties found matching your search" : "No parties found"}
            </p>
          </Card>
        ) : (
          filteredParties.map((account) => {
            const details = getPartyDetails(account);
            return (
              <Card 
                key={account.id} 
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onAccountClick(account)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {account.name}
                    </h3>
                    {details.phone_number && (
                      <p className="text-sm text-gray-600 mb-0.5">
                        <span className="font-medium">Phone:</span> {details.phone_number}
                      </p>
                    )}
                    {details.gstin && (
                      <p className="text-sm text-gray-600 mb-0.5">
                        <span className="font-medium">GSTIN:</span> {details.gstin}
                      </p>
                    )}
                    {details.address && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Address:</span> {details.address}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className={`text-lg font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatBalance(account.balance)}
                    </p>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingParty(account);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Are you sure you want to delete this party?")) {
                            onDelete(account.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {editingParty && (
        <EditVendorDialog
          open={!!editingParty}
          onOpenChange={(open) => !open && setEditingParty(null)}
          vendor={{
            id: editingParty.id,
            businessName: editingParty.name,
            ...getPartyDetails(editingParty)
          }}
          onSubmit={handleEditParty}
        />
      )}
    </div>
  );
};
