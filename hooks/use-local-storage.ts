"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * A hook that syncs state to localStorage automatically.
 * Use this as a drop-in replacement for useState when you want persistence.
 *
 * @param key - Unique localStorage key
 * @param initialValue - Default value if nothing in storage
 * @param debounceMs - Debounce delay for writes (default 300ms)
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  debounceMs: number = 300,
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  // Initialize state from localStorage or use initialValue
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    return initialValue;
  });

  // Debounce timer ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync to localStorage on state change (debounced)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.warn(`Error writing to localStorage key "${key}":`, error);
      }
    }, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, state, debounceMs]);

  // Function to clear this specific storage key
  const clearStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key]);

  return [state, setState, clearStorage];
}
