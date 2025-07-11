// Form utility functions and types
export interface FormFieldError {
  field: string;
  message: string;
}

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule[];
}

export const formUtils = {
  // Validate a single field
  validateField(value: any, rules: ValidationRule[]): string | null {
    for (const rule of rules) {
      if (rule.required && (!value || value === '')) {
        return rule.message;
      }

      if (rule.min && typeof value === 'number' && value < rule.min) {
        return rule.message;
      }

      if (rule.max && typeof value === 'number' && value > rule.max) {
        return rule.message;
      }

      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        return rule.message;
      }

      if (rule.custom && !rule.custom(value)) {
        return rule.message;
      }
    }

    return null;
  },

  // Validate entire form
  validateForm(data: Record<string, any>, schema: ValidationSchema): FormFieldError[] {
    const errors: FormFieldError[] = [];

    for (const [fieldName, rules] of Object.entries(schema)) {
      const error = this.validateField(data[fieldName], rules);
      if (error) {
        errors.push({ field: fieldName, message: error });
      }
    }

    return errors;
  },

  // Reset form data to initial state
  resetFormData<T extends Record<string, any>>(initialData: T): T {
    return { ...initialData };
  },

  // Common validation rules
  rules: {
    required: (message: string = 'This field is required'): ValidationRule => ({
      required: true,
      message
    }),

    minAmount: (min: number = 0): ValidationRule => ({
      min,
      message: `Amount must be at least ₹${min}`
    }),

    email: (): ValidationRule => ({
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    }),

    phone: (): ValidationRule => ({
      pattern: /^[6-9]\d{9}$/,
      message: 'Please enter a valid 10-digit phone number'
    }),

    gstin: (): ValidationRule => ({
      pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      message: 'Please enter a valid GSTIN'
    })
  }
};

// Common form validation schemas
export const validationSchemas = {
  expense: {
    vendorName: [formUtils.rules.required('Vendor is required')],
    category: [formUtils.rules.required('Category is required')],
    amount: [
      formUtils.rules.required('Amount is required'),
      formUtils.rules.minAmount(0.01)
    ],
    date: [formUtils.rules.required('Date is required')]
  } as ValidationSchema,

  booking: {
    clientName: [formUtils.rules.required('Client name is required')],
    eventName: [formUtils.rules.required('Event name is required')],
    startDatetime: [formUtils.rules.required('Start date is required')],
    endDatetime: [formUtils.rules.required('End date is required')],
    rentFinalized: [
      formUtils.rules.required('Rent amount is required'),
      formUtils.rules.minAmount(1)
    ]
  } as ValidationSchema,

  vendor: {
    businessName: [formUtils.rules.required('Business name is required')],
    phoneNumber: [formUtils.rules.phone()],
    gstin: [formUtils.rules.gstin()]
  } as ValidationSchema
};