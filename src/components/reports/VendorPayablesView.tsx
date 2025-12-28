import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { AccountTransactions } from "@/components/AccountTransactions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Account } from "@/hooks/useAccounts";

interface VendorPayablesViewProps {
  onBack: () => void;
}

/**
 * Payables = party accounts with balance > 0 (what we owe them).
 * Clicking a party opens the existing AccountTransactions view for that party.
 */
export const VendorPayablesView = ({ onBack }: VendorPayablesViewProps) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payableParties, setPayableParties] = useState<Account[]>([]);
  const [selectedParty, setSelectedParty] = useState<Account | null>(null);

  const orgId = profile?.organization_id ?? null;

  useEffect(() => {
    let cancelled = false;

    const fetchPayables = async () => {
      if (!orgId) return;

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("accounts")
          .select("*")
          .eq("organization_id", orgId)
          .eq("account_type", "party")
          .gt("balance", 0)
          .order("balance", { ascending: false });

        if (error) throw error;
        if (cancelled) return;

        setPayableParties((data || []) as Account[]);
      } catch (e) {
        console.error("Error fetching payables parties:", e);
        if (!cancelled) setPayableParties([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPayables();

    return () => {
      cancelled = true;
    };
  }, [orgId]);

  const totalPayables = useMemo(
    () => payableParties.reduce((sum, p) => sum + (p.balance || 0), 0),
    [payableParties]
  );

  if (selectedParty) {
    return (
      <AccountTransactions
        account={selectedParty}
        onBack={() => setSelectedParty(null)}
        showFilters={true}
        showBalance={false}
      />
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <section className="mx-auto w-full max-w-6xl p-4">
          <div className="text-center py-12 text-muted-foreground">Loading…</div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-6xl p-4 space-y-6">
        <header className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Button>

          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Payables</div>
            <div className="text-lg font-semibold text-foreground">
              <CurrencyDisplay amount={totalPayables} displayMode="text-only" />
            </div>
          </div>
        </header>

        <section aria-label="Payables parties" className="space-y-3">
          <h1 className="text-xl font-semibold text-foreground">Payables</h1>

          {payableParties.length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-center">
              <p className="text-foreground font-medium">No payables</p>
              <p className="text-sm text-muted-foreground mt-1">
                No party accounts currently have a balance greater than 0.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {payableParties.map((party) => (
                <Card
                  key={party.id}
                  className="p-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setSelectedParty(party)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {party.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Party account
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Payable</div>
                      <div className="font-semibold text-foreground">
                        <CurrencyDisplay amount={party.balance} displayMode="text-only" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
};
