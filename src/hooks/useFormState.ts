import { useState, useCallback } from 'react';
import { formUtils, ValidationSchema, FormFieldError } from '@/utils/formUtils';

// Generic form state management hook
export function useFormState<T extends Record<string, any>>(
  initialData: T,
  validationSchema?: ValidationSchema
) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<FormFieldError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors.length > 0) {
      setErrors(prev => prev.filter(error => error.field !== field));
    }
  }, [errors.length]);

  const updateFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors([]);
    setIsSubmitting(false);
  }, [initialData]);

  const validateForm = useCallback((): boolean => {
    if (!validationSchema) return true;

    const validationErrors = formUtils.validateForm(formData, validationSchema);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  }, [formData, validationSchema]);

  const getFieldError = useCallback((field: keyof T): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  }, [errors]);

  const hasErrors = errors.length > 0;

  return {
    formData,
    errors,
    isSubmitting,
    hasErrors,
    updateField,
    updateFields,
    resetForm,
    validateForm,
    getFieldError,
    setIsSubmitting
  };
}