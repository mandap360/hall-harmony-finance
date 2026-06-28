import type { useToast } from '@/hooks/use-toast';
import { CRUD_MESSAGES, TOAST_TITLES } from '@/utils/messages';

type ToastFn = ReturnType<typeof useToast>['toast'];

export function showErrorToast(toast: ToastFn, description: string, title = TOAST_TITLES.ERROR) {
  toast({ title, description, variant: 'destructive' });
}

export function showSuccessToast(toast: ToastFn, description: string, title = TOAST_TITLES.SUCCESS) {
  toast({ title, description });
}

export function toastFetchError(toast: ToastFn, entity: string) {
  showErrorToast(toast, CRUD_MESSAGES.fetchFailed(entity));
}

export function toastAddError(toast: ToastFn, entity: string) {
  showErrorToast(toast, CRUD_MESSAGES.addFailed(entity));
}

export function toastUpdateError(toast: ToastFn, entity: string) {
  showErrorToast(toast, CRUD_MESSAGES.updateFailed(entity));
}

export function toastDeleteError(toast: ToastFn, entity: string) {
  showErrorToast(toast, CRUD_MESSAGES.deleteFailed(entity));
}

export function toastAdded(toast: ToastFn, entity: string) {
  showSuccessToast(toast, CRUD_MESSAGES.added(entity));
}

export function toastUpdated(toast: ToastFn, entity: string, full = false) {
  showSuccessToast(
    toast,
    full ? CRUD_MESSAGES.updatedSuccessfully(entity) : CRUD_MESSAGES.updated(entity),
  );
}

export function toastDeleted(toast: ToastFn, entity: string, full = false) {
  showSuccessToast(
    toast,
    full ? CRUD_MESSAGES.deletedSuccessfully(entity) : CRUD_MESSAGES.deleted(entity),
  );
}
