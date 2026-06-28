import { Button } from '@/components/ui/button';
import { BUTTON_LABELS } from '@/utils/messages';

interface DialogFormFooterProps {
  onCancel: () => void;
  submitLabel: string;
  submitting?: boolean;
  submittingLabel?: string;
  submitDisabled?: boolean;
  cancelLabel?: string;
}

export const DialogFormFooter = ({
  onCancel,
  submitLabel,
  submitting = false,
  submittingLabel = BUTTON_LABELS.SAVING,
  submitDisabled = false,
  cancelLabel = BUTTON_LABELS.CANCEL,
}: DialogFormFooterProps) => (
  <div className="flex justify-end gap-2 pt-2">
    <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
      {cancelLabel}
    </Button>
    <Button type="submit" disabled={submitting || submitDisabled}>
      {submitting ? submittingLabel : submitLabel}
    </Button>
  </div>
);
