'use client';

import { useSyncExternalStore, useCallback } from 'react';
import type { FavoriteMed } from './favorites';

const FAVORITES_KEY = 'vetcalc-favorites';

let listeners: Set<() => void> = new Set();

// Cached snapshot to avoid infinite loop in useSyncExternalStore
let cachedSnapshot: FavoriteMed[] = [];
let cachedRaw: string | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSnapshot(): FavoriteMed[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY) || '[]';
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedSnapshot = JSON.parse(raw);
    }
    return cachedSnapshot;
  } catch {
    return [];
  }
}

function getServerSnapshot(): FavoriteMed[] {
  return [];
}

function emitChange() {
  cachedRaw = null;
  listeners.forEach((l) => l());
}

function persistFavorites(favs: FavoriteMed[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    emitChange();
  } catch { /* ignore */ }
}

export function useFavorites() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useToggleFavorite() {
  return useCallback((med: FavoriteMed) => {
    const favs = getSnapshot();
    const idx = favs.findIndex((f) => f.medicationId === med.medicationId);
    if (idx >= 0) {
      favs.splice(idx, 1);
    } else {
      favs.push(med);
    }
    persistFavorites([...favs]);
  }, []);
}

export function useIsFavorite(medicationId: string) {
  const favorites = useFavorites();
  return favorites.some((f) => f.medicationId === medicationId);
}

export function useRemoveFavorite() {
  return useCallback((medicationId: string) => {
    const favs = getSnapshot().filter((f) => f.medicationId !== medicationId);
    persistFavorites(favs);
  }, []);
}
