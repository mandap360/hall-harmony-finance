/** Exactly 10 digits (Indian mobile). */
export const PHONE_REGEX = /^\d{10}$/;

/** Standard email format check (optional field: empty is valid). */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizePhoneInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

export function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test(value);
}

export function isValidOptionalPhone(value: string): boolean {
  if (!value.trim()) return true;
  return isValidPhone(value);
}

export function isValidEmail(value: string): boolean {
  if (!value.trim()) return true;
  return EMAIL_REGEX.test(value.trim());
}

export function parseAmount(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = parseFloat(trimmed);
  return Number.isNaN(n) ? null : n;
}

export function isValidAmount(value: string, min = 0): boolean {
  const n = parseAmount(value);
  return n !== null && n >= min;
}

/** Allow typing decimal amounts with up to 2 fractional digits. */
export function sanitizeAmountInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  if (parts[1]?.length > 2) return parts[0] + '.' + parts[1].slice(0, 2);
  return cleaned;
}
