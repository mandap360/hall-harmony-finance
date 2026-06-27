import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { sanitizeAmountInput } from '@/utils/validation';

export interface AmountInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'type' | 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

const amountInputClass =
  '[appearance:textfield] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
  ({ value, onChange, className, onWheel, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(sanitizeAmountInput(e.target.value));
    };

    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      e.currentTarget.blur();
      onWheel?.(e);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        onWheel={handleWheel}
        className={cn(amountInputClass, className)}
        {...props}
      />
    );
  },
);
AmountInput.displayName = 'AmountInput';
