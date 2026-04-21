
## Goal

Restore a working “old-style” Secondary Income flow in Edit Booking:

- Money is received only from the **Payments** tab.
- The special pool category is **Secondary Deposit**.
- The **Secondary Income** tab only does:
  - show received / allocated / refunded / remaining
  - allocate that pool to `AccountCategories` where `type='income'` and `is_secondary_income=true`
  - refund any unallocated balance from a **Cash/Bank** account
- Each secondary category can be allocated **only once per booking**.
- Rent totals must come only from the **Rent** category.

## What is broken today and why

### 1. Wrong anchor category
Current code still searches for a non-secondary income category named **“Secondary Income”** to identify the pool. The database now has **“Secondary Deposit”** instead, so pool detection breaks.

### 2. `transaction_status` is being used in the wrong way
Right now, when a secondary receipt is recorded, the code immediately creates an `IncomeAllocation` for the full amount to the anchor category. Then `useIncomeAllocations.recomputeStatus()` sees:

- transaction amount = full receipt
- allocation sum = full receipt

So it marks that transaction as **`Fully Allocated`**.

That is technically true for the anchor allocation, but it is wrong for your business flow, because:
- the money has only been parked in **Secondary Deposit**
- it has **not** yet been allocated to the real secondary income categories
- the UI then behaves as if nothing is left to allocate

### 3. Pool allocations are attached to one source transaction
The current “single pool” code allocates secondary categories onto the first pool transaction. That makes per-transaction status unreliable for a booking-level pool and causes confusing totals.

### 4. Refund logic is inconsistent
`EditBookingDialog` writes booking-level refund descriptions like:
- `[SEC-REFUND] for booking <bookingId>`

But `useIncomeAllocations.recomputeStatus()` still looks for:
- `[SEC-REFUND] for receipt <transactionId>`

So status recalculation and refund tracking no longer agree.

## Recommended design

## No new schema for secondary deposit flow
The working version can be built with existing tables:

- `Transactions` for money movement
- `IncomeAllocations` for category allocations
- `AccountCategories` for Rent / Secondary Deposit / real secondary categories

## One data cleanup for accounts
There are currently **4** `Accounts` rows with `account_type='party'`, and there are **0** `Transactions` referencing them. So removing them is safe.

## Build plan

### 1. Remove Party from accounts completely
Update the app so accounts only support:

- `cash_bank`
- `owners_capital`

Changes:
- Remove `party` from the account type unions in `useAccounts` and `AddAccountDialog`
- Remove the Party option from the Add Account dialog
- Remove the Parties section from `AccountsPage`
- Keep transaction/account pickers limited to Cash/Bank where appropriate

Database/data work:
- Delete existing `Accounts` rows where `account_type='party'`
- Optionally harden the database afterward so future inserts cannot use `party`

### 2. Re-anchor the pool to `Secondary Deposit`
Change every place that currently uses **Secondary Income** as the pool bucket to use:

- category name = `Secondary Deposit`
- category type = `income`
- `is_secondary_income = false`

This becomes the only pool source for the Secondary Income tab.

### 3. Restore the expected old UI in Edit Booking
#### Payments tab
- Keep the payment entry UI
- Category dropdown should show only non-secondary income categories
- `Secondary Deposit` remains available here as the pool category
- Payment history continues to show receipts added from this tab

Behavior:
- If payment category = `Rent`, it contributes to rent received
- If payment category = `Secondary Deposit`, it contributes to the secondary pool
- Other non-secondary income categories stay primary/non-secondary and do not appear in the secondary allocation UI

#### Secondary Income tab
Remove the receipt form entirely.

Show only:
- Summary cards:
  - Received
  - Allocated
  - Refunded
  - Remaining
- Existing allocations list
- Allocation form
- Refund form

Allocation form behavior:
- Source amount = total booking payments allocated to `Secondary Deposit`
- Available categories = `AccountCategories` with:
  - `type='income'`
  - `is_secondary_income=true`
  - not already allocated for this booking
- One row per category per booking
- Allocation amount cannot exceed remaining pool

Refund behavior:
- Refund unallocated balance only
- Refund account dropdown = only `Accounts` with `account_type='cash_bank'`
- Refund creates a `Transactions` row of type `Refund` linked to the booking
- Refund decreases remaining pool immediately

### 4. Stop relying on `transaction_status` for secondary pool availability
For this flow, the source of truth should be booking-level math, not transaction status.

Use:
- `received = sum(booking income txs allocated to Secondary Deposit)`
- `allocated = sum(booking allocations to categories where is_secondary_income=true)`
- `refunded = sum(booking refund txs tagged as secondary refunds)`
- `remaining = received - allocated - refunded`

Implementation effect:
- The Secondary Income tab will not disappear or lock because a source transaction became `Fully Allocated`
- Allocate/refund buttons will be driven by `remaining > 0`, not by transaction status

### 5. Fix booking calculations so rent and secondary stay separate
Update `useBookings` so:

- `rentReceived` = only allocations where category name is `Rent`
- `secondaryIncomeNet` = amounts received into `Secondary Deposit` minus secondary refunds
- Secondary Deposit must never inflate rent totals

This restores the earlier rule you called out:
- Rent received should only include **Rent**
- Secondary Deposit is only the pool for later allocation/refund

### 6. Keep the “allocate once per category per booking” rule
In the Secondary Income tab:

- once a secondary category has an allocation for the booking, remove it from the dropdown
- deleting that allocation makes it available again
- no duplicate category rows for the same booking

This matches the pre-refactor business rule from the earlier version.

## Files to update

- `src/components/AddAccountDialog.tsx`
- `src/components/AccountsPage.tsx`
- `src/hooks/useAccounts.ts`
- `src/components/EditBookingDialog.tsx`
- `src/hooks/useBookings.ts`
- `src/hooks/useIncomeAllocations.ts` only to stop secondary-flow dependence on receipt-style status assumptions
- any labels/badges still showing “Secondary Income” where they should say `Secondary Deposit` for the pool category

## Database/data work needed

### Required data cleanup
- Delete `Accounts` rows with `account_type='party'`

### Optional hardening
- Add database validation so new account rows can only use:
  - `cash_bank`
  - `owners_capital`

No schema change is required for the Secondary Deposit allocation/refund flow itself.

## Expected result after implementation

- User records a payment in **Payments** with category **Secondary Deposit**
- That amount appears under **Secondary Income → Received**
- User can allocate that amount later to true secondary categories
- Each category can be used once per booking
- User can refund the leftover from a Cash/Bank account
- Rent totals stay tied only to **Rent**
- No secondary receipt form exists in the Secondary Income tab
- No Party account type exists anywhere in the app
