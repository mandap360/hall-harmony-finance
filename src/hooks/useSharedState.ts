import { useEffect, useRef, useState } from 'react';

/**
 * Tiny shared in-memory store factory.
 * - `data` lives at module scope: every component using the same store sees the same value.
 * - On each mutation, call `set(...)` to broadcast to all subscribers.
 * - `useStore()` is a React hook that subscribes a component to the store.
 */
export interface SharedStore<T> {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (fn: () => void) => () => void;
  useStore: () => T;
}

export function createSharedStore<T>(initial: T): SharedStore<T> {
  let data: T = initial;
  const subs = new Set<() => void>();

  const get = () => data;
  const set: SharedStore<T>['set'] = (next) => {
    data = typeof next === 'function' ? (next as (p: T) => T)(data) : next;
    subs.forEach((fn) => fn());
  };
  const subscribe = (fn: () => void) => {
    subs.add(fn);
    return () => {
      subs.delete(fn);
    };
  };

  const useStore = () => {
    const [, setTick] = useState(0);
    const mounted = useRef(true);
    useEffect(() => {
      mounted.current = true;
      const unsub = subscribe(() => {
        if (mounted.current) setTick((t) => t + 1);
      });
      return () => {
        mounted.current = false;
        unsub();
      };
    }, []);
    return data;
  };

  return { get, set, subscribe, useStore };
}

/**
 * Coalesce concurrent fetch calls so multiple components mounting at once
 * trigger only one network request.
 */
export function createSingleFlight<T>() {
  let inflight: Promise<T> | null = null;
  return (fn: () => Promise<T>): Promise<T> => {
    if (inflight) return inflight;
    inflight = fn().finally(() => {
      inflight = null;
    });
    return inflight;
  };
}
