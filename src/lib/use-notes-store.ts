'use client';

import { useSyncExternalStore, useCallback } from 'react';

export interface Note {
  id: string;
  text: string;
  createdAt: number;
  pinned: boolean;
}

const NOTES_KEY = 'vetcalc-notes';
const MAX_NOTES = 50;

let listeners: Set<() => void> = new Set();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSnapshot(): Note[] {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); } catch { return []; }
}

function getServerSnapshot(): Note[] {
  return [];
}

function emitChange() {
  listeners.forEach((l) => l());
  dispatchEvent(new StorageEvent('storage', { key: NOTES_KEY }));
}

function persistNotes(notes: Note[]) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    emitChange();
  } catch { /* ignore */ }
}

export function useNotes() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useAddNote() {
  return useCallback((text: string) => {
    const notes = getSnapshot();
    const newNote: Note = {
      id: crypto.randomUUID(),
      text: text.trim(),
      createdAt: Date.now(),
      pinned: false,
    };
    const updated = [newNote, ...notes].slice(0, MAX_NOTES);
    persistNotes(updated);
  }, []);
}

export function useRemoveNote() {
  return useCallback((id: string) => {
    const notes = getSnapshot().filter((n) => n.id !== id);
    persistNotes(notes);
  }, []);
}

export function useTogglePin() {
  return useCallback((id: string) => {
    const notes = getSnapshot().map((n) =>
      n.id === id ? { ...n, pinned: !n.pinned } : n
    );
    persistNotes(notes);
  }, []);
}
