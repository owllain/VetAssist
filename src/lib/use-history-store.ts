'use client';

import { useSyncExternalStore, useCallback, useRef } from 'react';

const STORAGE_KEY = 'vetcalc-history';

interface HistoryEntry {
  type: string;
  timestamp: number;
  summary: string;
}

let listeners: Set<() => void> = new Set();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSnapshot(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function getServerSnapshot(): HistoryEntry[] {
  return [];
}

function emitChange() {
  listeners.forEach((l) => l());
}

export function useHistory(type?: string) {
  const allHistory = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return type ? allHistory.filter((h) => h.type === type) : allHistory;
}

export function useAddHistory() {
  const pendingRef = useRef<HistoryEntry[]>([]);

  const flush = useCallback(() => {
    if (pendingRef.current.length === 0) return;
    try {
      const existing = getSnapshot();
      const updated = [...pendingRef.current.reverse(), ...existing].slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      pendingRef.current = [];
      emitChange();
    } catch { /* ignore */ }
  }, []);

  const addHistory = useCallback(
    (entry: HistoryEntry) => {
      pendingRef.current.push(entry);
      flush();
    },
    [flush]
  );

  return addHistory;
}

export function useClearHistory() {
  return useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '[]');
      emitChange();
    } catch { /* ignore */ }
  }, []);
}

export type { HistoryEntry };
