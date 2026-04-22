

## Goal

Replace the single-row allocation form in **Edit Booking → Secondary Income** with a multi-row draft form so multiple categories can be allocated in one click. No DB schema changes.

## Current behavior (problem)

- One category + one amount + Allocate button.
- Each click writes one `IncomeAllocations` row immediately and re-renders.
- Adding 5 categories = 5 separate clicks, 5 toasts, 5 round-trips.

## New behavior

In the **Allocate to Categories** card:

- Show a list of **draft rows**, each with: Category dropdown · Amount input · trash icon to remove the row.
- A **+** icon button to the right of the last row's amount appends another empty draft row.
- A single **Allocate** button below the list commits all draft rows in one go.
- After commit: drafts clear, list of saved allocations refreshes.

Existing saved allocations continue to render above the draft form (unchanged), each removable individually.

### Validation rules per click of Allocate

- Skip rows with no category or amount ≤ 0.
- Each draft category must be unique within the draft (no duplicate rows in the same submit).
- Each draft category must not already exist in saved `poolAllocations` for this booking.
- Sum of draft amounts must be ≤ `secUnallocated`.
- If any rule fails, show a toast and do not commit.

### Commit behavior

- Loop draft rows and call existing `allocate(...)` per row inside a single handler.
- Show one success toast: "Allocated N categories".
- Suppress the per-row toast inside this multi-allocate path (or keep `useIncomeAllocations.allocate` as-is and just show one summary toast at the end — accept the minor duplicate toasts; preferred: add a `silent` flag to `allocate` to skip its internal toast when called from batch).

### Available categories per row

- The dropdown for each draft row hides:
  - categories already saved in `poolAllocations`
  - categories selected in other draft rows
- This keeps the "one allocation per category per booking" rule intact.

## UI sketch

```text
Allocate to Categories
Pool available: ₹X · Each category can be allocated only once.

[saved allocation rows ...]
─────────────────────────────────
[ Category ▾ ] [ Amount ] [+] [🗑]
[ Category ▾ ] [ Amount ]     [🗑]
[ Allocate ]   (disabled if no valid drafts or sum > pool)
```

The **+** sits to the right of the amount field of the last draft row. Earlier rows show only the trash icon in that slot.

## Files to update

- `src/components/EditBookingDialog.tsx`
  - Replace single `allocCategoryId` / `allocAmount` state with `draftAllocations: { id: string; categoryId: string; amount: string }[]`.
  - Add handlers: `addDraftRow`, `updateDraftRow`, `removeDraftRow`, `handleAllocateAll`.
  - Render draft rows + single Allocate button.
- `src/hooks/useIncomeAllocations.ts`
  - Add optional `silent?: boolean` arg to `allocate(...)` to suppress its toast when batching (keeps existing single-call sites unchanged).

## Out of scope

- Editing an existing saved allocation amount in place (still delete + re-add).
- Refund card (unchanged).
- Payments tab (unchanged).

