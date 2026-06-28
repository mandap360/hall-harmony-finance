import { useCallback, useRef, useState } from 'react';

/** Prevents duplicate form submissions while an async action is in flight. */
export function useSubmitGuard() {
  const [submitting, setSubmitting] = useState(false);
  const inFlightRef = useRef(false);

  const reset = useCallback(() => {
    inFlightRef.current = false;
    setSubmitting(false);
  }, []);

  const run = useCallback(async (fn: () => Promise<void>) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setSubmitting(true);
    try {
      await fn();
    } finally {
      inFlightRef.current = false;
      setSubmitting(false);
    }
  }, []);

  return { submitting, reset, run };
}
