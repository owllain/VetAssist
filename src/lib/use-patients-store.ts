'use client';

import { useSyncExternalStore, useCallback } from 'react';

export interface Patient {
  id: string;
  name: string;
  species: 'perro' | 'gato';
  weight: number;
  weightUnit: 'kg' | 'lb';
  notes?: string;
  createdAt: number;
}

const PATIENTS_KEY = 'vetcalc-patients';
const MAX_PATIENTS = 20;

let listeners: Set<() => void> = new Set();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSnapshot(): Patient[] {
  try { return JSON.parse(localStorage.getItem(PATIENTS_KEY) || '[]'); } catch { return []; }
}

function getServerSnapshot(): Patient[] {
  return [];
}

function emitChange() {
  listeners.forEach((l) => l());
  dispatchEvent(new StorageEvent('storage'));
}

function persistPatients(patients: Patient[]) {
  try {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
    emitChange();
  } catch { /* ignore */ }
}

export function usePatients() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useAddPatient() {
  return useCallback((patient: Omit<Patient, 'id' | 'createdAt'>) => {
    const patients = getSnapshot();
    if (patients.length >= MAX_PATIENTS) return false;
    const newPatient: Patient = {
      ...patient,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    persistPatients([newPatient, ...patients]);
    return true;
  }, []);
}

export function useRemovePatient() {
  return useCallback((id: string) => {
    const patients = getSnapshot().filter((p) => p.id !== id);
    persistPatients(patients);
  }, []);
}

export function useUpdatePatient() {
  return useCallback((id: string, data: Partial<Patient>) => {
    const patients = getSnapshot().map((p) =>
      p.id === id ? { ...p, ...data } : p
    );
    persistPatients(patients);
  }, []);
}
