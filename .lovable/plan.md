

## Goal

Refactor the Secondary Income tab in Edit Booking so the user can: (1) **receive** lump-sum secondary income for a booking without allocating it, (2) **allocate** any received amount across secondary-income categories later, and (3) **refund** any unallocated balance back to the client per receipt.

## Approach: reuse existing tables, no DB changes

- Secondary receipts → rows in `Transactions` (`type='Income'`, `booking_id`, `to_account_id`, description prefixed with `[SEC] ` so we can classify untagged/unallocated receipts).
- Allocations → rows in `IncomeAllocations` pointing to categories where `is_secondary_income = true`.
- Refunds → rows in `Transactions` (`type='Refund'`, `from_account_id`, `booking_id`).
- Stop writing to `SecondaryIncome` table (kept for legacy reads only).

Receipt status drives via `transaction_status`:
- `Available` (nothing allocated/refunded)
- `Partially Allocated` (some allocated, balance remaining)
- `Fully Allocated` (allocations + refund = received amount)

## Changes

### 1. `src/hooks/useIncomeAllocations.ts`
- Add `removeAllocation(id, transactionId)` that deletes an allocation row and recomputes `transaction_status` of the parent transaction (sum of remaining allocations + any refund tied to same booking → set Available / Partially / Fully).
- Fix the existing `allocate` race: recompute total from a fresh DB read of allocations for the transaction (current code uses stale local state).
- Expose helper `getAllocationsForTransaction(transactionId)` selector.

### 2. `src/components/EditBookingDialog.tsx` — Secondary Income tab rewrite

**Layout:**
```text
[Summary strip]
  Total Received | Total Allocated | Total Refunded | Unallocated

[+ Record Secondary Receipt]   ← form: amount, date, to_account, description

[Receipts list]
  Each receipt card:
    ₹10,000 · 15 Apr · Bank A · "[SEC] Decoration advance"   [Status badge]
    ─ Allocations ─
      Decoration  ₹4,000  [×]
      Catering    ₹3,000  [×]
      [+ Allocate]  category▾  amount  [Add]
    Unallocated: ₹3,000
      [Refund unallocated to client]  from account▾  [Refund]
```

**Behavior:**
- "Record Secondary Receipt" → `addTransaction({ type:'Income', booking_id, entity_id: clientId, to_account_id, amount, transaction_date, description: '[SEC] '+desc, transaction_status:'Available' })`. No allocation created.
- Receipts list = `Transactions` for booking with `type='Income'` AND (description starts with `[SEC] ` OR has at least one allocation on a secondary-income category). Strip the `[SEC] ` prefix in display.
- Allocate row → `useIncomeAllocations.allocate({ transaction_id, category_id, amount })`. Cap input at remaining unallocated. Category dropdown = `secondaryIncomeCategories` from `useAccountCategories`.
- Remove allocation → `removeAllocation` from the hook.
- Refund → `addTransaction({ type:'Refund', from_account_id, booking_id, entity_id: clientId, amount: unallocated, description:'[SEC-REFUND] for receipt <id>' })`, then update parent receipt's `transaction_status` to `Fully Allocated`. Track refund-per-receipt by storing `[SEC-REFUND] for receipt <uuid>` in description (parsed back when computing per-receipt unallocated balance).

### 3. `src/components/EditBookingDialog.tsx` — Payments tab
- Filter out receipts whose description starts with `[SEC] ` so each receipt appears in exactly one tab.

### 4. `src/hooks/useBookings.ts`
- `paidAmount` = sum of `Income` transactions where description does NOT start with `[SEC] ` minus primary refunds.
- `secondaryIncomeNet` = sum of `Income` transactions where description starts with `[SEC] ` minus refunds tagged `[SEC-REFUND]`.
- Stop reading from `SecondaryIncome` table.

### 5. Delete unused `SecondaryIncome` writes
- Remove any remaining `supabase.from('SecondaryIncome').insert/update/delete` calls (search & strip).

## Out of scope (follow-ups available)

- Refund flow on the Payments (rent) tab — same pattern.
- Migrating legacy `SecondaryIncome` rows into the new model.
- Replacing the `[SEC]` description prefix with a proper boolean column on `Transactions`.
- Editing an existing allocation amount in place (current plan: delete + re-add).

