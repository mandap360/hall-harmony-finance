/** User-facing copy used across forms, validation, and toasts. */
export const TOAST_TITLES = {
  ERROR: 'Error',
  SUCCESS: 'Success',
} as const;

export const BUTTON_LABELS = {
  CANCEL: 'Cancel',
  SAVING: 'Saving…',
  UPDATING: 'Updating…',
  ADDING: 'Adding…',
} as const;

export const CRUD_MESSAGES = {
  fetchFailed: (entity: string) => `Failed to fetch ${entity}`,
  addFailed: (entity: string) => `Failed to add ${entity}`,
  updateFailed: (entity: string) => `Failed to update ${entity}`,
  deleteFailed: (entity: string) => `Failed to delete ${entity}`,
  allocateFailed: 'Failed to allocate',
  removeAllocationFailed: 'Failed to remove allocation',
  added: (entity: string) => `${entity} added successfully`,
  updated: (entity: string) => `${entity} updated`,
  updatedSuccessfully: (entity: string) => `${entity} updated successfully`,
  deleted: (entity: string) => `${entity} deleted`,
  deletedSuccessfully: (entity: string) => `${entity} deleted successfully`,
  created: (entity: string) => `${entity} created`,
  cancelled: (entity: string) => `${entity} cancelled`,
  allocated: 'Income allocated',
  allocationRecorded: 'Allocation recorded',
  allocationRemoved: 'Allocation removed',
} as const;

export const VALIDATION_MESSAGES = {
  nameRequired: { title: 'Name required', description: 'Please enter the client name.' },
  phoneInvalid: { title: 'Invalid phone number', description: 'Phone number must be exactly 10 digits.' },
  alternatePhoneInvalid: { title: 'Invalid alternate number', description: 'Alternate number must be exactly 10 digits.' },
  addressRequired: { title: 'Address required', description: 'Please enter the client address.' },
  emailInvalid: { title: 'Invalid email', description: 'Please enter a valid email address.' },
  rentInvalid: { title: 'Invalid rent amount', description: 'Rent Finalized must be a number greater than or equal to 0.' },
  timeRangeInvalid: { title: 'Invalid time range', description: 'End date/time must be after start date/time.' },
  bookingConflict: (detail: string) => ({
    title: 'Booking conflict',
    description: `This booking overlaps with ${detail}.`,
  }),
  bookingConflictOnUpdate: (detail: string) => ({
    title: 'Booking conflict',
    description: `This time change overlaps with ${detail}.`,
  }),
  paymentFieldsRequired: { title: 'Missing fields', description: 'Amount, account, and category are required' },
  cannotEditDefaultCategory: { title: 'Cannot edit default category' },
  cannotDeleteDefaultCategory: { title: 'Cannot delete default category' },
} as const;

export const ENTITY_NAMES = {
  account: 'account',
  accounts: 'accounts',
  booking: 'booking',
  bookings: 'bookings',
  bill: 'bill',
  bills: 'bills',
  client: 'client',
  clients: 'clients',
  vendor: 'vendor',
  vendors: 'vendors',
  category: 'category',
  categories: 'categories',
  transaction: 'transaction',
  transactions: 'transactions',
} as const;
